from pydantic import BaseModel
from typing import Dict, Any, Optional

class TelemetryCreate(BaseModel):
    customer_id: int
    event_type: str
    metadata_payload: Optional[Dict[str, Any]] = None
