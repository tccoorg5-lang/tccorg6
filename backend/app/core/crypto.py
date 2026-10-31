import hmac
import hashlib
import secrets
from typing import Tuple

def generate_invitation_token(prefix: str = "ps_") -> str:
    """
    Generates a cryptographically secure, high-entropy invitation token.
    Entropy: 256 bits via secrets.token_urlsafe(32).
    """
    raw_token = secrets.token_urlsafe(32)
    return f"{prefix}{raw_token}"

def hash_token(token: str) -> str:
    """
    Computes standard SHA-256 hex digest of the invitation token.
    Plaintext tokens are NEVER stored in the database.
    """
    clean_token = token.strip()
    return hashlib.sha256(clean_token.encode("utf-8")).hexdigest()

def verify_token_hash(token: str, token_hash: str) -> bool:
    """
    Timing-attack-resistant verification of invitation token against its hash.
    """
    computed = hash_token(token)
    return hmac.compare_digest(computed, token_hash.strip())

def mask_email(email: str) -> str:
    """
    Masks email for privacy during candidate pre-verification (e.g. j***@gmail.com).
    """
    if "@" not in email:
        return "***"
    local_part, domain = email.split("@", 1)
    if len(local_part) <= 2:
        masked_local = local_part[0] + "*"
    else:
        masked_local = local_part[0] + "*" * (len(local_part) - 2) + local_part[-1]
    return f"{masked_local}@{domain}"
