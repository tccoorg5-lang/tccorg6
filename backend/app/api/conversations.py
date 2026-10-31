from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from app.schemas.conversation import ConversationCreateRequest, ConversationResponse, ConversationDetailResponse
from app.services.conversation_service import ConversationService
from app.core.security import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationResponse])
async def get_conversations(current_user: Dict[str, Any] = Depends(get_current_user)):
    return ConversationService.get_user_conversations(current_user["id"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_or_get_conversation(
    req: ConversationCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return ConversationService.get_or_create_conversation(current_user["id"], req.recipient_id)

@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation_by_id(
    conversation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return ConversationService.get_conversation_by_id(conversation_id, current_user["id"])
