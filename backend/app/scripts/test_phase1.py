import sys
import httpx
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.supabase import get_supabase_admin_client

def run_tests():
    print("=" * 70)
    print("PHASE 1 INTEGRATION & VERIFICATION SUITE")
    print("=" * 70)

    # We will test against local FastAPI app or simulate API requests
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Login as Founder
    print("\n[TEST 1] Logging in as Founder with Codename 'Sovereign'...")
    login_resp = client.post("/api/auth/login", json={
        "username": "Sovereign",
        "password": "MasterPass123!"
    })
    assert login_resp.status_code == 200, f"Founder login failed: {login_resp.text}"
    founder_token = login_resp.json()["access_token"]
    print(f"[PASS] Founder authenticated via codename. Access token obtained.")

    founder_headers = {"Authorization": f"Bearer {founder_token}"}

    # 2. Check Founder Profile
    print("\n[TEST 2] Verifying Founder Society Profile via /api/members/me...")
    me_resp = client.get("/api/members/me", headers=founder_headers)
    assert me_resp.status_code == 200, f"Get /api/members/me failed: {me_resp.text}"
    profile = me_resp.json()
    assert profile["society_role"] == "founder", f"Role is not founder: {profile}"
    assert profile["codename"] == "Sovereign", f"Codename is not Sovereign: {profile}"
    print(f"[PASS] Founder profile verified: Codename={profile['codename']}, Role={profile['society_role']}, Rank={profile['society_rank']}")

    # 3. Founder creates single-use invitation
    print("\n[TEST 3] Founder issuing single-use invitation via /api/invitations/create...")
    # Generate unique test codename to allow repeated test runs
    import time
    test_suffix = str(int(time.time()))[-4:]
    test_codename = f"Vanguard{test_suffix}"
    test_email = f"arthur_{test_suffix}@pulse.chat"

    invite_resp = client.post("/api/invitations/create", headers=founder_headers, json={
        "intended_name": "Arthur Pendelton",
        "intended_email": test_email,
        "assigned_codename": test_codename,
        "assigned_role": "member",
        "assigned_rank": "Initiate",
        "expiry_days": 7
    })
    assert invite_resp.status_code in (200, 201), f"Invite creation failed: {invite_resp.text}"
    invite_data = invite_resp.json()
    plain_token = invite_data["plain_token"]
    print(f"[PASS] Invitation created. Plain Token: {plain_token[:8]}... (length: {len(plain_token)})")

    # 4. Public token verification pre-check
    print("\n[TEST 4] Candidate verifying invitation token via /api/invitations/verify...")
    verify_resp = client.post("/api/invitations/verify", json={"token": plain_token})
    assert verify_resp.status_code == 200, f"Verify failed: {verify_resp.text}"
    v_data = verify_resp.json()
    assert v_data["valid"] is True
    assert v_data["assigned_codename"] == test_codename
    print(f"[PASS] Token verified: Codename={v_data['assigned_codename']}, MaskedEmail={v_data['masked_email']}")

    # 5. Redemption with WRONG email rejected
    print("\n[TEST 5] Attempting redemption with mismatched email (evil@pulse.chat)...")
    wrong_redeem = client.post("/api/invitations/redeem", json={
        "token": plain_token,
        "email": "evil@pulse.chat",
        "password": "SecurePassword123!"
    })
    assert wrong_redeem.status_code in (400, 403), f"Should fail but got: {wrong_redeem.status_code}"
    print(f"[PASS] Mismatched email rejected as expected: {wrong_redeem.json()['detail']}")

    # 6. Redemption with CORRECT email succeeded
    print(f"\n[TEST 6] Attempting redemption with correct email ({test_email})...")
    redeem_resp = client.post("/api/invitations/redeem", json={
        "token": plain_token,
        "email": test_email,
        "password": "MemberPass123!"
    })
    assert redeem_resp.status_code in (200, 201), f"Redemption failed: {redeem_resp.text}"
    member_data = redeem_resp.json()
    assert member_data["user"]["codename"] == test_codename
    assert member_data["user"]["society_role"] == "member"
    member_token = member_data["access_token"]
    print(f"[PASS] Member inducted successfully! Codename={member_data['user']['codename']}, MemberNumber={member_data['user']['member_number']}")

    member_headers = {"Authorization": f"Bearer {member_token}"}

    # 7. Token replay rejection
    print("\n[TEST 7] Attempting to reuse the redeemed token...")
    replay_resp = client.post("/api/invitations/redeem", json={
        "token": plain_token,
        "email": test_email,
        "password": "MemberPass123!"
    })
    assert replay_resp.status_code in (400, 410), f"Replay should fail: {replay_resp.text}"
    print(f"[PASS] Replay rejected: {replay_resp.json()['detail']}")

    # 8. Non-founder access control verification
    print("\n[TEST 8] Member attempting to create an invitation (should be forbidden)...")
    forbidden_resp = client.post("/api/invitations/create", headers=member_headers, json={
        "intended_name": "Unauthorized",
        "intended_email": "unauth@pulse.chat",
        "assigned_codename": "Intruder",
        "assigned_role": "member",
        "assigned_rank": "Initiate",
        "expiry_days": 1
    })
    assert forbidden_resp.status_code == 403, f"Expected 403 Forbidden, got: {forbidden_resp.status_code}"
    print(f"[PASS] Access control enforced: Non-founder received 403 Forbidden.")

    # 9. Verify Existing Real-Time Chat System Operational
    print("\n[TEST 9] Verifying conversations endpoint operational for newly inducted member...")
    conv_resp = client.get("/api/conversations", headers=member_headers)
    assert conv_resp.status_code == 200, f"Conversations failed: {conv_resp.text}"
    print(f"[PASS] Real-time communications engine fully accessible to new member.")

    print("\n" + "=" * 70)
    print("ALL 9 PHASE 1 SUITE VERIFICATIONS PASSED 100%!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
