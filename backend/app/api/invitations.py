from fastapi import APIRouter, Depends, Request, status
from app.schemas.society import (
    InvitationCreateRequest,
    InvitationCreateResponse,
    InvitationVerifyRequest,
    InvitationVerifyResponse,
    InvitationRedeemRequest
)
from app.services.invitation_service import InvitationService
from app.core.security import require_founder

router = APIRouter(prefix="/invitations", tags=["Society Invitations"])

@router.post("/create", response_model=InvitationCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    req: InvitationCreateRequest,
    request: Request,
    current_founder: dict = Depends(require_founder)
):
    """
    Founder-Only: Issues a high-entropy, cryptographically hashed society invitation token.
    """
    client_ip = request.client.host if request.client else ""
    return InvitationService.create_invitation(current_founder["id"], req, client_ip)

@router.post("/verify", response_model=InvitationVerifyResponse)
async def verify_invitation(req: InvitationVerifyRequest):
    """
    Public Pre-Check: Validates token validity without leaking unhashed data.
    """
    return InvitationService.verify_invitation(req.token)

@router.post("/redeem", status_code=status.HTTP_201_CREATED)
async def redeem_invitation(
    req: InvitationRedeemRequest,
    request: Request
):
    """
    Public Redemption: Atomically validates token, binds intended email, and inducts member.
    """
    client_ip = request.client.host if request.client else ""
    return InvitationService.redeem_invitation(req, client_ip)
