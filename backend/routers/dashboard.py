from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.customer import Customer
from models.alert import Alert
from models.telemetry import TelemetryEvent
from schemas.dashboard import DashboardResponse, StatCardResponse, QueueUserResponse, HighlightUserResponse, AlertSummaryResponse
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
def get_dashboard_data(days: int = 30, db: Session = Depends(get_db)):
    from routers.customers import reconcile_sla_alerts, get_prioritized_customers
    reconcile_sla_alerts(db)
    start_date = datetime.now() - timedelta(days=days)

    # 1. Calculate Stats
    risks = db.query(Customer).filter(Customer.current_chs <= 40).count()
    attention = db.query(Customer).filter(Customer.current_chs > 40, Customer.current_chs <= 70).count()
    healthy = db.query(Customer).filter(Customer.current_chs > 70).count()
    
    stats = StatCardResponse(risks=risks, attention=attention, healthy=healthy)
    
    # 2. Get Priority Queue (Top 4 based on full prioritized queue logic)
    prioritized_list = get_prioritized_customers(db)
    queue = []
    for item in prioritized_list[:4]:
        c = db.query(Customer).filter(Customer.id == item["id"]).first()
        if not c:
            continue
            
        alerts_count = item["alerts_count"]
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
        
    # 3. Get Highlights
    highlight_customers = db.query(Customer).order_by(Customer.current_chs.asc()).offset(0).limit(3).all()
    highlights = []
    for c in highlight_customers:
        alerts_count = db.query(Alert).filter(
            Alert.customer_id == c.id, 
            Alert.status == "active",
            Alert.created_at >= start_date
        ).count()
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
            engagement=int(c.engagement_score) if c.engagement_score > 0 else 48,
            progression=int(c.progression_score) if c.progression_score > 0 else 20,
            success=int(c.success_score) if c.success_score > 0 else 65
        ))
        
    # 4. Dynamic Alerts Summary
    all_alerts = db.query(Alert).filter(Alert.created_at >= start_date).all()
    inatividade = 0
    erro_critico = 0
    suporte = 0
    desengajamento = 0
    eventos = 0
    cursos = 0
    
    for a in all_alerts:
        r = a.reason.lower()
        if "inatividade" in r or "abandono do fluxo" in r:
            inatividade += 1
        elif "erro" in r or "rage click" in r or "fricção" in r:
            erro_critico += 1
        elif "suporte" in r:
            suporte += 1
        elif "desengajamento" in r or "ttv" in r or "tempo de conclusão" in r or "queda" in r or "sucesso" in r:
            desengajamento += 1
        elif "evento" in r:
            eventos += 1
        elif "curso" in r:
            cursos += 1
        else:
            desengajamento += 1
            
    alerts_summary = AlertSummaryResponse(
        inatividade=inatividade,
        erro_critico=erro_critico,
        suporte=suporte,
        desengajamento=desengajamento,
        eventos=eventos,
        cursos=cursos
    )

    # 5. Dynamic Chart Data
    chart_data = []
    now = datetime.now()
    step = 1 if days <= 15 else 3
    
    for i in range(days - 1, -1, -step):
        dt = now - timedelta(days=i)
        day_name = dt.strftime("%d/%m")
        
        # Calculate base average CHS on this historical day
        customers = db.query(Customer).all()
        if not customers:
            avg_chs = 70
        else:
            total_chs = 0
            for c in customers:
                c_chs = c.current_chs
                alerts_after = db.query(Alert).filter(
                    Alert.customer_id == c.id,
                    Alert.created_at > dt
                ).all()
                for a in alerts_after:
                    points = 10
                    if "Rage Click" in a.reason:
                        points = 5
                    elif "Erro crítico" in a.reason:
                        points = 15
                    elif "TTV" in a.reason or "Tempo de conclusão" in a.reason:
                        points = 10
                    c_chs = min(100, c_chs + points)
                total_chs += c_chs
            avg_chs = int(total_chs / len(customers))
            
        chart_data.append({"name": day_name, "chs": avg_chs})

    return DashboardResponse(
        stats=stats,
        queue=queue,
        highlights=highlights,
        chart=chart_data,
        alerts_summary=alerts_summary
    )
