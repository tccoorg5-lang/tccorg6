from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class UserProfileResponse(BaseModel):
    id: str
    username: str
    email: str
    avatar_url: Optional[str] = ""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UserProfileUpdateRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=30, pattern="^[a-zA-Z0-9_]+$")
    avatar_url: Optional[str] = None

class UserSearchResult(BaseModel):
    id: str
    username: str
    email: str
    avatar_url: Optional[str] = ""
