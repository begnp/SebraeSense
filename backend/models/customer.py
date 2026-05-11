from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    company = Column(String)
    
    # CHS Dimensions
    engagement_score = Column(Float, default=0.0)
    progression_score = Column(Float, default=0.0)
    success_score = Column(Float, default=0.0)
    
    # Overall Score (0-100)
    current_chs = Column(Integer, default=100)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
