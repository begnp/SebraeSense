from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FeedbackCreate(BaseModel):
    comment: str
    rating: Optional[int] = None

class FeedbackResponse(BaseModel):
    id: int
    customer_id: int
    comment: str
    rating: Optional[int] = None
    sentiment: str
    created_at: datetime

    class Config:
        from_attributes = True
