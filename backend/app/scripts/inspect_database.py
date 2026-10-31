import sys
import os
import httpx
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.supabase import get_supabase_admin_client

def inspect_db():
    print("=" * 80)
    print("SUPABASE DATABASE AUDIT & TEST DATA INSPECTION")
    print("=" * 80)

    admin_client = get_supabase_admin_client()

    # 1. Inspect Auth Users via Supabase Admin API
    admin_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
    admin_headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

    auth_users = []
    try:
        with httpx.Client(timeout=20.0, http2=False) as http_client:
            resp = http_client.get(admin_url, headers=admin_headers)
            if resp.status_code == 200:
                auth_users = resp.json().get("users", [])
                print(f"\n[AUTH USERS] Total Users in Supabase Auth: {len(auth_users)}")
                for u in auth_users:
                    print(f"  - ID: {u['id']} | Email: {u.get('email')} | CreatedAt: {u.get('created_at')} | Confirmed: {u.get('email_confirmed_at') is not None} | Metadata: {u.get('user_metadata')}")
            else:
                print(f"[AUTH USERS] Error fetching users: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"[AUTH USERS] Exception: {e}")

    # 2. Inspect Profiles Table
    try:
        p_res = admin_client.from_("profiles").select("*").execute()
        profiles = p_res.data or []
        print(f"\n[PROFILES] Total Profiles: {len(profiles)}")
        for p in profiles:
            print(f"  - ID: {p.get('id')} | Username: {p.get('username')} | Codename: {p.get('codename')} | Email: {p.get('email')} | Role: {p.get('society_role')} | Rank: {p.get('society_rank')} | Number: {p.get('member_number')}")
    except Exception as e:
        print(f"[PROFILES] Error: {e}")

    # 3. Inspect Invitations Table (Phase 1 cryptographic)
    try:
        inv_res = admin_client.from_("invitations").select("*").execute()
        invitations = inv_res.data or []
        print(f"\n[INVITATIONS (Phase 1)] Total Invitations: {len(invitations)}")
        for inv in invitations:
            print(f"  - ID: {inv.get('id')} | Codename: {inv.get('assigned_codename')} | IntendedEmail: {inv.get('intended_email')} | Status: {inv.get('invitation_status')} | RedeemedBy: {inv.get('redeemed_by')}")
    except Exception as e:
        print(f"[INVITATIONS] Error: {e}")

    # 4. Inspect Old Invites Table
    try:
        old_inv_res = admin_client.from_("invites").select("*").execute()
        old_invites = old_inv_res.data or []
        print(f"\n[OLD INVITES TABLE] Total Invites: {len(old_invites)}")
        for oinv in old_invites:
            print(f"  - ID: {oinv.get('id')} | Code: {oinv.get('code')} | ConvID: {oinv.get('conversation_id')} | CreatedBy: {oinv.get('created_by')}")
    except Exception as e:
        print(f"[OLD INVITES] Error: {e}")

    # 5. Inspect Conversations Table
    try:
        c_res = admin_client.from_("conversations").select("*").execute()
        convs = c_res.data or []
        print(f"\n[CONVERSATIONS] Total Conversations: {len(convs)}")
        for c in convs:
            print(f"  - ID: {c.get('id')} | IsGroup: {c.get('is_group')} | Title: {c.get('title')} | CreatedAt: {c.get('created_at')}")
    except Exception as e:
        print(f"[CONVERSATIONS] Error: {e}")

    # 6. Inspect Messages Table
    try:
        m_res = admin_client.from_("messages").select("id, conversation_id, sender_id, content, created_at").limit(25).execute()
        messages = m_res.data or []
        print(f"\n[MESSAGES] Total Messages (Sample up to 25): {len(messages)}")
        for m in messages:
            print(f"  - ID: {m.get('id')} | ConvID: {m.get('conversation_id')} | Sender: {m.get('sender_id')} | Content: {m.get('content')[:30]} | CreatedAt: {m.get('created_at')}")
    except Exception as e:
        print(f"[MESSAGES] Error: {e}")

    # 7. Inspect Member Private Records
    try:
        pr_res = admin_client.from_("member_private_records").select("*").execute()
        private_recs = pr_res.data or []
        print(f"\n[MEMBER PRIVATE RECORDS] Total Records: {len(private_recs)}")
        for pr in private_recs:
            print(f"  - MemberID: {pr.get('member_id')} | RealName: {pr.get('real_name')} | ContactEmail: {pr.get('contact_email')}")
    except Exception as e:
        print(f"[MEMBER PRIVATE RECORDS] Error: {e}")

    # 8. Inspect Audit Logs
    try:
        al_res = admin_client.from_("administrative_audit_logs").select("*").execute()
        audit_logs = al_res.data or []
        print(f"\n[ADMINISTRATIVE AUDIT LOGS] Total Logs: {len(audit_logs)}")
        for al in audit_logs:
            print(f"  - Action: {al.get('action')} | Actor: {al.get('actor_id')} | Target: {al.get('target_resource')} | CreatedAt: {al.get('created_at')}")
    except Exception as e:
        print(f"[ADMINISTRATIVE AUDIT LOGS] Error: {e}")

    print("\n" + "=" * 80)
    print("INSPECTION COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    inspect_db()
