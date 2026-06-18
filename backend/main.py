from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routers import dashboard
from models.customer import Customer
from models.alert import Alert
from models.feedback import Feedback
from models.process import CustomerProcess
from routers import auth, dashboard, telemetry, customers
from models.user import User

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SENSE MVP API")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "https://stirring-concha-57c303.netlify.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(telemetry.router)
app.include_router(customers.router)

@app.on_event("startup")
def seed_database():
    # Run manual migration for new Feedback columns
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS response VARCHAR;"))
            conn.execute(text("ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;"))
        print("Migrações de banco de dados executadas com sucesso!")
    except Exception as e:
        print(f"Erro ao rodar migrações manuais: {e}")

    db = SessionLocal()
    # Verifica se já existem clientes
    if db.query(Customer).count() == 0:
        print("Semeando banco de dados com dados iniciais...")
        
        # Criação de Clientes Fictícios (Riscos)
        c1 = Customer(name="João Santos", company="Tech Norte LTDA", current_chs=18, engagement_score=20, progression_score=40, success_score=30)
        c2 = Customer(name="Maria Silva", company="Padaria Estrela", current_chs=18, engagement_score=30, progression_score=45, success_score=25)
        c3 = Customer(name="Ana Costa", company="Confecções Sol", current_chs=18, engagement_score=15, progression_score=30, success_score=10)
        
        # Alguns em atenção
        c4 = Customer(name="Carlos Mendes", company="Mendes & Cia", current_chs=55)
        c5 = Customer(name="Fernanda Lima", company="Estética Beleza", current_chs=60)
        
        # Alguns saudáveis
        c6 = Customer(name="Roberto Souza", company="Souza Logística", current_chs=90)
        c7 = Customer(name="Juliana Marques", company="Marques Advocacia", current_chs=85)

        db.add_all([c1, c2, c3, c4, c5, c6, c7])
        db.commit()

        # Criação de Alertas para os clientes em Risco
        db.add_all([
            Alert(customer_id=c1.id, reason="3 erros consecutivos no cadastro"),
            Alert(customer_id=c1.id, reason="Abandono do fluxo principal"),
            Alert(customer_id=c1.id, reason="Queda brusca de engajamento"),
            Alert(customer_id=c1.id, reason="Reclamação sobre o Curso de Gestão Financeira"),
            
            Alert(customer_id=c2.id, reason="Inatividade de 30 dias + tarefa abandonada"),
            Alert(customer_id=c2.id, reason="Baixo índice de sucesso"),
            Alert(customer_id=c2.id, reason="Reporte de erro não resolvido"),
            Alert(customer_id=c2.id, reason="Dificuldade no credenciamento do Evento Sebrae"),
            
            Alert(customer_id=c3.id, reason="Abandono em tarefa crítica"),
            Alert(customer_id=c3.id, reason="Fricção de navegação detectada"),
            Alert(customer_id=c3.id, reason="Login expirado diversas vezes"),
            Alert(customer_id=c3.id, reason="Suporte técnico sem resposta há 48h"),
        ])
        db.commit()
        print("Banco de dados semeado com sucesso!")

    # Seeding Customer Processes if empty
    if db.query(CustomerProcess).count() == 0:
        c1 = db.query(Customer).filter(Customer.name == "João Santos").first()
        c2 = db.query(Customer).filter(Customer.name == "Maria Silva").first()
        if c1 and c2:
            p1 = CustomerProcess(customer_id=c1.id, title="Dúvida sobre documentação MEI", status="aberto")
            p2 = CustomerProcess(customer_id=c1.id, title="Erro na emissão de nota fiscal", status="em_andamento")
            p3 = CustomerProcess(customer_id=c2.id, title="Solicitação de crédito MEI", status="aberto")
            db.add_all([p1, p2, p3])
            db.commit()
            print("Processos iniciais de clientes semeados com sucesso!")

    db.close()

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "SENSE API is running"}
