/**
 * email.js — sends via Resend HTTP API (port 443, never blocked by Render).
 *
 * Setup:
 *  1. Sign up free at https://resend.com
 *  2. Create an API key (Dashboard → API Keys → Add)
 *  3. Add RESEND_API_KEY to Render environment variables
 *
 * Free tier: 3,000 emails/month, 100/day.
 * From address: use onboarding@resend.dev until you verify your own domain.
 */
import { Resend } from "resend";
import config from "../config/env.js";

const getClient = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set.");
  return new Resend(key);
};

// Use verified sender — onboarding@resend.dev works on free tier without domain setup.
// Once you verify a domain on Resend, change this to e.g. noreply@yourdomain.com
const FROM_ADDRESS = process.env.RESEND_FROM || "Umuco Core <onboarding@resend.dev>";
const OWNER_EMAIL  = "mutimutujehope90@gmail.com";

export const sendEmail = async ({ to, subject, text, html }) => {
  console.log(`[EMAIL] Sending to: ${to} | Subject: ${subject}`);

  const resend = getClient();
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    text,
    html,
  });

  if (error) {
    console.error("[EMAIL] Resend error:", error);
    throw new Error(error.message || "Failed to send email via Resend");
  }

  console.log(`[EMAIL] Sent successfully! id: ${data?.id}`);
  return data;
};

export const sendOtpEmail = async ({ to, otp, purpose, name }) => {
  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendEmail({
        to,
        subject: "Verification Code — Umuco Core",
        text: `Hello ${name || "there"}, your verification code is ${otp}. It expires in 10 minutes.`,
        html: `
<div style="background:#f4f4f4;padding:40px 0;font-family:Arial,sans-serif;">
  <div style="max-width:420px;margin:0 auto;background:#fff;border-radius:12px;padding:28px 26px;border:1px solid #eaeaea;">
    <div style="text-align:center;margin-bottom:20px;">
      <p style="font-size:13px;color:#888;margin-top:8px;">Umuco Core</p>
    </div>
    <h2 style="font-size:18px;color:#111;margin-bottom:12px;">Confirm your email</h2>
    <p style="font-size:14px;color:#444;margin-bottom:12px;">Hi ${name || "there"},</p>
    <p style="font-size:13px;color:#555;margin-bottom:18px;line-height:1.6;">
      Use the code below to ${purpose || "verify your account"}. It's only valid for 10 minutes.
    </p>
    <div style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:10px;padding:18px;text-align:center;margin:20px 0;">
      <span style="font-size:28px;font-weight:600;letter-spacing:8px;color:#c46a4b;">${otp}</span>
    </div>
    <p style="font-size:12px;color:#777;margin-bottom:6px;">Expires in 10 minutes.</p>
    <p style="font-size:12px;color:#777;margin-bottom:18px;">If you didn't request this, you can ignore this message.</p>
    <div style="border-top:1px solid #eee;padding-top:12px;">
      <p style="font-size:11px;color:#aaa;margin:0;">Umuco Core · Rwanda Cultural Archive</p>
    </div>
  </div>
</div>`,
      });
      if (attempt > 1) console.log(`[EMAIL] Sent on attempt ${attempt}`);
      return { sent: true };
    } catch (error) {
      lastError = error;
      console.error(`[EMAIL] Attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 2000));
    }
  }

  throw lastError || new Error("Failed to send email after retries");
};

export const sendAdminAlertEmail = async ({ type, meta = {} }) => {
  const now = new Date().toUTCString();
  const subjects = {
    admin_login:     "🔐 Admin Login Detected — Umuco Core",
    dashboard_visit: "👀 Admin Dashboard Visit — Umuco Core",
  };
  const titles = {
    admin_login:     "Admin account logged in",
    dashboard_visit: "Admin dashboard was accessed",
  };

  const subject = subjects[type] || "Security Alert — Umuco Core";
  const title   = titles[type]   || "Security event";

  await sendEmail({
    to: OWNER_EMAIL,
    subject,
    text: `${title} at ${now}. Event: ${type}. IP: ${meta.ip || "unknown"}. User ID: ${meta.userId || "unknown"}.`,
    html: `
<div style="background:#f4f4f4;padding:40px 0;font-family:Arial,sans-serif;">
  <div style="max-width:460px;margin:0 auto;background:#fff;border-radius:12px;
              padding:28px 26px;border:1px solid #eaeaea;border-left:4px solid #c46a4b;">
    <h2 style="font-size:17px;color:#111;margin:0 0 14px;">⚠️ ${title}</h2>
    <table style="width:100%;font-size:13px;color:#444;border-collapse:collapse;">
      <tr><td style="padding:6px 0;width:110px;color:#888;font-weight:600;">Time</td><td>${now}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-weight:600;">Event</td><td>${type}</td></tr>
      ${meta.userId   ? `<tr><td style="padding:6px 0;color:#888;font-weight:600;">User ID</td><td>${meta.userId}</td></tr>` : ''}
      ${meta.ip       ? `<tr><td style="padding:6px 0;color:#888;font-weight:600;">IP</td><td>${meta.ip}</td></tr>` : ''}
      ${meta.userAgent ? `<tr><td style="padding:6px 0;color:#888;font-weight:600;">User-Agent</td><td style="word-break:break-all;">${meta.userAgent.slice(0, 120)}</td></tr>` : ''}
    </table>
    <p style="font-size:12px;color:#aaa;margin-top:20px;border-top:1px solid #eee;padding-top:10px;">
      Umuco Core · Security Notification
    </p>
  </div>
</div>`,
  });
};
