from typing import Optional
from pydantic import BaseModel, Field

class UserRegisterRequest(BaseModel):
    invite_code: str = Field(..., min_length=2, max_length=50, description="Invite code provided by admin")
    username: str = Field(..., min_length=2, max_length=30, pattern=r"^[a-zA-Z0-9_\-\.]+$")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class UserLoginRequest(BaseModel):
    username: str = Field(..., min_length=2, description="Username or email")
    password: str = Field(..., min_length=6)

class AuthUserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse
