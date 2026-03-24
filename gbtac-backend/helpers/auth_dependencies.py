from typing import Optional

from fastapi import Cookie, Depends, HTTPException
from helpers.firebase_admin_setup import get_firestore_client, get_firebase_auth

SESSION_COOKIE_NAME = "session"

db = get_firestore_client()
firebase_auth = get_firebase_auth()


def normalize_email(email: str) -> str:
    return email.strip().lower()


def get_allowed_user_data(email: str):
    email = normalize_email(email)
    doc_ref = db.collection("allowedUsers").document(email)
    snap = doc_ref.get()

    if not snap.exists:
        return None

    data = snap.to_dict()

    if data.get("active") is not True:
        return None

    return data


async def get_current_user_from_session(
    session: Optional[str] = Cookie(default=None, alias=SESSION_COOKIE_NAME)
):
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        decoded_claims = firebase_auth.verify_session_cookie(
            session,
            check_revoked=True
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    email = normalize_email(decoded_claims.get("email", ""))
    allowed_user = get_allowed_user_data(email)

    if not allowed_user:
        raise HTTPException(status_code=403, detail="User is not allowed")

    return {
        "uid": decoded_claims.get("uid"),
        "email": email,
        "role": allowed_user.get("role", "user"),
    }


async def require_admin(user=Depends(get_current_user_from_session)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user