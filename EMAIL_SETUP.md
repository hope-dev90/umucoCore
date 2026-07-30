# Email Configuration Setup Guide

## Issue
Emails are not being sent because the email environment variables are not configured on Render.

## Solution

### Step 1: Configure Environment Variables on Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `umucocore` web service
3. Click on **Environment** in the left sidebar
4. Add the following environment variables:

#### Required Email Variables:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mutimahope8@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=Umuco Core <mutimahope8@gmail.com>
```

#### To get Gmail App Password:
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled
3. Go to **App passwords** (https://myaccount.google.com/apppasswords)
4. Select "Mail" as the app and "Other" as the device
5. Copy the 16-character password (remove spaces)
6. Use this password for `EMAIL_PASS`

### Step 2: Verify Other Required Variables

Make sure these are also set:
```
JWT_SECRET=your_jwt_secret_at_least_32_characters_long
DATABASE_URL=postgresql://... (should be auto-configured)
GOOGLE_CLIENT_ID=829742825170-qu62f7f662o16iv6hcpgcep8g80fotb9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Step 3: Redeploy

After setting the environment variables:
1. Go to the **Deployments** tab
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment to complete

### Step 4: Test Email Sending

After deployment, test by:
1. Going to your deployed site
2. Try to sign up with a new email
3. Check the Render logs for email status:
   - Look for `[EMAIL]` log messages
   - Should see: `[EMAIL] Sent successfully! MessageId: ...`

## Debugging

If emails still don't work, check the Render logs:

1. In Render dashboard, go to your service
2. Click **Logs** tab
3. Look for email-related logs:
   - `[EMAIL] Attempting to send email to: ...`
   - `[EMAIL] Using SMTP: ...`
   - `[EMAIL] User configured: Yes/No`
   - `[EMAIL] Pass configured: Yes/No`
   - `[EMAIL] Transporter created successfully`
   - `[EMAIL] Sent successfully! MessageId: ...` OR error messages

### Common Issues:

1. **"Email credentials not configured"**
   - Solution: Set EMAIL_USER and EMAIL_PASS in Render environment variables

2. **"Invalid login" or "Authentication failed"**
   - Solution: Use App Password, not your regular Gmail password
   - Make sure 2-Step Verification is enabled

3. **"Connection timeout"**
   - Solution: The retry logic should handle this, but check your Render network access
   - Verify EMAIL_HOST and EMAIL_PORT are correct

4. **"DNS lookup returned no results"**
   - Solution: Should be resolved by the DNS servers configuration
   - Check if Render can access external DNS

## Local Testing

To test email locally:
```bash
cd backend
node test-email.js
```

This should output: `Email sent successfully!`

## Notes

- The system now has retry logic (2 attempts) for email sending
- Registration will succeed even if email fails (with a warning message)
- Users can use "Resend OTP" if the first email doesn't arrive
- All email attempts are logged for debugging