from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.user import UserSearchResult
from app.schemas.message import MessageResponse

class ConversationCreateRequest(BaseModel):
    recipient_id: str

class ConversationResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    partner: Optional[UserSearchResult] = None
    latest_message: Optional[MessageResponse] = None
    unread_count: int = 0

class ConversationDetailResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    participants: List[UserSearchResult]
