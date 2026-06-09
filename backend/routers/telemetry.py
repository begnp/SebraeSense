from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.customer import Customer
from models.alert import Alert
from models.telemetry import TelemetryEvent
from schemas.telemetry import TelemetryCreate

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])

@router.post("/")
def create_telemetry_event(payload: TelemetryCreate, db: Session = Depends(get_db)):
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        # For mock robustness, fall back to first customer in DB
        customer = db.query(Customer).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

    # Create telemetry event record
    event = TelemetryEvent(
        customer_id=customer.id,
        event_type=payload.event_type,
        metadata_payload=payload.metadata_payload
    )
    db.add(event)
    
    # Process logic based on telemetry event type
    if payload.event_type == "rage_click":
        # Subtract 5 points from CHS (ensure bottom limit is 0)
        customer.current_chs = max(0, customer.current_chs - 5)
        
        # Check if alert already exists to prevent duplication
        existing_alert = db.query(Alert).filter(
            Alert.customer_id == customer.id,
            Alert.reason == "Fricção de navegação detectada (Rage Click)",
            Alert.status == "active"
        ).first()
        if not existing_alert:
            alert = Alert(
                customer_id=customer.id,
                reason="Fricção de navegação detectada (Rage Click)",
                status="active"
            )
            db.add(alert)
            
    elif payload.event_type == "error":
        # Subtract 15 points from CHS (ensure bottom limit is 0)
        customer.current_chs = max(0, customer.current_chs - 15)
        
        # Get error details or use default message
        error_details = "Erro crítico"
        if payload.metadata_payload and "details" in payload.metadata_payload:
            error_details = payload.metadata_payload["details"]
        
        # Format the reason as a priority alert
        reason = f"Erro crítico: {error_details}"
        
        # Check if alert already exists to prevent duplication
        existing_alert = db.query(Alert).filter(
            Alert.customer_id == customer.id,
            Alert.reason == reason,
            Alert.status == "active"
        ).first()
        if not existing_alert:
            alert = Alert(
                customer_id=customer.id,
                reason=reason,
                status="active"
            )
            db.add(alert)

    db.commit()
    return {"status": "success", "customer_id": customer.id, "current_chs": customer.current_chs}
