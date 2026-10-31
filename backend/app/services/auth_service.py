import logging
from typing import Dict, Any
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_client, get_supabase_admin_client
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, AuthResponse, AuthUserResponse

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def register(data: UserRegisterRequest) -> Dict[str, Any]:
        client = get_supabase_client()
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

        try:
            # Sign up via Supabase Auth
            auth_res = client.auth.sign_up({
                "email": data.email,
                "password": data.password,
                "options": {
                    "data": {
                        "username": data.username
                    }
                }
            })

            if not auth_res.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Registration failed"
                )

            user = auth_res.user

            # Ensure profile record exists
            try:
                admin_client.from_("profiles").upsert({
                    "id": user.id,
                    "username": data.username,
                    "email": data.email,
                    "avatar_url": "",
                    "updated_at": "now()"
                }).execute()
            except Exception as pe:
                logger.warning(f"Profile upsert trigger handled or logged: {pe}")

            return {
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": data.username
                },
                "session": auth_res.session
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
        client = get_supabase_client()
        admin_client = get_supabase_admin_client()

        try:
            res = client.auth.sign_in_with_password({
                "email": data.email,
                "password": data.password
            })

            if not res.session or not res.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )

            # Retrieve profile details
            prof_res = admin_client.from_("profiles").select("*").eq("id", res.user.id).single().execute()
            profile = prof_res.data if prof_res else {}

            return {
                "access_token": res.session.access_token,
                "token_type": "bearer",
                "user": {
                    "id": res.user.id,
                    "email": res.user.email,
                    "username": profile.get("username", res.user.email.split("@")[0]),
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
