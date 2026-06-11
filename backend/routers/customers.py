from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.customer import Customer
from models.alert import Alert
from models.telemetry import TelemetryEvent
from models.feedback import Feedback
from schemas.customer import CustomerProfileResponse, CustomerScores, ScoreItem, TimelineEventResponse, ProcessItemResponse, AlertStatusUpdate
from schemas.feedback import FeedbackCreate, FeedbackResponse
from datetime import datetime

router = APIRouter(prefix="/api/customers", tags=["Customers"])

def format_datetime_pt(dt: datetime) -> str:
    if not dt:
        return "Recentemente"
    # Simplificado em português brasileiro
    months = {
        1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril", 5: "Maio", 6: "Junho",
        7: "Julho", 8: "Agosto", 9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
    }
    return f"{dt.day} de {months.get(dt.month, '')} às {dt.strftime('%Hh%M')}"

@router.get("/{customer_id}", response_model=CustomerProfileResponse)
def get_customer_profile(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    # 1. Determina status qualitativo com base no CHS
    if customer.current_chs <= 40:
        status = "Em Risco"
    elif customer.current_chs <= 70:
        status = "Em Atenção"
    else:
        status = "Saudável"

    # 2. Telefones e e-mails fictícios com base no cliente
    phone = "81 99403-0293"
    email = "joaosantos@gmail.com"
    if customer.id == 2:
        phone = "(81) 99876-5432"
        email = "maria@padariastrela.com"
    elif customer.id > 2:
        email = f"{customer.name.lower().replace(' ', '')}@gmail.com"
        phone = "81 99000-1111"

    # 3. Calcula dimensões de score com fallbacks para preencher a tela caso estejam zerados
    val_eng = int(customer.engagement_score) if customer.engagement_score > 0 else 48
    val_prog = int(customer.progression_score) if customer.progression_score > 0 else 20
    val_succ = int(customer.success_score) if customer.success_score > 0 else 65
    val_total = int((val_eng + val_prog + val_succ) / 3)

    scores = CustomerScores(
        frequencia=ScoreItem(value=val_eng, max=100, color="green" if val_eng > 70 else "yellow" if val_eng > 40 else "red"),
        progressao=ScoreItem(value=val_prog, max=100, color="green" if val_prog > 70 else "yellow" if val_prog > 40 else "red"),
        retorno=ScoreItem(value=val_succ, max=100, color="green" if val_succ > 70 else "yellow" if val_succ > 40 else "red"),
        engajamento=ScoreItem(value=val_total, max=100, color="green" if val_total > 70 else "yellow" if val_total > 40 else "red")
    )

    # 4. Busca logs de telemetria e alertas para consolidar a Linha de Tempo
    timeline_items = []
    
    # Telemetry events
    telemetry_events = db.query(TelemetryEvent).filter(TelemetryEvent.customer_id == customer.id).all()
    for e in telemetry_events:
        time_str = format_datetime_pt(e.timestamp)
        if e.event_type == "rage_click":
            timeline_items.append((e.timestamp, TimelineEventResponse(
                title="Fricção: Cliques repetitivos detectados (Rage Click)",
                time=time_str,
                type="alert"
            )))
        elif e.event_type == "error":
            details = e.metadata_payload.get("details", "Erro inesperado") if e.metadata_payload else "Erro inesperado"
            timeline_items.append((e.timestamp, TimelineEventResponse(
                title=f"Fricção: Erro crítico - {details}",
                time=time_str,
                type="alert"
            )))
        elif e.event_type == "task_completed":
            time_spent = e.metadata_payload.get("timeSpent", 0) if e.metadata_payload else 0
            timeline_items.append((e.timestamp, TimelineEventResponse(
                title=f"Sucesso: Concluiu processo de abertura de empresa ({time_spent:.1f}s)",
                time=time_str,
                type="check"
            )))
        elif e.event_type == "abandonment":
            timeline_items.append((e.timestamp, TimelineEventResponse(
                title="Fricção: Abandono de fluxo detectado",
                time=time_str,
                type="alert"
            )))

    # Alerts
    alerts = db.query(Alert).filter(Alert.customer_id == customer.id).all()
    for a in alerts:
        time_str = format_datetime_pt(a.created_at)
        timeline_items.append((a.created_at, TimelineEventResponse(
            title=f"Alerta CRM: {a.reason}",
            time=time_str,
            type="alert" if a.status == "active" else "eye",
            alert_id=a.id,
            status=a.status
        )))

    # Ordenar por data decrescente (mais recente primeiro)
    timeline_items.sort(key=lambda x: x[0], reverse=True)
    final_timeline = [item[1] for item in timeline_items]

    # Fallback se a timeline estiver completamente vazia
    if not final_timeline:
        final_timeline = [
            TimelineEventResponse(title="Concluiu consultoria de gestão financeira", time="12 de Março", type="check"),
            TimelineEventResponse(title="3 buscas repetidas por 'Linha de crédito'", time="Ontem, 14h02", type="eye"),
            TimelineEventResponse(title="Abandono no formulário de crédito", time="Hoje, 10h30", type="alert")
        ]

    # 5. Processos mockados
    processes = [
        ProcessItemResponse(id="#1038", title="Dúvida sobre documentação MEI", period="Hoje", dots=["green", "green", "gray"]),
        ProcessItemResponse(id="#1037", title="Erro na emissão de nota fiscal", period="Esta semana", dots=["yellow", "yellow", "gray"])
    ]

    feedbacks = db.query(Feedback).filter(Feedback.customer_id == customer.id).order_by(Feedback.created_at.desc()).all()

    return CustomerProfileResponse(
        id=customer.id,
        name=customer.name,
        company=customer.company,
        phone=phone,
        email=email,
        status=status,
        score=customer.current_chs,
        scores=scores,
        timeline=final_timeline,
        processes=processes,
        feedbacks=feedbacks
    )


@router.patch("/alerts/{alert_id}")
def update_alert_status(alert_id: int, payload: AlertStatusUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
        
    old_status = alert.status
    new_status = payload.status
    
    if new_status not in ["resolved", "false_positive"]:
        raise HTTPException(status_code=400, detail="Status inválido")
        
    alert.status = new_status
    
    # Se for marcado como falso positivo, devolvemos os pontos ao CHS do cliente
    if new_status == "false_positive" and old_status != "false_positive":
        customer = db.query(Customer).filter(Customer.id == alert.customer_id).first()
        if customer:
            points_to_restore = 10
            if "Rage Click" in alert.reason:
                points_to_restore = 5
            elif "Erro crítico" in alert.reason:
                points_to_restore = 15
            elif "TTV" in alert.reason or "Tempo de conclusão" in alert.reason:
                points_to_restore = 10
            
            customer.current_chs = min(100, customer.current_chs + points_to_restore)
            
    db.commit()
    return {"status": "success", "alert_id": alert.id, "new_status": alert.status}


@router.get("/alerts/active")
def get_all_active_alerts(db: Session = Depends(get_db)):
    active_alerts = db.query(Alert).filter(Alert.status == "active").order_by(Alert.created_at.desc()).all()
    
    result = []
    for a in active_alerts:
        customer = db.query(Customer).filter(Customer.id == a.customer_id).first()
        if customer:
            result.append({
                "id": a.id,
                "customer_id": customer.id,
                "customer_name": customer.name,
                "company": customer.company,
                "reason": a.reason,
                "created_at": a.created_at.isoformat() if a.created_at else None
            })
    return result


@router.post("/{customer_id}/feedback", response_model=FeedbackResponse)
def create_feedback(customer_id: int, payload: FeedbackCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
    comment = payload.comment
    rating = payload.rating
    
    # Portugues sentiment analysis keywords
    comment_lower = comment.lower()
    positive_keywords = ["bom", "excelente", "ótimo", "maravilhoso", "gostei", "ajudou", "perfeito", "sucesso", "rápido", "legal", "fácil", "facil", "recomendo", "muito bom", "otimo"]
    negative_keywords = ["ruim", "péssimo", "lento", "erro", "difícil", "dificil", "não funciona", "travou", "bug", "falha", "horrível", "demora", "chato", "pessimo", "ruins", "odiei"]
    
    pos_count = sum(1 for w in positive_keywords if w in comment_lower)
    neg_count = sum(1 for w in negative_keywords if w in comment_lower)
    
    if neg_count > pos_count:
        sentiment = "negative"
    elif pos_count > neg_count:
        sentiment = "positive"
    else:
        sentiment = "neutral"
        
    fb = Feedback(
        customer_id=customer_id,
        comment=comment,
        rating=rating,
        sentiment=sentiment
    )
    db.add(fb)
    
    # If negative feedback, trigger active alert and subtract 15 points
    if sentiment == "negative":
        customer.current_chs = max(0, customer.current_chs - 15)
        reason = f"Feedback Negativo: \"{comment[:40]}...\""
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
    db.refresh(fb)
    return fb
