from pydantic import BaseModel
from typing import List, Optional
from schemas.feedback import FeedbackResponse

class ScoreItem(BaseModel):
    value: int
    max: int
    color: str

class CustomerScores(BaseModel):
    frequencia: ScoreItem
    progressao: ScoreItem
    retorno: ScoreItem
    engajamento: ScoreItem

class TimelineEventResponse(BaseModel):
    title: str
    time: str
    type: str # alert, eye, check
    alert_id: Optional[int] = None
    status: Optional[str] = None

class AlertStatusUpdate(BaseModel):
    status: str

class ProcessItemResponse(BaseModel):
    id: str
    title: str
    period: str
    dots: List[str]
    status: str
    notes: Optional[str] = None

class CustomerProfileResponse(BaseModel):
    id: int
    name: str
    company: str
    phone: str
    email: str
    status: str
    score: int
    scores: CustomerScores
    timeline: List[TimelineEventResponse]
    processes: List[ProcessItemResponse]
    feedbacks: List[FeedbackResponse]
