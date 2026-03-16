from helpers.email_service import send_reset_email
from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr
from urllib.parse import quote
from helpers.rate_limit import limiter

router = APIRouter()

class ResetRequest(BaseModel):
    email: EmailStr


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, data: ResetRequest):
    email = str(data.email)

    reset_link = f"http://localhost:3000/reset-password?email={quote(email)}"

    send_reset_email(email, reset_link)

    return {"message": "Password reset email sent"}