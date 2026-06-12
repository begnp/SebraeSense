from pydantic import BaseModel
from typing import Optional

class ProcessStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class ProcessCreate(BaseModel):
    title: str

class ProcessOptInUpdate(BaseModel):
    opt_in: bool
