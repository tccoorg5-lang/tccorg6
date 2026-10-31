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

        clean_code = data.invite_code.strip()
        clean_username = data.username.strip()

        # 1. Validate Invite Code in database
        try:
            inv_res = admin_client.from_("invites").select("*").ilike("code", clean_code).execute()
        except Exception as e:
            logger.error(f"Invite verification database query error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not verify invite code. Please ensure the 'invites' table is created in Supabase."
            )

        if not inv_res.data or len(inv_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid invite code. Please enter a valid invite code to join."
            )

        invite = inv_res.data[0]
        invite_id = invite["id"]
        max_uses = invite.get("max_uses", 2)
        uses_count = invite.get("uses_count", 0)
        existing_conv_id = invite.get("conversation_id")

        if uses_count >= max_uses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invite code has already been used by the maximum number of participants."
            )

        # 2. Check if username is already taken
        try:
            existing_user = admin_client.from_("profiles").select("id").ilike("username", clean_username).execute()
            if existing_user.data and len(existing_user.data) > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"The username '{clean_username}' is already taken. Please choose another username."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Username uniqueness check warning: {e}")

        # 3. Create internal auth user with email_confirm=True (No email/phone required!)
        clean_code_safe = "".join(c for c in clean_code.lower() if c.isalnum())
        internal_email = f"{clean_username.lower()}_{clean_code_safe}@pulse.chat"

        admin_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
        admin_headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        admin_payload = {
            "email": internal_email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {
                "username": clean_username,
                "invite_code": clean_code
            }
        }

        try:
            with httpx.Client(timeout=20.0, http2=False) as http_client:
                resp = http_client.post(admin_url, headers=admin_headers, json=admin_payload)
                resp_data = resp.json()

            if resp.status_code >= 400 or not resp_data.get("id"):
                err_msg = resp_data.get("msg") or resp_data.get("message") or "Registration failed"
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

            user_id = resp_data["id"]

            # 4. Upsert User Profile
            admin_client.from_("profiles").upsert({
                "id": user_id,
                "username": clean_username,
                "email": internal_email,
                "avatar_url": "",
                "updated_at": "now()"
            }).execute()

            # 5. Connect / Synchronize Private 1-to-1 Conversation for this Invite Code
            conversation_id = existing_conv_id

            if not conversation_id:
                # First participant joining with this invite code -> Create the private conversation
                new_conv = admin_client.from_("conversations").insert({}).execute()
                if new_conv.data:
                    conversation_id = new_conv.data[0]["id"]
                    # Add user 1 to participants
                    admin_client.from_("conversation_participants").insert({
                        "conversation_id": conversation_id,
                        "user_id": user_id
                    }).execute()
                    # Update invite record
                    admin_client.from_("invites").update({
                        "conversation_id": conversation_id,
                        "uses_count": uses_count + 1
                    }).eq("id", invite_id).execute()
            else:
                # Second participant joining with this invite code -> Add them to the SAME conversation!
                admin_client.from_("conversation_participants").insert({
                    "conversation_id": conversation_id,
                    "user_id": user_id
                }).execute()
                # Update invite uses count
                admin_client.from_("invites").update({
                    "uses_count": uses_count + 1
                }).eq("id", invite_id).execute()

            # 6. Authenticate and issue JWT token directly so user is immediately logged in
            token_url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
            token_headers = {
                "apikey": settings.SUPABASE_KEY,
                "Content-Type": "application/json"
            }
            token_payload = {
                "email": internal_email,
                "password": data.password
            }

            with httpx.Client(timeout=20.0, http2=False) as http_client:
                t_resp = http_client.post(token_url, headers=token_headers, json=token_payload)
                t_data = t_resp.json()

            access_token = t_data.get("access_token", "")

            return {
                "message": "Joined successfully via invite code",
                "access_token": access_token,
                "token_type": "bearer",
                "conversation_id": conversation_id,
                "user": {
                    "id": user_id,
                    "username": clean_username,
                    "email": internal_email,
                    "avatar_url": ""
                }
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Invite registration error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {str(e)}"
            )

    @staticmethod
    def login(data: UserLoginRequest) -> Dict[str, Any]:
        admin_client = get_supabase_admin_client()
        identifier = data.username.strip()

        # Resolve email: if identifier is already an email, use it; otherwise lookup username in profiles
        resolved_email = None

        if "@" in identifier:
            resolved_email = identifier
        else:
            try:
                # 1. Check username
                prof_res = admin_client.from_("profiles").select("id, email, username, avatar_url").ilike("username", identifier).limit(1).execute()
                if prof_res.data and len(prof_res.data) > 0:
                    resolved_email = prof_res.data[0].get("email")
                
                # 2. Check codename if not found
                if not resolved_email:
                    code_res = admin_client.from_("profiles").select("id, email, username, codename").ilike("codename", identifier).limit(1).execute()
                    if code_res.data and len(code_res.data) > 0:
                        resolved_email = code_res.data[0].get("email")

                # 3. Check member_number if not found
                if not resolved_email:
                    num_res = admin_client.from_("profiles").select("id, email, username, member_number").ilike("member_number", identifier).limit(1).execute()
                    if num_res.data and len(num_res.data) > 0:
                        resolved_email = num_res.data[0].get("email")
            except Exception as e:
                logger.warning(f"Could not resolve identifier to email: {e}")

        if not resolved_email:
            # Check if identifier matches an invite code
            try:
                inv_res = admin_client.from_("invites").select("conversation_id").ilike("code", identifier).execute()
                if inv_res.data and inv_res.data[0].get("conversation_id"):
                    # Find a participant
                    conv_id = inv_res.data[0]["conversation_id"]
                    parts = admin_client.from_("conversation_participants").select("user_id").eq("conversation_id", conv_id).execute()
                    if parts.data:
                        uid = parts.data[0]["user_id"]
                        p_res = admin_client.from_("profiles").select("email").eq("id", uid).single().execute()
                        if p_res.data:
                            resolved_email = p_res.data["email"]
            except Exception as ie:
                logger.warning(f"Invite code login resolution: {ie}")

        if not resolved_email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found. Please check your username or register with an invite code."
            )

        url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
        headers = {
            "apikey": settings.SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "email": resolved_email,
            "password": data.password
        }

        try:
            with httpx.Client(timeout=20.0, http2=False) as http_client:
                resp = http_client.post(url, headers=headers, json=payload)
                resp_data = resp.json()

            if resp.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid username or password"
                )

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
                    "email": user_data.get("email", resolved_email),
                    "username": profile.get("username", identifier),
                    "avatar_url": profile.get("avatar_url", "")
                }
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
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
