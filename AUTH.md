# Auth & Password Reset (Supabase)

DollarMemo uses Supabase Auth. Login, signup, Google OAuth, and the
**forgot-password** flow work out of the box once two things are configured in
your Supabase project.

## 1. Redirect URLs (required)

**Supabase → Authentication → URL Configuration**

- **Site URL**: your deployed URL, e.g. `https://dollarmemo.vercel.app`
- **Redirect URLs**: add `https://dollarmemo.vercel.app/**` (and
  `http://localhost:3000/**` for local testing)

## 2. Password-reset email template (required for "Forgot password")

The default Supabase reset email sends users through a link that only works in
the exact browser that requested the reset — so opening it on a phone fails.
DollarMemo verifies the reset server-side at **/auth/confirm**, which works
anywhere. Point the email at that route:

**Supabase → Authentication → Emails → "Reset Password" → Message body (HTML)** —
replace the body with:

```html
<h2>Reset your password</h2>
<p>Follow this link to choose a new password for DollarMemo:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
    Reset your password
  </a>
</p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

Click **Save**. That's it.

### How the flow works

1. User clicks **Forgot password?** on `/login` → `/forgot-password`, enters email.
2. `resetPasswordForEmail` sends the templated email.
3. User clicks the link → **`/auth/confirm`** runs `verifyOtp` (server-side),
   which establishes a recovery session — no browser-specific cookie needed.
4. They're forwarded to **`/reset-password`** to set a new password via
   `supabase.auth.updateUser`, which updates it in Supabase Auth.

## 3. Sending real emails (recommended)

Supabase's built-in email is **rate-limited and for testing only**. For real
usage configure SMTP in **Supabase → Authentication → Emails → SMTP Settings**
(e.g. Resend, SendGrid, Postmark).

> The same `/auth/confirm` route also improves signup-confirmation links. To use
> it there too, update the **"Confirm signup"** template's link to
> `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`.
