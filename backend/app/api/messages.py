from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status, Query
from app.schemas.message import MessageCreateRequest, MessageResponse
from app.services.message_service import MessageService
from app.core.security import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/{conversation_id}", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: str,
    limit: int = Query(150, ge=1, le=500),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return MessageService.get_conversation_messages(conversation_id, current_user["id"], limit)

@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    req: MessageCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return MessageService.create_message(current_user["id"], req.conversation_id, req.content)

@router.put("/{message_id}/read")
async def mark_message_as_read(
    message_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return MessageService.mark_message_as_read(message_id, current_user["id"])
