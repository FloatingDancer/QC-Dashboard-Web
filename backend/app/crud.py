from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from . import models, schemas

# Product CRUD
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_code(db: Session, product_code: str):
    return db.query(models.Product).filter(models.Product.product_code == product_code).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        product_code=product.product_code,
        product_name=product.product_name,
        ucl_limit=product.ucl_limit,
        lcl_limit=product.lcl_limit
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if db_product:
        db_product.product_name = product.product_name
        db_product.ucl_limit = product.ucl_limit
        db_product.lcl_limit = product.lcl_limit
        db.commit()
        db.refresh(db_product)
    return db_product

# Inspection CRUD
def get_inspections(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.QCInspection).order_by(models.QCInspection.inspection_date.desc()).offset(skip).limit(limit).all()

def create_inspection(db: Session, inspection: schemas.QCInspectionCreate):
    insp_date = inspection.inspection_date or datetime.utcnow()
    
    batch_num = inspection.batch_number
    if not batch_num:
        # Get product code
        product = db.query(models.Product).filter(models.Product.id == inspection.product_id).first()
        prod_suffix = product.product_code.replace("-", "") if product else "UNKNOWN"
        
        # Get date string (yymmdd)
        date_str = insp_date.strftime('%y%m%d')
        
        # Count existing inspections for this product on this date
        start_of_day = datetime.combine(insp_date.date(), datetime.min.time())
        end_of_day = datetime.combine(insp_date.date(), datetime.max.time())
        
        existing_count = db.query(models.QCInspection).filter(
            models.QCInspection.product_id == inspection.product_id,
            models.QCInspection.inspection_date >= start_of_day,
            models.QCInspection.inspection_date <= end_of_day
        ).count()
        
        batch_seq = existing_count + 1
        batch_num = f"BATCH-{date_str}-{prod_suffix}-{batch_seq}"

    db_inspection = models.QCInspection(
        product_id=inspection.product_id,
        inspection_date=insp_date,
        batch_number=batch_num,
        total_inspected=inspection.total_inspected,
        total_passed=inspection.total_passed,
        total_failed=inspection.total_failed,
        inspector_name=inspection.inspector_name,
        vendor_name=inspection.vendor_name
    )
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    
    # Save defects
    for defect in inspection.defects:
        db_defect = models.DefectDetail(
            inspection_id=db_inspection.id,
            defect_type=defect.defect_type,
            quantity=defect.quantity
        )
        db.add(db_defect)
    
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

# Dashboard Analytics Queries
def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    today_start = datetime.combine(date.today(), datetime.min.time())
    
    # Overall metrics
    overall_stats = db.query(
        func.sum(models.QCInspection.total_inspected).label("inspected"),
        func.sum(models.QCInspection.total_passed).label("passed"),
        func.sum(models.QCInspection.total_failed).label("failed")
    ).first()
    
    inspected_all = overall_stats.inspected or 0
    passed_all = overall_stats.passed or 0
    failed_all = overall_stats.failed or 0
    yield_all = (passed_all / inspected_all * 100) if inspected_all > 0 else 100.0
    
    # Today metrics
    today_stats = db.query(
        func.sum(models.QCInspection.total_inspected).label("inspected"),
        func.sum(models.QCInspection.total_passed).label("passed"),
        func.sum(models.QCInspection.total_failed).label("failed")
    ).filter(models.QCInspection.inspection_date >= today_start).first()
    
    inspected_today = today_stats.inspected or 0
    passed_today = today_stats.passed or 0
    failed_today = today_stats.failed or 0
    yield_today = (passed_today / inspected_today * 100) if inspected_today > 0 else 100.0
    
    # Active alerts: Count inspections in the last 7 days that exceed the product's UCL limit
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    alerts_query = db.query(models.QCInspection).join(models.Product).filter(
        models.QCInspection.inspection_date >= seven_days_ago
    ).all()
    
    active_alerts = 0
    for insp in alerts_query:
        defect_rate = insp.total_failed / insp.total_inspected if insp.total_inspected > 0 else 0
        if defect_rate > insp.product.ucl_limit:
            active_alerts += 1
            
    return {
        "total_inspected_today": inspected_today,
        "total_passed_today": passed_today,
        "total_failed_today": failed_today,
        "yield_rate_today": round(yield_today, 2),
        "total_inspected_overall": inspected_all,
        "total_passed_overall": passed_all,
        "total_failed_overall": failed_all,
        "yield_rate_overall": round(yield_all, 2),
        "active_alerts_count": active_alerts
    }

