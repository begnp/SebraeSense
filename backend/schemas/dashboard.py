from pydantic import BaseModel
from typing import List

class StatCardResponse(BaseModel):
    risks: int
    attention: int
    healthy: int

class QueueUserResponse(BaseModel):
    id: int
    initials: str
    name: str
    company: str
    score: int
    reason: str
    alertCount: int
    date: str
    scheme: str # "red" | "yellow" | "green"

class HighlightUserResponse(BaseModel):
    id: int
    initials: str
    name: str
    company: str
    score: int
    alertCount: int
    reason: str
    engagement: int
    progression: int
    success: int

class ChartDataPoint(BaseModel):
    name: str
    chs: int

class DashboardResponse(BaseModel):
    stats: StatCardResponse
    queue: List[QueueUserResponse]
    highlights: List[HighlightUserResponse]
    chart: List[ChartDataPoint]
