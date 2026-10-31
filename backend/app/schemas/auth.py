from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    username: str = Field(..., min_length=3, max_length=30, pattern="^[a-zA-Z0-9_]+$")

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthUserResponse(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse
