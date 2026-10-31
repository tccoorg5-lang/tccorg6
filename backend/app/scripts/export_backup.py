import sys
import os
import json
from datetime import datetime, timezone
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.supabase import get_supabase_admin_client

def export_backup():
    admin_client = get_supabase_admin_client()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_file = backend_dir / "backups" / f"supabase_pre_cleanup_backup_{timestamp}.json"

    tables = [
        "profiles",
        "conversations",
        "conversation_participants",
        "messages",
        "invitations",
        "member_private_records",
        "administrative_audit_logs"
    ]

    backup_data = {
        "timestamp": timestamp,
        "tables": {}
    }

    print(f"[*] Creating full JSON backup to: {backup_file}")
    for tbl in tables:
        try:
            res = admin_client.from_(tbl).select("*").execute()
            backup_data["tables"][tbl] = res.data or []
            print(f"  - Table '{tbl}': {len(backup_data['tables'][tbl])} records backed up")
        except Exception as e:
            print(f"  - Table '{tbl}': Warning ({e})")
            backup_data["tables"][tbl] = []

    with open(backup_file, "w", encoding="utf-8") as f:
        json.dump(backup_data, f, indent=2, default=str)

    print(f"[+] Backup complete. File size: {os.path.getsize(backup_file)} bytes")
    return str(backup_file)

if __name__ == "__main__":
    export_backup()
