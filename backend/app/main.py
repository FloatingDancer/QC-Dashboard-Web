from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import random
from datetime import datetime, timedelta

from .database import engine, get_db
from . import models, schemas, crud

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="QC Dashboard API", version="1.0.0")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all. In production, restrict.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to seed dummy data if database is empty
def seed_dummy_data(db: Session):
    product_count = db.query(models.Product).count()
    if product_count > 0:
        return # Database already has data

    print("Seeding database with dummy QC data...")
    
    # 1. Create Products
    products_data = [
        {"product_code": "BS-037A-1", "product_name": "Cover Remote BS-037A-1", "ucl_limit": 0.08, "lcl_limit": 0.00},
        {"product_code": "BT-120A", "product_name": "Cover Remote BT-120A", "ucl_limit": 0.06, "lcl_limit": 0.00},
        {"product_code": "WV-93440", "product_name": "Cover Remote WV-93440", "ucl_limit": 0.07, "lcl_limit": 0.00},
        {"product_code": "STL-F141A-00", "product_name": "Casing Remote STL-F141A-00", "ucl_limit": 0.09, "lcl_limit": 0.00},
        {"product_code": "11057-1585", "product_name": "Part 11057-1585", "ucl_limit": 0.05, "lcl_limit": 0.00},
        {"product_code": "B74-F1137", "product_name": "Part B74-F1137", "ucl_limit": 0.08, "lcl_limit": 0.00}
    ]
    
    db_products = []
    for prod in products_data:
        p = models.Product(**prod)
        db.add(p)
        db_products.append(p)
    db.commit()
    for p in db_products:
        db.refresh(p)
        
    # 2. Create historical inspections (last 15 days)
    inspectors = ["Firgi", "Alan", "Eka", "Munir", "Tarjani", "Amar"]
    defect_types = {
        "BS-037A-1": ["tilted spring", "Contamination", "Scrap", "Burry"],
        "BT-120A": ["tilted spring", "Contamination", "Scrap", "Burry"],
        "WV-93440": ["tilted spring", "Contamination", "Scrap", "Burry"],
        "STL-F141A-00": ["tilted spring", "Contamination", "Scrap", "Burry"],
        "11057-1585": ["tilted spring", "Contamination", "Scrap", "Burry"],
        "B74-F1137": ["tilted spring", "Contamination", "Scrap", "Burry"]
    }
    
    now = datetime.utcnow()
    for p in db_products:
        for day in range(15, -1, -1): # 15 days ago to today
            inspection_date = now - timedelta(days=day)
            
            # Generate 2 batches per day
            for batch_num in [1, 2]:
                prod_suffix = p.product_code.replace("-", "")
                batch_code = f"BATCH-{inspection_date.strftime('%y%m%d')}-{prod_suffix}-{batch_num}"
                
                # Setup inspected/passed/failed counts
                total_inspected = random.randint(100, 250)
                
                # Introduce occasional "out of control" day for the chart demo
                is_out_of_control = (day == 3 or day == 10) and batch_num == 2
                
                if is_out_of_control:
                    # High defect rate (exceeds UCL)
                    defect_rate = random.uniform(p.ucl_limit + 0.02, p.ucl_limit + 0.07)
                else:
                    # Normal low defect rate
                    defect_rate = random.uniform(0.005, p.ucl_limit - 0.01)
                    
                total_failed = int(total_inspected * defect_rate)
                total_passed = total_inspected - total_failed
                
                insp = models.QCInspection(
                    product_id=p.id,
                    inspection_date=inspection_date,
                    batch_number=batch_code,
                    total_inspected=total_inspected,
                    total_passed=total_passed,
                    total_failed=total_failed,
                    inspector_name=random.choice(inspectors),
                    vendor_name="PT. Samjin"
                )
                db.add(insp)
                db.commit()
                db.refresh(insp)
                
                # Generate defect details if any failed
                if total_failed > 0:
                    available_defects = defect_types[p.product_code]
                    remaining_failed = total_failed
                    
                    # Distribute failed units to various defect types
                    for i, def_type in enumerate(available_defects):
                        if remaining_failed <= 0:
                            break
                        if i == len(available_defects) - 1:
                            qty = remaining_failed
                        else:
                            qty = random.randint(0, remaining_failed)
                        
                        if qty > 0:
                            det = models.DefectDetail(
                                inspection_id=insp.id,
                                defect_type=def_type,
                                quantity=qty
                            )
                            db.add(det)
                            remaining_failed -= qty
                            
                    db.commit()
    print("Database seeding completed successfully.")

# Seed database on startup
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        seed_dummy_data(db)
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "QC Dashboard API is running. Go to /docs for Swagger API documentation."}

# Products endpoints
@app.get("/api/products", response_model=List[schemas.Product])
def get_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@app.post("/api/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = crud.get_product_by_code(db, product.product_code)
    if db_product:
        raise HTTPException(status_code=400, detail="Product code already registered")
    return crud.create_product(db, product)

@app.put("/api/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return crud.update_product(db, product_id, product)

# Inspection endpoints
@app.post("/api/qc/submit", response_model=schemas.QCInspection)
def submit_qc_inspection(inspection: schemas.QCInspectionCreate, db: Session = Depends(get_db)):
    product = crud.get_product(db, inspection.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validation logic: passed + failed must equal inspected
    if inspection.total_passed + inspection.total_failed != inspection.total_inspected:
        raise HTTPException(
            status_code=400, 
            detail="Jumlah total inspected harus sama dengan penjumlahan passed dan failed."
        )
        
    return crud.create_inspection(db, inspection)

@app.get("/api/qc/history", response_model=List[schemas.QCInspection])
def get_qc_history(db: Session = Depends(get_db)):
    return crud.get_inspections(db, limit=200)

# Dashboard endpoints
@app.get("/api/dashboard/summary", response_model=schemas.DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    return crud.get_dashboard_summary(db)

@app.get("/api/dashboard/control-chart", response_model=schemas.ControlChartResponse)
def get_control_chart(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return crud.get_control_chart_data(db, product_id)

@app.get("/api/dashboard/defect-distribution", response_model=List[schemas.DefectDistributionPoint])
def get_defect_distribution(product_id: Optional[int] = None, db: Session = Depends(get_db)):
    return crud.get_defect_distribution(db, product_id=product_id)

@app.get("/api/dashboard/vendor-ratings", response_model=List[schemas.VendorRating])
def get_vendor_ratings(db: Session = Depends(get_db)):
    return crud.get_vendor_ratings(db)
