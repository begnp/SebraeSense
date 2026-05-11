from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    event_type = Column(String, index=True) # e.g. "page_view", "error", "button_click"
    metadata_payload = Column(JSON, nullable=True) # Additional details
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    customer = relationship("Customer", backref="telemetry_events")
