from email_service import send_reset_email
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ResetRequest(BaseModel):
    email: str


@router.post("/reset-password")
def reset_password(data: ResetRequest):

    email = data.email

    reset_link = f"http://localhost:3000/reset-password?email={email}"

    send_reset_email(email, reset_link)

    return {"message": "Password reset email sent"}