def get_control_chart_data(db: Session, product_id: int) -> Dict[str, Any]:
    product = get_product(db, product_id)
    if not product:
        return {"product_code": "", "product_name": "", "points": []}
        
    inspections = db.query(models.QCInspection).filter(
        models.QCInspection.product_id == product_id
    ).order_by(models.QCInspection.inspection_date.asc()).limit(30).all() # Last 30 batches
    
    points = []
    # Calculate average defect rate (Center Line)
    total_inspected = sum(insp.total_inspected for insp in inspections)
    total_failed = sum(insp.total_failed for insp in inspections)
    center_line = (total_failed / total_inspected) if total_inspected > 0 else 0.0
    
    # If center_line is 0, default to target or a small value, or use product UCL
    # For now, let's use the center line based on actual average, and UCL/LCL from product settings
    ucl = product.ucl_limit
    lcl = product.lcl_limit
    
    for insp in inspections:
        defect_rate = insp.total_failed / insp.total_inspected if insp.total_inspected > 0 else 0.0
        is_out = defect_rate > ucl or defect_rate < lcl
        
        points.append({
            "batch_number": insp.batch_number,
            "inspection_date": insp.inspection_date,
            "defect_rate": round(defect_rate, 4),
            "ucl": round(ucl, 4),
            "lcl": round(lcl, 4),
            "center_line": round(center_line, 4),
            "is_out_of_control": is_out
        })
        
    return {
        "product_code": product.product_code,
        "product_name": product.product_name,
        "points": points
    }

def get_defect_distribution(db: Session, product_id: Optional[int] = None) -> List[Dict[str, Any]]:
    # Sum of quantity by defect type
    query = db.query(
        models.DefectDetail.defect_type,
        func.sum(models.DefectDetail.quantity).label("total_qty")
    )
    if product_id is not None:
        query = query.join(models.QCInspection).filter(models.QCInspection.product_id == product_id)
        
    results = query.group_by(models.DefectDetail.defect_type).order_by(func.sum(models.DefectDetail.quantity).desc()).all()
    
    total_defects = sum(r.total_qty for r in results) or 1
    
    distribution = []
    for r in results:
        distribution.append({
            "defect_type": r.defect_type,
            "quantity": r.total_qty,
            "percentage": round((r.total_qty / total_defects) * 100, 2)
        })
        
    return distribution

def get_vendor_ratings(db: Session) -> List[Dict[str, Any]]:
    results = db.query(
        models.QCInspection.vendor_name,
        func.sum(models.QCInspection.total_inspected).label("inspected"),
        func.sum(models.QCInspection.total_passed).label("passed"),
        func.sum(models.QCInspection.total_failed).label("failed")
    ).group_by(models.QCInspection.vendor_name).all()
    
    ratings = []
    for r in results:
        inspected = r.inspected or 0
        passed = r.passed or 0
        failed = r.failed or 0
        yield_rate = (passed / inspected * 100) if inspected > 0 else 100.0
        
        ratings.append({
            "vendor_name": r.vendor_name,
            "total_inspected": inspected,
            "total_passed": passed,
            "total_failed": failed,
            "yield_rate": round(yield_rate, 2)
        })
        
    ratings.sort(key=lambda x: x["yield_rate"], reverse=True)
    return ratings
