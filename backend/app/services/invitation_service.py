import logging
import httpx
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.crypto import generate_invitation_token, hash_token, mask_email
from app.core.supabase import get_supabase_admin_client
from app.schemas.society import InvitationCreateRequest, InvitationVerifyResponse, InvitationRedeemRequest

logger = logging.getLogger(__name__)

class InvitationService:
    @staticmethod
    def create_invitation(founder_id: str, data: InvitationCreateRequest, client_ip: str = "") -> Dict[str, Any]:
        admin_client = get_supabase_admin_client()

        # Check if codename is already assigned to an existing profile or pending invitation
        clean_codename = data.assigned_codename.strip()
        prof_check = admin_client.from_("profiles").select("id").ilike("codename", clean_codename).execute()
        if prof_check.data and len(prof_check.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Codename '{clean_codename}' is already assigned to a member"
            )

        inv_check = admin_client.from_("invitations").select("id").ilike("assigned_codename", clean_codename).eq("invitation_status", "pending").execute()
        if inv_check.data and len(inv_check.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Codename '{clean_codename}' is already reserved in a pending invitation"
            )

        # Generate secure plain token & SHA-256 hash
        plain_token = generate_invitation_token()
        token_hash = hash_token(plain_token)
        expires_at = datetime.now(timezone.utc) + timedelta(days=data.expiry_days)

        try:
            insert_res = admin_client.from_("invitations").insert({
                "invitation_token_hash": token_hash,
                "intended_name": data.intended_name.strip(),
                "intended_email": data.intended_email.strip().lower(),
                "assigned_codename": clean_codename,
                "assigned_role": data.assigned_role,
                "assigned_rank": data.assigned_rank,
                "invitation_status": "pending",
                "expires_at": expires_at.isoformat(),
                "created_by": founder_id
            }).execute()

            if not insert_res.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate invitation record"
                )

            inv_row = insert_res.data[0]

            # Audit log
            try:
                admin_client.from_("administrative_audit_logs").insert({
                    "actor_id": founder_id,
                    "action": "INVITATION_ISSUED",
                    "target_resource": "invitations",
                    "target_id": inv_row["id"],
                    "ip_address": client_ip,
                    "details": {
                        "intended_email": data.intended_email.strip().lower(),
                        "assigned_codename": clean_codename,
                        "assigned_role": data.assigned_role,
                        "assigned_rank": data.assigned_rank
                    }
                }).execute()
            except Exception as ae:
                logger.warning(f"Audit log warning: {ae}")

            return {
                "message": "Invitation issued successfully",
                "plain_token": plain_token,
                "invitation_id": inv_row["id"],
                "assigned_codename": clean_codename,
                "intended_email": data.intended_email.strip().lower(),
                "expires_at": expires_at
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating invitation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not issue invitation: {str(e)}"
            )

    @staticmethod
    def verify_invitation(token: str) -> InvitationVerifyResponse:
        admin_client = get_supabase_admin_client()
        clean_token = token.strip()
        token_hash = hash_token(clean_token)

        try:
            # Match by SHA-256 hash OR directly by custom manually-typed invite code
            res = admin_client.from_("invitations").select("*").or_(
                f"invitation_token_hash.eq.{token_hash},invitation_token_hash.eq.{clean_token},invitation_token_hash.ilike.{clean_token}"
            ).execute()
            if not res.data or len(res.data) == 0:
                return InvitationVerifyResponse(
                    valid=False,
                    message="Invalid invitation token"
                )

            inv = res.data[0]
            status_val = inv.get("invitation_status")

            if status_val != "pending":
                return InvitationVerifyResponse(
                    valid=False,
                    message=f"Invitation has already been {status_val}"
                )

            # Check expiration
            expires_at = datetime.fromisoformat(inv["expires_at"].replace("Z", "+00:00"))
            if expires_at < datetime.now(timezone.utc):
                # Mark expired
                admin_client.from_("invitations").update({"invitation_status": "expired"}).eq("id", inv["id"]).execute()
                return InvitationVerifyResponse(
                    valid=False,
                    message="Invitation token has expired"
                )

            return InvitationVerifyResponse(
                valid=True,
                assigned_codename=inv.get("assigned_codename"),
                masked_email=mask_email(inv.get("intended_email", "")),
                assigned_role=inv.get("assigned_role"),
                assigned_rank=inv.get("assigned_rank"),
                message="Valid invitation code"
            )

        except Exception as e:
            logger.error(f"Error verifying invitation: {e}")
            return InvitationVerifyResponse(
                valid=False,
                message=f"Verification failed: {str(e)}"
            )

    @staticmethod
    def redeem_invitation(data: InvitationRedeemRequest, client_ip: str = "") -> Dict[str, Any]:
        admin_client = get_supabase_admin_client()
        clean_email = data.email.strip().lower()
        clean_token = data.token.strip()
        token_hash = hash_token(clean_token)

        # 1. Pre-check invitation (supports both hashed tokens and manually-typed invite codes)
        inv_res = admin_client.from_("invitations").select("*").or_(
            f"invitation_token_hash.eq.{token_hash},invitation_token_hash.eq.{clean_token},invitation_token_hash.ilike.{clean_token}"
        ).execute()
        if not inv_res.data or len(inv_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid invitation token"
            )

        inv = inv_res.data[0]

        if inv.get("invitation_status") != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This invitation has already been {inv.get('invitation_status')}"
            )

        expires_at = datetime.fromisoformat(inv["expires_at"].replace("Z", "+00:00"))
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation token has expired"
            )

        # 2. Strict email match validation
        if inv.get("intended_email", "").strip().lower() != clean_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address does not match the recipient intended for this invitation token"
            )

        # 3. Create user in Supabase Auth via Admin API
        admin_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
        admin_headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        admin_payload = {
            "email": clean_email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {
                "codename": inv["assigned_codename"],
                "role": inv["assigned_role"]
            }
        }

        try:
            with httpx.Client(timeout=20.0, http2=False) as http_client:
                resp = http_client.post(admin_url, headers=admin_headers, json=admin_payload)
                resp_data = resp.json()

            if resp.status_code >= 400 or not resp_data.get("id"):
                err_msg = resp_data.get("msg") or resp_data.get("message") or "Registration failed"
                if "already exists" in str(err_msg):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="An account with this email already exists"
                    )
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

            user_id = resp_data["id"]

            # 4. Execute atomic redemption stored procedure or transaction
            v_member_number = f"SOC-{int(datetime.now().timestamp()) % 10000:04d}"
            try:
                rpc_res = admin_client.rpc("redeem_invitation_atomic", {
                    "p_token_hash": inv["invitation_token_hash"],
                    "p_user_id": user_id,
                    "p_email": clean_email
                }).execute()

                if rpc_res.data and len(rpc_res.data) > 0:
                    outcome = rpc_res.data[0]
                    if not outcome.get("success"):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=outcome.get("message", "Redemption failed")
                        )
                # Fetch assigned member_number from profile
                p_check = admin_client.from_("profiles").select("member_number").eq("id", user_id).single().execute()
                if p_check.data and p_check.data.get("member_number"):
                    v_member_number = p_check.data["member_number"]
            except HTTPException:
                raise
            except Exception as rpc_err:
                logger.warning(f"Direct atomic procedure notice: {rpc_err}. Executing direct fallback update.")
                # Direct transactional updates if stored procedure is being applied
                admin_client.from_("invitations").update({
                    "invitation_status": "redeemed",
                    "redeemed_at": datetime.now(timezone.utc).isoformat(),
                    "redeemed_by": user_id
                }).eq("id", inv["id"]).execute()

                admin_client.from_("profiles").upsert({
                    "id": user_id,
                    "username": inv["assigned_codename"],
                    "codename": inv["assigned_codename"],
                    "member_number": v_member_number,
                    "email": clean_email,
                    "society_role": inv["assigned_role"],
                    "society_rank": inv["assigned_rank"],
                    "induction_date": datetime.now(timezone.utc).isoformat(),
                    "is_active": True
                }).execute()

                admin_client.from_("member_private_records").upsert({
                    "member_id": user_id,
                    "real_name": inv["intended_name"],
                    "contact_email": clean_email,
                    "notes": "Redeemed via token"
                }).execute()

            # 5. Authenticate and retrieve JWT Bearer token
            token_url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
            token_headers = {
                "apikey": settings.SUPABASE_KEY,
                "Content-Type": "application/json"
            }
            token_payload = {
                "email": clean_email,
                "password": data.password
            }

            with httpx.Client(timeout=20.0, http2=False) as http_client:
                t_resp = http_client.post(token_url, headers=token_headers, json=token_payload)
                t_data = t_resp.json()

            access_token = t_data.get("access_token", "")

            return {
                "success": True,
                "message": "Induction completed successfully",
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user_id,
                    "codename": inv["assigned_codename"],
                    "role": inv["assigned_role"],
                    "society_role": inv["assigned_role"],
                    "rank": inv["assigned_rank"],
                    "society_rank": inv["assigned_rank"],
                    "member_number": v_member_number
                }
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Redemption error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Redemption failed: {str(e)}"
            )
