import logging
from typing import Dict, Any, List
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin_client

logger = logging.getLogger(__name__)

class MemberService:
    @staticmethod
    def get_my_society_profile(user_id: str) -> Dict[str, Any]:
        admin_client = get_supabase_admin_client()
        try:
            res = admin_client.from_("profiles").select(
                "id, codename, member_number, society_role, society_rank, designation, points, progression_level, is_hall_of_legends, avatar_url, is_active, created_at, username, email"
            ).eq("id", user_id).single().execute()

            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Member profile not found"
                )

            data = res.data
            # Set fallback codename to username if not set yet
            if not data.get("codename"):
                data["codename"] = data.get("username", "Unknown Member")

            return data

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching member profile: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to load society profile"
            )

    @staticmethod
    def get_all_members(founder_id: str) -> List[Dict[str, Any]]:
        admin_client = get_supabase_admin_client()
        try:
            res = admin_client.from_("profiles").select(
                "id, codename, member_number, society_role, society_rank, designation, points, progression_level, is_hall_of_legends, avatar_url, is_active, created_at"
            ).order("points", desc=True).execute()

            return res.data or []

        except Exception as e:
            logger.error(f"Error fetching member roster: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch society roster"
            )
