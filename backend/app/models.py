from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String, unique=True, index=True, nullable=False)
    product_name = Column(String, nullable=False)
    ucl_limit = Column(Float, nullable=False, default=0.05) # Default 5%
    lcl_limit = Column(Float, nullable=False, default=0.00) # Default 0%

    inspections = relationship("QCInspection", back_populates="product")


class QCInspection(Base):
    __tablename__ = "qc_inspections"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    inspection_date = Column(DateTime, default=datetime.datetime.utcnow)
    batch_number = Column(String, nullable=False)
    total_inspected = Column(Integer, nullable=False)
    total_passed = Column(Integer, nullable=False)
    total_failed = Column(Integer, nullable=False)
    inspector_name = Column(String, nullable=False)
    vendor_name = Column(String, nullable=False, default="PT. Samjin")

    product = relationship("Product", back_populates="inspections")
    defects = relationship("DefectDetail", back_populates="inspection", cascade="all, delete-orphan")


class DefectDetail(Base):
    __tablename__ = "defect_details"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("qc_inspections.id", ondelete="CASCADE"))
    defect_type = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)

    inspection = relationship("QCInspection", back_populates="defects")
