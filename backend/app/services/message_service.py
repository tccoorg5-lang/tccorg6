import logging
from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin_client

logger = logging.getLogger(__name__)

class MessageService:
    @staticmethod
    def get_conversation_messages(conversation_id: str, current_user_id: str, limit: int = 150) -> List[Dict[str, Any]]:
        client = get_supabase_admin_client()

        # Check membership
        check = client.from_("conversation_participants")\
            .select("id")\
            .eq("conversation_id", conversation_id)\
            .eq("user_id", current_user_id)\
            .execute()

        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view messages in this conversation"
            )

        try:
            res = client.from_("messages")\
                .select("*")\
                .eq("conversation_id", conversation_id)\
                .order("created_at", desc=False)\
                .limit(limit)\
                .execute()

            messages = res.data or []

            # Mark unread messages sent by others as read
            try:
                client.from_("messages")\
                    .update({"is_read": True})\
                    .eq("conversation_id", conversation_id)\
                    .neq("sender_id", current_user_id)\
                    .eq("is_read", False)\
                    .execute()
            except Exception as read_err:
                logger.warning(f"Failed to auto-mark messages as read: {read_err}")

            return messages

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching messages: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to load messages: {str(e)}"
            )

    @staticmethod
    def create_message(current_user_id: str, conversation_id: str, content: str) -> Dict[str, Any]:
        client = get_supabase_admin_client()

        # Check membership
        check = client.from_("conversation_participants")\
            .select("id")\
            .eq("conversation_id", conversation_id)\
            .eq("user_id", current_user_id)\
            .execute()

        if not check.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot post messages to a conversation you do not belong to"
            )

        try:
            # Insert message
            insert_res = client.from_("messages").insert({
                "conversation_id": conversation_id,
                "sender_id": current_user_id,
                "content": content,
                "is_read": False
            }).execute()

            if not insert_res.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to send message"
                )

            # Update conversation updated_at
            try:
                client.from_("conversations")\
                    .update({"updated_at": "now()"})\
                    .eq("id", conversation_id)\
                    .execute()
            except Exception as upd_err:
                logger.warning(f"Could not explicitly update conversation updated_at: {upd_err}")

            return insert_res.data[0]

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send message: {str(e)}"
            )

    @staticmethod
    def mark_message_as_read(message_id: str, current_user_id: str) -> Dict[str, Any]:
        client = get_supabase_admin_client()
        try:
            msg_res = client.from_("messages").select("id, conversation_id, sender_id").eq("id", message_id).single().execute()
            if not msg_res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Message not found"
                )
            
            msg = msg_res.data

            # Check participant
            check = client.from_("conversation_participants")\
                .select("id")\
                .eq("conversation_id", msg["conversation_id"])\
                .eq("user_id", current_user_id)\
                .execute()

            if not check.data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Unauthorized"
                )

            upd = client.from_("messages").update({"is_read": True}).eq("id", message_id).execute()
            return {"status": "success", "message_id": message_id, "is_read": True}

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error marking message as read: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update message status"
            )
