"""
Standalone CLI tool to securely provision the primary Founder account.
Independent of normal member registration.
"""
import sys
import os
import httpx
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.supabase import get_supabase_admin_client

def provision_founder(email: str, password: str, codename: str = "Sovereign"):
    admin_client = get_supabase_admin_client()
    clean_email = email.strip().lower()

    print(f"[*] Provisioning Founder account: {clean_email} ({codename})...")

    # 1. Create or retrieve user in Supabase Auth via Admin API
    admin_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
    admin_headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

    user_id = None

    try:
        with httpx.Client(timeout=20.0, http2=False) as http_client:
            resp = http_client.post(admin_url, headers=admin_headers, json={
                "email": clean_email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "codename": codename,
                    "role": "founder"
                }
            })
            resp_data = resp.json()

            if resp.status_code in (200, 201):
                user_id = resp_data["id"]
                print(f"[+] User created in Supabase Auth. ID: {user_id}")
            elif "already exists" in str(resp_data).lower():
                print("[*] User already exists in Supabase Auth. Querying user list...")
                # Search for existing user ID
                list_resp = http_client.get(admin_url, headers=admin_headers)
                if list_resp.status_code == 200:
                    users_list = list_resp.json().get("users", [])
                    for u in users_list:
                        if u.get("email", "").lower() == clean_email:
                            user_id = u["id"]
                            # Update password
                            http_client.put(f"{admin_url}/{user_id}", headers=admin_headers, json={"password": password})
                            print(f"[+] Found existing user ID: {user_id}. Password updated.")
                            break
    except Exception as e:
        print(f"[-] Auth creation note: {e}")

    if not user_id:
        p_res = admin_client.from_("profiles").select("id").eq("email", clean_email).execute()
        if p_res.data:
            user_id = p_res.data[0]["id"]
        else:
            print("[-] Could not determine user ID.")
            return False

    # 2. Elevate Profile to Founder in Database
    try:
        admin_client.from_("profiles").upsert({
            "id": user_id,
            "username": codename,
            "codename": codename,
            "member_number": "SOC-0001",
            "email": clean_email,
            "society_role": "founder",
            "society_rank": "Founder",
            "designation": "Founder & Chancellor",
            "points": 10000,
            "progression_level": 7,
            "is_hall_of_legends": True,
            "is_active": True
        }).execute()
        print(f"[+] Elevated profile {user_id} to Founder.")
    except Exception as pe:
        print(f"[-] Profile update error: {pe}")

    # 3. Create Private Record
    try:
        admin_client.from_("member_private_records").upsert({
            "member_id": user_id,
            "real_name": "Founder",
            "contact_email": clean_email,
            "notes": "Primary Society Founder"
        }).execute()
        print("[+] Created private record.")
    except Exception as re:
        print(f"[-] Private record note: {re}")

    # 4. Insert Audit Log
    try:
        admin_client.from_("administrative_audit_logs").insert({
            "actor_id": user_id,
            "action": "FOUNDER_PROVISIONED",
            "target_resource": "profiles",
            "target_id": str(user_id),
            "details": {
                "codename": codename,
                "email": clean_email
            }
        }).execute()
        print("[+] Logged administrative audit entry.")
    except Exception as ae:
        print(f"[-] Audit log note: {ae}")

    print("\n[SUCCESS] Founder account provisioned successfully!")
    print(f"Codename: {codename}")
    print(f"Email:    {clean_email}")
    print(f"Role:     founder")
    return True

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "founder@society.internal"
    pwd = sys.argv[2] if len(sys.argv) > 2 else "FounderMasterPass123!"
    codename = sys.argv[3] if len(sys.argv) > 3 else "Sovereign"
    provision_founder(email, pwd, codename)
