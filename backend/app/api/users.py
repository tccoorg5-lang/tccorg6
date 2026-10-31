from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from app.schemas.user import UserSearchResult, UserProfileResponse, UserProfileUpdateRequest
from app.services.user_service import UserService
from app.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserSearchResult])
async def search_users(
    query: Optional[str] = Query(None, description="Search term for username or email"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return UserService.search_users(current_user["id"], query)

@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_by_id(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return UserService.get_user_by_id(user_id)

@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    data: UserProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return UserService.update_profile(current_user["id"], data)
