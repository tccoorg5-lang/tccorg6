import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None
_supabase_admin_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """Returns standard client initialized with anon/publishable key."""
    global _supabase_client
    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.warning("SUPABASE_URL or SUPABASE_KEY not configured!")
            # Fallback dummy initialization to allow app to start for health-checks
            return create_client("https://dummy.supabase.co", "dummy-key")
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client

def get_supabase_admin_client() -> Client:
    """
    Returns administrative client initialized with SUPABASE_SERVICE_ROLE_KEY.
    Used exclusively on backend for privileged operations (e.g. user lookup across tenant boundaries).
    """
    global _supabase_admin_client
    if _supabase_admin_client is None:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        if not settings.SUPABASE_URL or not key:
            logger.warning("SUPABASE_URL or service role key not configured!")
            return create_client("https://dummy.supabase.co", "dummy-key")
        _supabase_admin_client = create_client(settings.SUPABASE_URL, key)
    return _supabase_admin_client
