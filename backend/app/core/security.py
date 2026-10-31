import logging
import httpx
from typing import Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.supabase import get_supabase_admin_client

logger = logging.getLogger(__name__)
security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer)
) -> Dict[str, Any]:
    """
    Validates Supabase Bearer access token against Supabase Auth API.
    Returns authenticated user information dictionary.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    url = f"{settings.SUPABASE_URL}/auth/v1/user"
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {token}"
    }

    try:
        with httpx.Client(timeout=15.0, http2=False) as http_client:
            resp = http_client.get(url, headers=headers)

        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_data = resp.json()
        return {
            "id": user_data.get("id"),
            "email": user_data.get("email"),
            "user_metadata": user_data.get("user_metadata") or {},
            "access_token": token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def require_authenticated_member(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Ensures user is an active society member and injects official profile credentials.
    """
    admin_client = get_supabase_admin_client()
    try:
        prof_res = admin_client.from_("profiles").select("*").eq("id", current_user["id"]).single().execute()
        if not prof_res.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No registered society profile found"
            )
        profile = prof_res.data
        if not profile.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Membership has been revoked or deactivated"
            )
        current_user["profile"] = profile
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Member verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify membership status"
        )

async def require_founder(
    current_user: Dict[str, Any] = Depends(require_authenticated_member)
) -> Dict[str, Any]:
    """
    Strict server-side founder verification. Never trusts client-side role claims.
    """
    profile = current_user.get("profile", {})
    society_role = profile.get("society_role")
    
    if society_role != "founder":
        logger.warning(f"Unauthorized administrative attempt by user {current_user['id']} (role={society_role})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Founder clearance required for this operation"
        )
    
    return current_user
