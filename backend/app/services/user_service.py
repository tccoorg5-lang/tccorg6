import logging
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin_client
from app.schemas.user import UserProfileUpdateRequest

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    def search_users(current_user_id: str, query: Optional[str] = None) -> List[Dict[str, Any]]:
        client = get_supabase_admin_client()
        try:
            builder = client.from_("profiles").select("id, username, email, avatar_url")
            
            # Exclude current user
            builder = builder.neq("id", current_user_id)

            if query:
                # Search by username or email
                builder = builder.or_(f"username.ilike.%{query}%,email.ilike.%{query}%")

            builder = builder.order("username").limit(20)
            res = builder.execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Search users error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to query users: {str(e)}"
            )

    @staticmethod
    def get_user_by_id(user_id: str) -> Dict[str, Any]:
        client = get_supabase_admin_client()
        try:
            res = client.from_("profiles").select("id, username, email, avatar_url, created_at").eq("id", user_id).single().execute()
            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            return res.data
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Get user by id error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve user"
            )

    @staticmethod
    def update_profile(user_id: str, data: UserProfileUpdateRequest) -> Dict[str, Any]:
        client = get_supabase_admin_client()
        update_data = {}
        if data.username is not None:
            # Check uniqueness if username changed
            existing = client.from_("profiles").select("id").eq("username", data.username).neq("id", user_id).execute()
            if existing.data and len(existing.data) > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken by another user"
                )
            update_data["username"] = data.username

        if data.avatar_url is not None:
            update_data["avatar_url"] = data.avatar_url

        if not update_data:
            return UserService.get_user_by_id(user_id)

        update_data["updated_at"] = "now()"

        try:
            res = client.from_("profiles").update(update_data).eq("id", user_id).execute()
            if not res.data:
                # Query fresh data
                return UserService.get_user_by_id(user_id)
            return res.data[0]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Update profile error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update profile: {str(e)}"
            )
