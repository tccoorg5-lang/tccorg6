from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

class InvitationCreateRequest(BaseModel):
    intended_name: str = Field(..., min_length=2, max_length=100, description="Legal or preferred real name")
    intended_email: EmailStr = Field(..., description="Recipient email (token binds strictly to this email)")
    assigned_codename: str = Field(..., min_length=2, max_length=50, pattern=r"^[A-Za-z0-9_\-\. ]+$")
    assigned_role: str = Field(default="member", description="founder, council, member, initiate")
    assigned_rank: str = Field(default="Initiate", description="Societal rank")
    expiry_days: int = Field(default=7, ge=1, le=90)

class InvitationCreateResponse(BaseModel):
    message: str
    plain_token: str
    invitation_id: str
    assigned_codename: str
    intended_email: str
    expires_at: datetime

class InvitationVerifyRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=120)

class InvitationVerifyResponse(BaseModel):
    valid: bool
    assigned_codename: Optional[str] = None
    masked_email: Optional[str] = None
    assigned_role: Optional[str] = None
    assigned_rank: Optional[str] = None
    message: Optional[str] = None

class InvitationRedeemRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class MemberProfileResponse(BaseModel):
    id: str
    codename: Optional[str] = None
    member_number: Optional[str] = None
    society_role: str = "member"
    society_rank: str = "Initiate"
    designation: Optional[str] = "Society Member"
    points: int = 0
    progression_level: int = 1
    is_hall_of_legends: bool = False
    avatar_url: Optional[str] = ""
    is_active: bool = True
    created_at: Optional[datetime] = None

class FounderProvisionRequest(BaseModel):
    master_provision_key: str
    email: EmailStr
    password: str = Field(..., min_length=8)
    codename: str = Field(default="Sovereign", min_length=2, max_length=50)
