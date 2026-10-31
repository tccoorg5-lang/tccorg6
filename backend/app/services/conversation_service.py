import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin_client

logger = logging.getLogger(__name__)

class ConversationService:
    @staticmethod
    def get_or_create_conversation(current_user_id: str, recipient_id: str) -> Dict[str, Any]:
        if current_user_id == recipient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start a conversation with yourself"
            )

        client = get_supabase_admin_client()

        # Check if recipient exists
        recipient_res = client.from_("profiles").select("id, username, email, avatar_url").eq("id", recipient_id).single().execute()
        if not recipient_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient user not found"
            )
        recipient_profile = recipient_res.data

        try:
            # 1. Find existing conversations for current_user
            user_convs = client.from_("conversation_participants").select("conversation_id").eq("user_id", current_user_id).execute()
            user_conv_ids = [row["conversation_id"] for row in (user_convs.data or [])]

            if user_conv_ids:
                # Check which of these conversations also has recipient_id
                shared_convs = client.from_("conversation_participants")\
                    .select("conversation_id")\
                    .in_("conversation_id", user_conv_ids)\
                    .eq("user_id", recipient_id)\
                    .execute()

                if shared_convs.data and len(shared_convs.data) > 0:
                    conv_id = shared_convs.data[0]["conversation_id"]
                    conv_res = client.from_("conversations").select("*").eq("id", conv_id).single().execute()
                    conv_data = conv_res.data
                    conv_data["partner"] = recipient_profile
                    return conv_data

            # 2. No existing conversation found -> Create a new one
            new_conv = client.from_("conversations").insert({}).execute()
            if not new_conv.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create new conversation record"
                )

            conv_id = new_conv.data[0]["id"]

            # 3. Insert both participants
            client.from_("conversation_participants").insert([
                {"conversation_id": conv_id, "user_id": current_user_id},
                {"conversation_id": conv_id, "user_id": recipient_id}
            ]).execute()

            conv_result = new_conv.data[0]
            conv_result["partner"] = recipient_profile
            return conv_result

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_or_create_conversation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to initialize conversation: {str(e)}"
            )

    @staticmethod
    def get_user_conversations(current_user_id: str) -> List[Dict[str, Any]]:
        client = get_supabase_admin_client()
        try:
            # Get all conversation IDs current user participates in
            user_parts = client.from_("conversation_participants").select("conversation_id").eq("user_id", current_user_id).execute()
            if not user_parts.data:
                return []

            conv_ids = [p["conversation_id"] for p in user_parts.data]

            # Get conversations ordered by updated_at DESC
            convs_res = client.from_("conversations").select("*").in_("id", conv_ids).order("updated_at", desc=True).execute()
            conversations = convs_res.data or []

            # Populate partner info, latest message, and unread counts
            result = []
            for conv in conversations:
                conv_id = conv["id"]

                # Find partner participant
                partner_part = client.from_("conversation_participants")\
                    .select("user_id")\
                    .eq("conversation_id", conv_id)\
                    .neq("user_id", current_user_id)\
                    .limit(1)\
                    .execute()

                partner_data = None
                if partner_part.data:
                    partner_id = partner_part.data[0]["user_id"]
                    p_res = client.from_("profiles").select("id, username, email, avatar_url").eq("id", partner_id).single().execute()
                    partner_data = p_res.data

                # Get latest message
                msg_res = client.from_("messages")\
                    .select("*")\
                    .eq("conversation_id", conv_id)\
                    .order("created_at", desc=True)\
                    .limit(1)\
                    .execute()
                latest_message = msg_res.data[0] if (msg_res.data and len(msg_res.data) > 0) else None

                # Count unread messages sent by the partner
                unread_count = 0
                if partner_data:
                    unread_res = client.from_("messages")\
                        .select("id", count="exact")\
                        .eq("conversation_id", conv_id)\
                        .eq("sender_id", partner_data["id"])\
                        .eq("is_read", False)\
                        .execute()
                    unread_count = unread_res.count if unread_res.count is not None else len(unread_res.data or [])

                result.append({
                    "id": conv["id"],
                    "created_at": conv["created_at"],
                    "updated_at": conv["updated_at"],
                    "partner": partner_data,
                    "latest_message": latest_message,
                    "unread_count": unread_count
                })

            return result

        except Exception as e:
            logger.error(f"Error fetching conversations: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch conversations: {str(e)}"
            )

    @staticmethod
    def get_conversation_by_id(conversation_id: str, current_user_id: str) -> Dict[str, Any]:
        client = get_supabase_admin_client()
        try:
            # Check user is participant
            check = client.from_("conversation_participants")\
                .select("id")\
                .eq("conversation_id", conversation_id)\
                .eq("user_id", current_user_id)\
                .execute()

            if not check.data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have access to this conversation"
                )

            conv_res = client.from_("conversations").select("*").eq("id", conversation_id).single().execute()
            if not conv_res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )

            # Get all participants with profiles
            participants_parts = client.from_("conversation_participants").select("user_id").eq("conversation_id", conversation_id).execute()
            u_ids = [p["user_id"] for p in (participants_parts.data or [])]
            prof_res = client.from_("profiles").select("id, username, email, avatar_url").in_("id", u_ids).execute()

            conv_data = conv_res.data
            conv_data["participants"] = prof_res.data or []
            return conv_data

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching conversation by id: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch conversation details"
            )
