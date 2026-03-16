import os
# from sendgrid import SendGridAPIClient
# from sendgrid.helpers.mail import Mail

def send_reset_email(to_email, reset_link):

    message = Mail(
        from_email=os.getenv("SENDGRID_FROM_EMAIL"),
        to_emails=to_email,
        subject="Reset your password",
        html_content=f"""
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="{reset_link}">Reset Password</a>
        """
    )

    sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
    sg.send(message)