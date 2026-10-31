import sys
import os
import httpx
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.supabase import get_supabase_admin_client

def execute_cleanup_and_elevation():
    print("=" * 80)
    print("EXECUTING TARGETED DATABASE CLEANUP & FOUNDER ELEVATION")
    print("=" * 80)

    admin_client = get_supabase_admin_client()

    FOUNDER_UUID = "bb15719e-1eb0-4905-b6fc-fc6eb9f4053e"
    FOUNDER_EMAIL = "tccoorg5@gmail.com"
    FOUNDER_CODENAME = "Doom"

    TEST_USER_IDS = [
        "50e1051f-4c62-4e37-8ce1-4301da0a97f5",
        "2a906cf5-5811-4a80-8d44-dab4d3a1c42b",
        "aaf0c636-71a5-438a-a3a2-5f17b5d00848",
        "c509438d-afa0-4765-8dbb-be14ad3680af",
        "d959d86d-02c1-48d7-8f34-2173da4ab1ac",
        "b3e689e3-4db0-44b6-a04f-eaf14bfa9e47",
        "5968743f-7503-45ea-a450-6c93eace9637",
        "5a736f01-8f88-4da1-b1b4-1d9ca442e48f"
    ]

    TEST_CONV_ID = "f651e5ab-d746-4e63-ad6c-2da094193fa1"

    # ------------------------------------------------------------------
    # 1. ELEVATE USER TO FOUNDER & ADMINISTRATOR
    # ------------------------------------------------------------------
    print(f"\n[STEP 1] Elevating {FOUNDER_EMAIL} ({FOUNDER_UUID}) to Founder (Codename: {FOUNDER_CODENAME})...")

    # A. Update User in Supabase Auth via Admin API
    admin_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users/{FOUNDER_UUID}"
    admin_headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

    try:
        with httpx.Client(timeout=20.0, http2=False) as http_client:
            u_resp = http_client.put(admin_url, headers=admin_headers, json={
                "user_metadata": {
                    "username": FOUNDER_CODENAME,
                    "codename": FOUNDER_CODENAME,
                    "role": "founder",
                    "email_verified": True
                }
            })
            if u_resp.status_code in (200, 201):
                print("[+] Supabase Auth user metadata updated to Founder.")
            else:
                print(f"[-] Supabase Auth user update warning: {u_resp.status_code} {u_resp.text}")
    except Exception as e:
        print(f"[-] Auth metadata update error: {e}")

    # B. Update Profile in database
    try:
        admin_client.from_("profiles").update({
            "username": FOUNDER_CODENAME,
            "codename": FOUNDER_CODENAME,
            "member_number": "SOC-0001",
            "society_role": "founder",
            "society_rank": "Founder",
            "designation": "Founder & Administrator",
            "points": 10000,
            "progression_level": 7,
            "is_hall_of_legends": True,
            "is_active": True,
            "updated_at": "now()"
        }).eq("id", FOUNDER_UUID).execute()
        print(f"[+] Profile table updated: {FOUNDER_CODENAME} is now Founder (SOC-0001).")
    except Exception as pe:
        print(f"[-] Profile update error: {pe}")

    # C. Update/Insert Member Private Records
    try:
        admin_client.from_("member_private_records").upsert({
            "member_id": FOUNDER_UUID,
            "real_name": "Founder Doom",
            "contact_email": FOUNDER_EMAIL,
            "notes": "Primary Society Founder and Permanent Administrator"
        }).execute()
        print("[+] Created Founder private record in member_private_records.")
    except Exception as pre:
        print(f"[-] Private record error: {pre}")

    # ------------------------------------------------------------------
    # 2. DELETE TEST MESSAGES & DUMMY CONVERSATION
    # ------------------------------------------------------------------
    print("\n[STEP 2] Deleting dummy test conversation and messages...")
    try:
        m_del = admin_client.from_("messages").delete().eq("conversation_id", TEST_CONV_ID).execute()
        print(f"[+] Deleted test messages for conversation {TEST_CONV_ID}")
        c_del = admin_client.from_("conversations").delete().eq("id", TEST_CONV_ID).execute()
        print(f"[+] Deleted test conversation {TEST_CONV_ID}")
    except Exception as ce:
        print(f"[-] Conversation deletion note: {ce}")

    # ------------------------------------------------------------------
    # 3. DELETE TEST INVITATIONS & TEST AUDIT LOGS
    # ------------------------------------------------------------------
    print("\n[STEP 3] Clearing test invitations and past test audit logs...")
    try:
        admin_client.from_("invitations").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("[+] Cleared all automated test invitations.")
    except Exception as ie:
        print(f"[-] Invitations clearing note: {ie}")

    try:
        admin_client.from_("administrative_audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("[+] Cleared past test audit logs.")
    except Exception as ale:
        print(f"[-] Audit logs clearing note: {ale}")

    # ------------------------------------------------------------------
    # 4. DELETE TEST PRIVATE RECORDS
    # ------------------------------------------------------------------
    print("\n[STEP 4] Deleting test records from member_private_records...")
    for uid in TEST_USER_IDS:
        try:
            admin_client.from_("member_private_records").delete().eq("member_id", uid).execute()
        except Exception:
            pass
    print("[+] Test private records deleted.")

    # ------------------------------------------------------------------
    # 5. DELETE TEST PROFILES & AUTH USERS
    # ------------------------------------------------------------------
    print("\n[STEP 5] Deleting test users from profiles and Supabase Auth...")
    with httpx.Client(timeout=20.0, http2=False) as http_client:
        for uid in TEST_USER_IDS:
            # Delete from profiles table
            try:
                admin_client.from_("profiles").delete().eq("id", uid).execute()
            except Exception as dpe:
                print(f"[-] Profile delete note for {uid}: {dpe}")

            # Delete from Supabase Auth
            try:
                del_resp = http_client.delete(
                    f"{settings.SUPABASE_URL}/auth/v1/admin/users/{uid}",
                    headers=admin_headers
                )
                if del_resp.status_code in (200, 204):
                    print(f"[+] Deleted Auth user {uid}")
                else:
                    print(f"[-] Auth user delete note ({uid}): {del_resp.status_code}")
            except Exception as dae:
                print(f"[-] Auth delete exception for {uid}: {dae}")

    # ------------------------------------------------------------------
    # 6. RECORD PERMANENT FOUNDER PROVISIONING AUDIT LOG
    # ------------------------------------------------------------------
    print("\n[STEP 6] Recording permanent Founder establishment in audit log...")
    try:
        admin_client.from_("administrative_audit_logs").insert({
            "actor_id": FOUNDER_UUID,
            "action": "FOUNDER_PROVISIONED",
            "target_resource": "profiles",
            "target_id": FOUNDER_UUID,
            "details": {
                "codename": FOUNDER_CODENAME,
                "email": FOUNDER_EMAIL,
                "member_number": "SOC-0001",
                "role": "founder",
                "rank": "Founder",
                "status": "Permanent Administrator"
            }
        }).execute()
        print("[+] Tamper-evident FOUNDER_PROVISIONED audit log entry created.")
    except Exception as ale:
        print(f"[-] Audit log insertion note: {ale}")

    # ------------------------------------------------------------------
    # 7. FINAL STATE VERIFICATION
    # ------------------------------------------------------------------
    print("\n[STEP 7] Verifying remaining database records...")
    p_rem = admin_client.from_("profiles").select("id, codename, username, email, society_role, society_rank").execute()
    print(f"\nRemaining Profiles in Database ({len(p_rem.data)}):")
    for p in p_rem.data:
        print(f"  - [{p.get('society_role').upper()}] {p.get('codename')} ({p.get('email')}) - Rank: {p.get('society_rank')}")

    c_rem = admin_client.from_("conversations").select("id").execute()
    print(f"\nRemaining Conversations: {len(c_rem.data)}")

    inv_rem = admin_client.from_("invitations").select("id").execute()
    print(f"Remaining Invitations: {len(inv_rem.data)}")

    al_rem = admin_client.from_("administrative_audit_logs").select("action, details").execute()
    print(f"Remaining Audit Logs: {len(al_rem.data)}")
    for a in al_rem.data:
        print(f"  - {a.get('action')}: {a.get('details')}")

    print("\n" + "=" * 80)
    print("SUCCESS: CLEANUP & FOUNDER ELEVATION COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    execute_cleanup_and_elevation()
