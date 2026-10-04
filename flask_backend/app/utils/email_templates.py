"""
HTML email templates for Cofluence.

All functions return a complete HTML string with inline styles.
No Jinja2 files — pure Python string templates for simplicity.

Templates:
  verification_email(name, verify_url)
  approved_email(name, login_url)
  rejected_email(name)
  password_reset_email(name, reset_url)
  ad_request_received_email(influencer_name, campaign_title, sponsor_company)
  ad_request_status_email(recipient_name, other_party, campaign_title, new_status)
  admin_new_registration_email(name, role, admin_url)
"""


# ── Shared base wrapper ────────────────────────────────────────────────────────

def _wrap(body: str) -> str:
    """Wrap email body in a consistent branded HTML shell."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cofluence</title>
</head>
<body style="margin:0;padding:0;background:#060B13;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060B13;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:1.5rem;font-weight:900;letter-spacing:-0.03em;
                background:linear-gradient(90deg,#6366F1,#C084FC,#22D3EE);
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                background-clip:text;">
                Cofluence
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0E1929;border:1px solid rgba(99,102,241,0.20);
              border-radius:16px;padding:40px 40px 36px;">
              {body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;font-size:0.72rem;
              color:#4B5563;line-height:1.6;">
              &copy; 2026 Cofluence &mdash; The Creator Economy Platform<br/>
              You received this email because you have a Cofluence account.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _btn(url: str, text: str, color: str = "#6366F1") -> str:
    return f"""<a href="{url}"
  style="display:inline-block;padding:13px 32px;border-radius:999px;
    font-weight:800;font-size:0.88rem;text-decoration:none;color:#fff;
    background:{color};margin-top:8px;">
  {text}
</a>"""


def _h(text: str) -> str:
    return f'<h1 style="font-size:1.35rem;font-weight:900;color:#F9FAFB;margin:0 0 12px;letter-spacing:-0.02em;">{text}</h1>'


def _p(text: str) -> str:
    return f'<p style="font-size:0.88rem;color:#9CA3AF;line-height:1.7;margin:0 0 16px;">{text}</p>'


def _note(text: str) -> str:
    return f'<p style="font-size:0.77rem;color:#6B7280;margin:20px 0 0;">{text}</p>'


# ── Templates ─────────────────────────────────────────────────────────────────

def verification_email(name: str, verify_url: str) -> str:
    body = (
        _h(f"Verify your email, {name}")
        + _p("Thanks for signing up for Cofluence! Click the button below to verify "
             "your email address. The link expires in 24 hours.")
        + _btn(verify_url, "Verify Email Address", "#6366F1")
        + _note("If you didn't create a Cofluence account, you can safely ignore this email.")
    )
    return _wrap(body)


def approved_email(name: str, login_url: str) -> str:
    body = (
        _h(f"You're approved, {name}!")
        + _p("Great news — your Cofluence account has been reviewed and approved by our team. "
             "You can now log in and start exploring campaigns and partnerships.")
        + _btn(login_url, "Log In to Cofluence", "linear-gradient(135deg,#6366F1,#C084FC)")
        + _note("Welcome to the Cofluence community.")
    )
    return _wrap(body)


def rejected_email(name: str) -> str:
    body = (
        _h(f"Registration update, {name}")
        + _p("Thank you for your interest in Cofluence. After reviewing your registration, "
             "we're unable to approve your account at this time.")
        + _p("If you believe this is a mistake or would like more information, "
             "please reach out to us at <a href='mailto:support@cofluence.dev' "
             "style='color:#22D3EE;'>support@cofluence.dev</a>.")
        + _note("This decision was made by our moderation team.")
    )
    return _wrap(body)


def password_reset_email(name: str, reset_url: str) -> str:
    body = (
        _h(f"Reset your password, {name}")
        + _p("We received a request to reset your Cofluence password. "
             "Click the button below to choose a new one. This link expires in 15 minutes.")
        + _btn(reset_url, "Reset Password", "#C084FC")
        + _note("If you didn't request this, you can safely ignore this email. "
                "Your password won't change.")
    )
    return _wrap(body)


def ad_request_received_email(
    influencer_name: str, campaign_title: str, sponsor_company: str
) -> str:
    body = (
        _h(f"New interest from {influencer_name}")
        + _p(f"<strong style='color:#F9FAFB;'>{influencer_name}</strong> has expressed "
             f"interest in your campaign <strong style='color:#F9FAFB;'>{campaign_title}</strong>. "
             f"Log in to review their profile and proposed terms.")
        + _note(f"Campaign: {campaign_title} &mdash; Sponsor: {sponsor_company}")
    )
    return _wrap(body)


def ad_request_status_email(
    recipient_name: str, other_party: str, campaign_title: str, new_status: str
) -> str:
    status_copy = {
        "accepted":    ("Your request has been accepted!", "#22D3EE"),
        "rejected":    ("Your request was declined.",      "#f87171"),
        "negotiation": ("A counter-offer has been made.",  "#C084FC"),
    }
    heading_text, color = status_copy.get(
        new_status, (f"Request status: {new_status}", "#6366F1")
    )
    body = (
        f'<h1 style="font-size:1.35rem;font-weight:900;color:{color};margin:0 0 12px;letter-spacing:-0.02em;">'
        f'{heading_text}</h1>'
        + _p(f"Hi {recipient_name}, the ad request for campaign "
             f"<strong style='color:#F9FAFB;'>{campaign_title}</strong> "
             f"has been updated by <strong style='color:#F9FAFB;'>{other_party}</strong>. "
             f"Log in to view the latest status and take action.")
        + _note(f"Status changed to: {new_status}")
    )
    return _wrap(body)


def admin_new_registration_email(name: str, role: str, admin_url: str) -> str:
    body = (
        _h("New registration awaiting approval")
        + _p(f"A new <strong style='color:#F9FAFB;'>{role}</strong> has registered on Cofluence: "
             f"<strong style='color:#F9FAFB;'>{name}</strong>. "
             "Click below to review their profile and approve or reject the application.")
        + _btn(admin_url, "Review in Admin Dashboard", "#6366F1")
        + _note("You are receiving this as the Cofluence platform administrator.")
    )
    return _wrap(body)
