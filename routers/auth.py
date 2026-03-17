import os
import httpx

from helpers.email_service import send_reset_email
from helpers.firebase_admin_setup import get_firestore_client, get_firebase_auth

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, EmailStr
from urllib.parse import quote
from helpers.rate_limit import limiter

from datetime import datetime, timedelta, timezone
from firebase_admin import firestore

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

router = APIRouter(prefix="/auth")

db = get_firestore_client()
firebase_auth = get_firebase_auth()
TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY")

class ResetRequest(BaseModel):
    email: EmailStr

class EmailRequest(BaseModel):
    email: str

class TokenRequest(BaseModel):
    idToken: str

class CaptchaRequest(BaseModel):
    captcha_token: str


MAX_FAILED_ATTEMPTS = 2  # change to 5 later
RESET_COOLDOWN_SECONDS = 60  

def normalize_email(email: str) -> str:
    return email.strip().lower()

def get_lockout_duration_seconds(level: int) -> int:
    # TEST VALUES
    if level == 1:
        return 10
    elif level == 2:
        return 20
    elif level == 3:
        return 30
    return 40

# REAL VALUES LATER:
# def get_lockout_duration_seconds(level: int) -> int:
#     if level == 1:
#         return 60
#     elif level == 2:
#         return 300
#     elif level == 3:
#         return 900
#     return 1800

@router.post("/verify-captcha")
async def verify_captcha(payload: CaptchaRequest, request: Request):
    if not TURNSTILE_SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="Turnstile secret key is not configured.",
        )

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": TURNSTILE_SECRET_KEY,
                "response": payload.captcha_token,
                "remoteip": request.client.host if request.client else None,
            },
        )
        result = response.json()

    if not result.get("success", False):
        raise HTTPException(
            status_code=400,
            detail="CAPTCHA verification failed.",
        )

    return {"success": True}

@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, data: ResetRequest):
    email = normalize_email(str(data.email))

    doc_ref = db.collection("passwordResetAttempts").document(email)
    snap = doc_ref.get()

    now = datetime.now(timezone.utc)

    if snap.exists:
        existing = snap.to_dict()
        last_request_at = existing.get("lastRequestAt")

        if last_request_at:
            elapsed = (now - last_request_at).total_seconds()

            if elapsed < RESET_COOLDOWN_SECONDS:
                remaining = int(RESET_COOLDOWN_SECONDS - elapsed)
                return {
                    "success": False,
                    "message": "Please wait before requesting another reset email.",
                    "remainingSeconds": max(remaining, 1),
                }

    reset_link = f"http://localhost:3000/reset-password?email={quote(email)}"
    print("RESET LINK:", reset_link)

    doc_ref.set(
        {
            "email": email,
            "lastRequestAt": now,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    return {
        "success": True,
        "message": "Password reset email sent",
        "remainingSeconds": 0,
    }


@router.post("/check-lockout")
def check_lockout(payload: EmailRequest):
    email = normalize_email(payload.email)
    doc_ref = db.collection("loginAttempts").document(email)
    snap = doc_ref.get()

    if not snap.exists:
        return {"locked": False, "remainingSeconds": 0}

    data = snap.to_dict()
    lockout_until = data.get("lockoutUntil")

    if not lockout_until:
        return {"locked": False, "remainingSeconds": 0}

    now = datetime.now(timezone.utc)

    if lockout_until > now:
        remaining = int((lockout_until - now).total_seconds())
        return {"locked": True, "remainingSeconds": remaining}

    # expired -> reset attempts
    doc_ref.set(
        {
            "failedAttempts": 0,
            "lockoutUntil": None,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    return {"locked": False, "remainingSeconds": 0}


@router.post("/record-failed-login")
def record_failed_login(payload: EmailRequest):
    email = normalize_email(payload.email)
    doc_ref = db.collection("loginAttempts").document(email)
    snap = doc_ref.get()

    failed_attempts = 0
    lockout_level = 0

    if snap.exists:
        data = snap.to_dict()
        failed_attempts = data.get("failedAttempts", 0)
        lockout_level = data.get("lockoutLevel", 0)

    failed_attempts += 1

    locked = False
    remaining_attempts = MAX_FAILED_ATTEMPTS - failed_attempts
    remaining_seconds = 0

    if failed_attempts >= MAX_FAILED_ATTEMPTS:
        lockout_level += 1
        remaining_seconds = get_lockout_duration_seconds(lockout_level)
        lockout_until = datetime.now(timezone.utc) + timedelta(seconds=remaining_seconds)

        locked = True
        failed_attempts = 0
        remaining_attempts = 0

        doc_ref.set(
            {
                "failedAttempts": 0,
                "lockoutLevel": lockout_level,
                "lockoutUntil": lockout_until,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )

    else:
        doc_ref.set(
            {
                "failedAttempts": failed_attempts,
                "lockoutLevel": lockout_level,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )

    return {
        "locked": locked,
        "remainingAttempts": max(remaining_attempts, 0),
        "remainingSeconds": remaining_seconds,
        "lockoutLevel": lockout_level,
    }


@router.post("/reset-login-attempts")
def reset_login_attempts(payload: EmailRequest):
    email = normalize_email(payload.email)
    doc_ref = db.collection("loginAttempts").document(email)

    doc_ref.set(
        {
            "failedAttempts": 0,
            "lockoutLevel": 0,
            "lockoutUntil": None,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    return {"success": True}


@router.post("/check-allowed-user")
def check_allowed_user(payload: TokenRequest):
    try:
        decoded_token = firebase_auth.verify_id_token(payload.idToken)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = normalize_email(decoded_token.get("email", ""))

    doc_ref = db.collection("allowedUsers").document(email)
    snap = doc_ref.get()

    if not snap.exists:
        return {"allowed": False}

    data = snap.to_dict()

    if data.get("active") is not True:
        return {"allowed": False}

    return {
        "allowed": True,
        "email": email,
        "role": data.get("role", "user"),
    }