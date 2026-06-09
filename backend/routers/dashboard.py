from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.customer import Customer
from models.alert import Alert
from models.telemetry import TelemetryEvent
from schemas.dashboard import DashboardResponse, StatCardResponse, QueueUserResponse, HighlightUserResponse
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

def format_short_date_pt(dt: datetime) -> str:
    if not dt:
        return "Hoje"
    now = datetime.now()
    if dt.date() == now.date():
        return "Hoje"
    if dt.date() == (now - timedelta(days=1)).date():
        return "Ontem"
    months_short = {
        1: "jan.", 2: "fev.", 3: "mar.", 4: "abr.", 5: "mai.", 6: "jun.",
        7: "jul.", 8: "ago.", 9: "set.", 10: "out.", 11: "nov.", 12: "dez."
    }
    return f"{dt.day} de {months_short.get(dt.month, 'jan.')}"

@router.get("/", response_model=DashboardResponse)
def get_dashboard_data(db: Session = Depends(get_db)):
    # 1. Calculate Stats
    risks = db.query(Customer).filter(Customer.current_chs <= 40).count()
    attention = db.query(Customer).filter(Customer.current_chs > 40, Customer.current_chs <= 70).count()
    healthy = db.query(Customer).filter(Customer.current_chs > 70).count()
    
    stats = StatCardResponse(risks=risks, attention=attention, healthy=healthy)
    
    # 2. Get Priority Queue (Top 4 with lowest CHS)
    queue_customers = db.query(Customer).order_by(Customer.current_chs.asc()).limit(4).all()
    queue = []
    for c in queue_customers:
        alerts_count = db.query(Alert).filter(Alert.customer_id == c.id, Alert.status == "active").count()
        last_alert = db.query(Alert).filter(Alert.customer_id == c.id).order_by(Alert.created_at.desc()).first()
        reason = last_alert.reason if last_alert else "Sem histórico"
        
        # Encontra a data do último contato (último evento de telemetria, alerta ou updated_at/created_at)
        last_event = db.query(TelemetryEvent).filter(TelemetryEvent.customer_id == c.id).order_by(TelemetryEvent.timestamp.desc()).first()
        last_event_time = last_event.timestamp if last_event else None
        
        last_alert_time = last_alert.created_at if last_alert else None
        
        times = [t for t in [last_event_time, last_alert_time, c.updated_at, c.created_at] if t is not None]
        last_contact = max(times) if times else datetime.now()
        
        date_str = format_short_date_pt(last_contact)
        
        # Get initials
        parts = c.name.split()
        initials = parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")
        
        # Determine scheme based on CHS
        if c.current_chs <= 40:
            scheme = "red"
        elif c.current_chs <= 70:
            scheme = "yellow"
        else:
            scheme = "green"
        
        queue.append(QueueUserResponse(
            id=c.id,
            initials=initials.upper(),
            name=c.name,
            company=c.company,
            score=c.current_chs,
            reason=reason,
            alertCount=alerts_count,
            date=date_str,
            scheme=scheme
        ))
        
    # 3. Get Highlights (Next 3 with lowest CHS, or specific criteria)
    # Using the same list for simplicity but getting 3 specific ones
    highlight_customers = db.query(Customer).order_by(Customer.current_chs.asc()).offset(0).limit(3).all()
    highlights = []
    for c in highlight_customers:
        alerts_count = db.query(Alert).filter(Alert.customer_id == c.id, Alert.status == "active").count()
        last_alert = db.query(Alert).filter(Alert.customer_id == c.id).order_by(Alert.created_at.desc()).first()
        reason = last_alert.reason if last_alert else "Sem histórico"
        
        parts = c.name.split()
        initials = parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")
        
        highlights.append(HighlightUserResponse(
            id=c.id,
            initials=initials.upper(),
            name=c.name,
            company=c.company,
            score=c.current_chs,
            alertCount=alerts_count,
            reason=reason,
            engagement=int(c.engagement_score),
            progression=int(c.progression_score),
            success=int(c.success_score)
        ))
        
    # 4. Chart Data (Mocking variation since history requires time-series aggregation)
    chart_data = [
        {"name": "01", "chs": 40},
        {"name": "05", "chs": 30},
        {"name": "10", "chs": 45},
        {"name": "15", "chs": 50},
        {"name": "20", "chs": 45},
        {"name": "25", "chs": 60},
        {"name": "30", "chs": 55},
    ]

    return DashboardResponse(stats=stats, queue=queue, highlights=highlights, chart=chart_data)
