import logging
import httpx
from typing import Dict, Any
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.supabase import get_supabase_admin_client
from app.schemas.auth import UserRegisterRequest, UserLoginRequest

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def register(data: UserRegisterRequest) -> Dict[str, Any]:
        admin_client = get_supabase_admin_client()

        # Check if username is already taken
        try:
            existing = admin_client.from_("profiles").select("id").eq("username", data.username).execute()
            if existing.data and len(existing.data) > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Could not verify username uniqueness directly: {e}")

        # Prefer Admin API with auto email_confirm to bypass SMTP rate limits
        if settings.SUPABASE_SERVICE_ROLE_KEY:
            admin_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
            admin_headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
            admin_payload = {
                "email": data.email,
                "password": data.password,
                "email_confirm": True,
                "user_metadata": {
                    "username": data.username
                }
            }

            try:
                with httpx.Client(timeout=20.0, http2=False) as http_client:
                    resp = http_client.post(admin_url, headers=admin_headers, json=admin_payload)
                    resp_data = resp.json()

                if resp.status_code < 400 and resp_data.get("id"):
                    user_id = resp_data["id"]
                    try:
                        admin_client.from_("profiles").upsert({
                            "id": user_id,
                            "username": data.username,
                            "email": data.email,
                            "avatar_url": "",
                            "updated_at": "now()"
                        }).execute()
                    except Exception as pe:
                        logger.warning(f"Profile upsert notice: {pe}")

                    return {
                        "message": "User registered successfully",
                        "user": {
                            "id": user_id,
                            "email": data.email,
                            "username": data.username
                        }
                    }
                elif resp.status_code == 422 or "already exists" in str(resp_data):
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with this email already exists")
            except HTTPException:
                raise
            except Exception as admin_err:
                logger.warning(f"Admin registration fallback: {admin_err}")

        # Fallback to standard Supabase Auth REST endpoint

        try:
            with httpx.Client(timeout=20.0, http2=False) as http_client:
                resp = http_client.post(url, headers=headers, json=payload)
                resp_data = resp.json()

            if resp.status_code >= 400:
                error_msg = resp_data.get("msg") or resp_data.get("message") or resp_data.get("error_description") or "Registration failed"
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

            user = resp_data.get("user") or resp_data
            user_id = user.get("id")

            # Guarantee profile record exists
            if user_id:
                try:
                    admin_client.from_("profiles").upsert({
                        "id": user_id,
                        "username": data.username,
                        "email": data.email,
                        "avatar_url": "",
                        "updated_at": "now()"
                    }).execute()
                except Exception as pe:
                    logger.warning(f"Profile upsert notice: {pe}")

            return {
                "message": "User registered successfully",
                "user": {
                    "id": user_id,
                    "email": data.email,
                    "username": data.username
                },
                "session": resp_data.get("session")
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Registration error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    @staticmethod
    def login(data: UserLoginRequest) -> Dict[str, Any]:
        admin_client = get_supabase_admin_client()

        url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
        headers = {
            "apikey": settings.SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "email": data.email,
            "password": data.password
        }

        try:
            with httpx.Client(timeout=20.0, http2=False) as http_client:
                resp = http_client.post(url, headers=headers, json=payload)
                resp_data = resp.json()

            if resp.status_code >= 400:
                error_msg = resp_data.get("error_description") or resp_data.get("msg") or "Invalid email or password"
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_msg)

            access_token = resp_data.get("access_token")
            user_data = resp_data.get("user", {})
            user_id = user_data.get("id")

            if not access_token or not user_id:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login credentials")

            # Retrieve profile details
            prof_res = admin_client.from_("profiles").select("*").eq("id", user_id).single().execute()
            profile = prof_res.data if prof_res else {}

            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user_id,
                    "email": user_data.get("email", data.email),
                    "username": profile.get("username", data.email.split("@")[0]),
                    "avatar_url": profile.get("avatar_url", "")
                }
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )

    @staticmethod
    def get_me(user_id: str) -> Dict[str, Any]:
        admin_client = get_supabase_admin_client()
        try:
            res = admin_client.from_("profiles").select("*").eq("id", user_id).single().execute()
            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found"
                )
            return res.data
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Get me error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve profile"
            )
