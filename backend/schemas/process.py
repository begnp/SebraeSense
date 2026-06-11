from pydantic import BaseModel
from typing import Optional

class ProcessStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
