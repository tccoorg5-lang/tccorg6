from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, AuthResponse
from app.schemas.user import UserProfileResponse
from app.services.auth_service import AuthService
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest):
    return AuthService.register(req)

@router.post("/login", response_model=AuthResponse)
async def login(req: UserLoginRequest):
    return AuthService.login(req)

@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return AuthService.get_me(current_user["id"])
