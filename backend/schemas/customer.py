from pydantic import BaseModel
from typing import List

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

class ProcessItemResponse(BaseModel):
    id: str
    title: str
    period: str
    dots: List[str]

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
