from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class MessageCreateRequest(BaseModel):
    conversation_id: str
    content: str = Field(..., min_length=1, max_length=5000)

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    created_at: datetime
    is_read: bool = False
