from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    reason = Column(String)
    status = Column(String, default="active") # active, resolved
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    customer = relationship("Customer", backref="alerts")
