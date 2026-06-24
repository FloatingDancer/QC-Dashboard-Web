from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Defect Detail Schemas
class DefectDetailBase(BaseModel):
    defect_type: str
    quantity: int

class DefectDetailCreate(DefectDetailBase):
    pass

class DefectDetail(DefectDetailBase):
    id: int
    inspection_id: int

    class Config:
        from_attributes = True


# QC Inspection Schemas
class QCInspectionBase(BaseModel):
    batch_number: Optional[str] = None
    total_inspected: int
    total_passed: int
    total_failed: int
    inspector_name: str
    vendor_name: str

class QCInspectionCreate(QCInspectionBase):
    product_id: int
    inspection_date: Optional[datetime] = None
    defects: List[DefectDetailCreate] = []

class QCInspection(QCInspectionBase):
    id: int
    product_id: int
    inspection_date: datetime
    defects: List[DefectDetail] = []

    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    product_code: str
    product_name: str
    ucl_limit: float = Field(default=0.05, ge=0.0, le=1.0)
    lcl_limit: float = Field(default=0.0, ge=0.0, le=1.0)

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    inspections: List[QCInspection] = []

    class Config:
        from_attributes = True


# Dashboard specific schemas
class DashboardSummary(BaseModel):
    total_inspected_today: int
    total_passed_today: int
    total_failed_today: int
    yield_rate_today: float
    total_inspected_overall: int
    total_passed_overall: int
    total_failed_overall: int
    yield_rate_overall: float
    active_alerts_count: int

class ControlChartPoint(BaseModel):
    batch_number: str
    inspection_date: datetime
    defect_rate: float
    ucl: float
    lcl: float
    center_line: float
    is_out_of_control: bool

class ControlChartResponse(BaseModel):
    product_code: str
    product_name: str
    points: List[ControlChartPoint]

class DefectDistributionPoint(BaseModel):
    defect_type: str
    quantity: int
    percentage: float

class ProductUpdate(BaseModel):
    product_name: str
    ucl_limit: float = Field(ge=0.0, le=1.0)
    lcl_limit: float = Field(ge=0.0, le=1.0)

class VendorRating(BaseModel):
    vendor_name: str
    total_inspected: int
    total_passed: int
    total_failed: int
    yield_rate: float
