from typing import List
from fastapi import APIRouter, Depends
from app.schemas.society import MemberProfileResponse
from app.services.member_service import MemberService
from app.core.security import require_authenticated_member, require_founder

router = APIRouter(prefix="/members", tags=["Society Members"])

@router.get("/me", response_model=MemberProfileResponse)
async def get_my_profile(
    current_member: dict = Depends(require_authenticated_member)
):
    """
    Returns authenticated member's official society profile and codename dossier.
    """
    return MemberService.get_my_society_profile(current_member["id"])

@router.get("/roster", response_model=List[MemberProfileResponse])
async def get_society_roster(
    current_founder: dict = Depends(require_founder)
):
    """
    Founder-Only: Returns complete society roster ordered by merit standings.
    """
    return MemberService.get_all_members(current_founder["id"])
