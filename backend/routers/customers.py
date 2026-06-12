from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.customer import Customer
from models.alert import Alert
from models.telemetry import TelemetryEvent
from models.feedback import Feedback
from models.process import CustomerProcess
from schemas.customer import CustomerProfileResponse, CustomerScores, ScoreItem, TimelineEventResponse, ProcessItemResponse, AlertStatusUpdate
from schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackRespond
from schemas.process import ProcessStatusUpdate, ProcessCreate, ProcessOptInUpdate
from datetime import datetime, timezone

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
        elif e.event_type == "process_updated":
            details = e.metadata_payload.get("details", "") if e.metadata_payload else ""
            timeline_items.append((e.timestamp, TimelineEventResponse(
                title=details,
                time=time_str,
                type="check" if "finalizado" in details.lower() else "eye"
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

    # 5. Buscar processos reais do banco e conciliar alertas de SLA
    reconcile_sla_alerts(db, customer.id)
    db_processes = db.query(CustomerProcess).filter(CustomerProcess.customer_id == customer.id).order_by(CustomerProcess.created_at.desc()).all()
    processes = []
    for p in db_processes:
        if p.status == "aberto":
            dots = ["green", "gray", "gray"]
        elif p.status == "em_andamento":
            dots = ["green", "yellow", "gray"]
        elif p.status == "finalizado":
            dots = ["green", "green", "green"]
        else:
            dots = ["gray", "gray", "gray"]
            
        period = "Hoje"
        if p.created_at and p.created_at.date() < datetime.now().date():
            period = "Esta semana"
            
        # SLA calculation
        sla_status = "normal"
        if p.status != "finalizado" and p.created_at:
            now_aware = datetime.now(timezone.utc) if p.created_at.tzinfo else datetime.now()
            elapsed_hours = (now_aware - p.created_at).total_seconds() / 3600.0
            if elapsed_hours >= 24:
                sla_status = "atrasado"
            elif elapsed_hours >= 12:
                sla_status = "atencao"
        elif p.status == "finalizado":
            sla_status = "finalizado"
            
        processes.append(ProcessItemResponse(
            id=f"#{p.id}",
            title=p.title,
            period=period,
            dots=dots,
            status=p.status,
            notes=p.notes,
            sla_status=sla_status,
            opt_in=p.opt_in if p.opt_in is not None else False
        ))

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


def categorize_alert(reason: str) -> str:
    r = reason.lower()
    if "inatividade" in r or "abandono do fluxo" in r:
        return "Inatividade prolongada"
    elif "erro" in r or "rage click" in r or "fricção" in r:
        return "Erro em tarefa crítica"
    elif "suporte" in r:
        return "Suporte sem resolução"
    elif "desengajamento" in r or "ttv" in r or "tempo de conclusão" in r or "queda" in r or "sucesso" in r:
        return "Queda de engajamento"
    elif "evento" in r:
        return "Eventos"
    elif "curso" in r:
        return "Cursos"
    else:
        return "Queda de engajamento"


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
                "category": categorize_alert(a.reason),
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


@router.patch("/feedback/{feedback_id}/respond", response_model=FeedbackResponse)
def respond_to_feedback(feedback_id: int, payload: FeedbackRespond, db: Session = Depends(get_db)):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback não encontrado")
    
    feedback.response = payload.response
    feedback.responded_at = datetime.now()
    
    customer = db.query(Customer).filter(Customer.id == feedback.customer_id).first()
    if customer:
        email_recipient = f"{customer.name.lower().replace(' ', '')}@gmail.com"
        if customer.id == 1:
            email_recipient = "joaosantos@gmail.com"
        elif customer.id == 2:
            email_recipient = "maria@padariastrela.com"
            
        print(f"\n>>> [NOTIFICAÇÃO DE RESPOSTA ENVIADA AO CLIENTE] <<<\nDestinatário: {email_recipient}\nAssunto: Resposta ao seu feedback sobre serviços Sebrae\nMensagem: Olá {customer.name}, a equipe Sebrae respondeu ao seu comentário: \"{feedback.comment[:40]}...\".\nResposta: {payload.response}\n")
        
        event = TelemetryEvent(
            customer_id=customer.id,
            event_type="process_updated",
            metadata_payload={"details": f"CX: Resposta enviada para o feedback: \"{payload.response[:40]}...\""}
        )
        db.add(event)
        
    db.commit()
    db.refresh(feedback)
    return feedback


@router.patch("/processes/{process_id}")
def update_process_status(process_id: int, payload: ProcessStatusUpdate, db: Session = Depends(get_db)):
    process = db.query(CustomerProcess).filter(CustomerProcess.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
        
    old_status = process.status
    new_status = payload.status
    
    if new_status not in ["aberto", "em_andamento", "finalizado"]:
        raise HTTPException(status_code=400, detail="Status inválido")
        
    process.status = new_status
    if payload.notes is not None:
        process.notes = payload.notes
        
    # Query customer to construct simulated notification
    customer = db.query(Customer).filter(Customer.id == process.customer_id).first()
    if customer:
        status_pt = {
            "aberto": "Aberto",
            "em_andamento": "Em Andamento",
            "finalizado": "Finalizado"
        }.get(new_status, new_status)
        
        email_recipient = f"{customer.name.lower().replace(' ', '')}@gmail.com"
        if customer.id == 1:
            email_recipient = "joaosantos@gmail.com"
        elif customer.id == 2:
            email_recipient = "maria@padariastrela.com"
            
        print(f"\n>>> [NOTIFICAÇÃO ENVIADA AO CLIENTE] <<<\nCanal: {email_recipient}\nMensagem: Olá {customer.name}, o status do seu processo '#{process.id} - {process.title}' foi atualizado para '{status_pt}'.\nObservação: {payload.notes or 'Nenhuma'}\n")
        
        timeline_details = f"Sucesso: Processo atualizado para {status_pt} ({process.title})"
        if payload.notes:
            timeline_details += f" - Nota: {payload.notes}"
            
        event = TelemetryEvent(
            customer_id=customer.id,
            event_type="process_updated",
            metadata_payload={"details": timeline_details}
        )
        db.add(event)
        
    if new_status == "finalizado":
        # Resolve any active SLA alert for this process
        alert_reason_prefix = f"SLA Estourado: reclamação '#{process.id}"
        sla_alerts = db.query(Alert).filter(
            Alert.customer_id == process.customer_id,
            Alert.status == "active",
            Alert.reason.like(f"{alert_reason_prefix}%")
        ).all()
        for a in sla_alerts:
            a.status = "resolved"
        
    db.commit()
    return {"status": "success", "process_id": process.id, "new_status": process.status}


def reconcile_sla_alerts(db: Session, customer_id: int = None):
    # Query all active processes (not finalized)
    query = db.query(CustomerProcess).filter(CustomerProcess.status != "finalizado")
    if customer_id is not None:
        query = query.filter(CustomerProcess.customer_id == customer_id)
        
    active_processes = query.all()
    for p in active_processes:
        if p.created_at:
            now_aware = datetime.now(timezone.utc) if p.created_at.tzinfo else datetime.now()
            elapsed_hours = (now_aware - p.created_at).total_seconds() / 3600.0
            if elapsed_hours >= 24:
                # Check if alert already exists for this process
                alert_reason_prefix = f"SLA Estourado: reclamação '#{p.id}"
                existing_alert = db.query(Alert).filter(
                    Alert.customer_id == p.customer_id,
                    Alert.status == "active",
                    Alert.reason.like(f"{alert_reason_prefix}%")
                ).first()
                
                if not existing_alert:
                    new_alert = Alert(
                        customer_id=p.customer_id,
                        reason=f"SLA Estourado: reclamação '#{p.id} - {p.title}' sem resposta há mais de 24h",
                        status="active"
                    )
                    db.add(new_alert)
                    db.commit()


@router.post("/{customer_id}/processes")
def create_customer_process(customer_id: int, payload: ProcessCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        customer = db.query(Customer).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer não encontrado")
            
    process = CustomerProcess(
        customer_id=customer.id,
        title=payload.title,
        status="aberto",
        opt_in=False
    )
    db.add(process)
    db.commit()
    db.refresh(process)
    
    # Print simulated email confirmation to stdout
    email_recipient = f"{customer.name.lower().replace(' ', '')}@gmail.com"
    if customer.id == 1:
        email_recipient = "joaosantos@gmail.com"
    elif customer.id == 2:
        email_recipient = "maria@padariastrela.com"
        
    print(f"\n>>> [CONFIRMAÇÃO ENVIADA POR E-MAIL] <<<\nDestinatário: {email_recipient}\nAssunto: Recebemos seu feedback: #{process.id} - {process.title}\nMensagem: Olá {customer.name}, recebemos sua manifestação. Para acompanhar o andamento digitalmente e receber alertas rápidos em tempo real, clique no botão de autorização/Opt-in.\n")
    
    return {
        "status": "success",
        "process_id": process.id,
        "title": process.title,
        "process_status": process.status,
        "opt_in": process.opt_in
    }


@router.patch("/processes/{process_id}/opt-in")
def update_process_opt_in(process_id: int, payload: ProcessOptInUpdate, db: Session = Depends(get_db)):
    process = db.query(CustomerProcess).filter(CustomerProcess.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
        
    process.opt_in = payload.opt_in
    
    # Add dynamic timeline event
    customer = db.query(Customer).filter(Customer.id == process.customer_id).first()
    if customer and payload.opt_in:
        print(f"\n>>> [CONSENTIMENTO REGISTRADO] <<<\nCliente: {customer.name}\nProcesso: #{process.id} - {process.title}\nStatus: Opt-In Ativado para Notificações Digitais\n")
        
        event = TelemetryEvent(
            customer_id=customer.id,
            event_type="process_updated",
            metadata_payload={"details": f"Sucesso: Consentimento de notificações recebido para o processo #{process.id} ({process.title})"}
        )
        db.add(event)
        
    db.commit()
    return {"status": "success", "process_id": process.id, "opt_in": process.opt_in}


@router.post("/{customer_id}/reset")
def reset_customer_sandbox(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # 1. Reset CHS and sub-scores
    customer.current_chs = 18
    customer.engagement_score = 20
    customer.progression_score = 40
    customer.success_score = 30
    
    # 2. Delete all Feedbacks for this customer
    db.query(Feedback).filter(Feedback.customer_id == customer_id).delete()
    
    # 3. Delete all Telemetry events for this customer
    db.query(TelemetryEvent).filter(TelemetryEvent.customer_id == customer_id).delete()
    
    # 4. Delete all Processes for this customer
    db.query(CustomerProcess).filter(CustomerProcess.customer_id == customer_id).delete()
    
    # 5. Delete all Alerts for this customer
    db.query(Alert).filter(Alert.customer_id == customer_id).delete()
    
    # 6. Re-seed default alerts and processes if this is Customer 1 (João Santos)
    if customer_id == 1:
        # Initial processes
        p1 = CustomerProcess(customer_id=customer_id, title="Dúvida sobre documentação MEI", status="aberto")
        p2 = CustomerProcess(customer_id=customer_id, title="Erro na emissão de nota fiscal", status="em_andamento")
        db.add_all([p1, p2])
        
        # Initial alerts
        db.add_all([
            Alert(customer_id=customer_id, reason="3 erros consecutivos no cadastro"),
            Alert(customer_id=customer_id, reason="Abandono do fluxo principal"),
            Alert(customer_id=customer_id, reason="Queda brusca de engajamento"),
            Alert(customer_id=customer_id, reason="Reclamação sobre o Curso de Gestão Financeira"),
        ])
    elif customer_id == 2:
        # Maria Silva seeds
        p3 = CustomerProcess(customer_id=customer_id, title="Solicitação de crédito MEI", status="aberto")
        db.add(p3)
        db.add_all([
            Alert(customer_id=customer_id, reason="Inatividade de 30 dias + tarefa abandonada"),
            Alert(customer_id=customer_id, reason="Baixo índice de sucesso"),
            Alert(customer_id=customer_id, reason="Reporte de erro não resolvido"),
            Alert(customer_id=customer_id, reason="Dificuldade no credenciamento do Evento Sebrae"),
        ])
        
    db.commit()
    return {"status": "success", "message": f"Sandbox do cliente {customer_id} reiniciado com sucesso!"}

