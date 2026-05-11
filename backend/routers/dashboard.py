from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.customer import Customer
from models.alert import Alert
from schemas.dashboard import DashboardResponse, StatCardResponse, QueueUserResponse, HighlightUserResponse
from datetime import datetime

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

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
        # Mock date formatting for now
        date_str = "Hoje" 
        
        # Get initials
        parts = c.name.split()
        initials = parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")
        
        queue.append(QueueUserResponse(
            id=c.id,
            initials=initials.upper(),
            name=c.name,
            company=c.company,
            score=c.current_chs,
            reason=reason,
            alertCount=alerts_count,
            date=date_str
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
