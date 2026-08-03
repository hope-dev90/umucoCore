import dns from "dns";
import nodemailer from "nodemailer";
import config from "../config/env.js";

// Force Google's public DNS — fixes ETIMEOUT when system resolver is broken (e.g. VPN)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let cachedHost = null;

const resolveHost = () =>
  new Promise((resolve, reject) => {
    dns.resolve4(config.email.host, (err, addresses) => {
      if (err || !addresses?.length) return reject(err || new Error("DNS lookup returned no results"));
      resolve(addresses[0]);
    });
  });

const createTransporter = async () => {
  if (!cachedHost) {
    cachedHost = await resolveHost();
  }

  // Port 465 (SMTPS / implicit TLS) works on Render.
  // Port 587 (STARTTLS) is blocked by Render's outbound firewall.
  return nodemailer.createTransport({
    host: cachedHost,
    port: 465,
    secure: true,               // implicit TLS on 465
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      minVersion: "TLSv1.2",
      servername: config.email.host,
    },
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  console.log(`[EMAIL] Attempting to send email to: ${to}, subject: ${subject}`);
  console.log(`[EMAIL] Using SMTP: ${config.email.host}:${config.email.port}`);
  console.log(`[EMAIL] From: ${config.email.from}`);
  console.log(`[EMAIL] User configured: ${config.email.user ? 'Yes' : 'No'}`);
  console.log(`[EMAIL] Pass configured: ${config.email.pass ? 'Yes' : 'No'}`);

  if (!config.email.user || !config.email.pass) {
    throw new Error("Email credentials not configured. Set EMAIL_USER and EMAIL_PASS environment variables.");
  }

  const transport = await createTransporter();
  console.log(`[EMAIL] Transporter created successfully`);

  try {
    const result = await transport.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html,
    });
    console.log(`[EMAIL] Sent successfully! MessageId: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`[EMAIL] Failed to send:`, error.message);
    if (error.code) console.error(`[EMAIL] Error code: ${error.code}`);
    throw error;
  }
};

export const sendOtpEmail = async ({ to, otp, purpose, name }) => {
  // Retry logic for email sending
  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendEmail({
        to,
        subject: "Verification Code",
        text: `Hello ${name || "there"}, your verification code is ${otp}. It expires in 10 minutes.`,
        html: `
<div style="background:#f4f4f4; padding:40px 0; font-family: Arial, sans-serif;">
  <div style="max-width:420px; margin:0 auto; background:#ffffff; border-radius:12px; padding:28px 26px; border:1px solid #eaeaea;">
    <div style="text-align:center; margin-bottom:20px;">
      <p style="font-size:13px; color:#888; margin-top:8px;">Umuco Core</p>
    </div>
    <h2 style="font-size:18px; color:#111; margin-bottom:12px;">Confirm your email</h2>
    <p style="font-size:14px; color:#444; margin-bottom:12px;">Hi ${name || "there"},</p>
    <p style="font-size:13px; color:#555; margin-bottom:18px; line-height:1.6;">
      Use the code below to ${purpose || "verify your account"}. It's only valid for 10 minutes.
    </p>
    <div style="background:#f8f8f8; border:1px solid #e5e5e5; border-radius:10px; padding:18px; text-align:center; margin:20px 0;">
      <span style="font-size:28px; font-weight:600; letter-spacing:8px; color:#c46a4b;">${otp}</span>
    </div>
    <p style="font-size:12px; color:#777; margin-bottom:6px;">Expires in 10 minutes.</p>
    <p style="font-size:12px; color:#777; margin-bottom:18px;">If you didn't request this, you can ignore this message.</p>
    <div style="border-top:1px solid #eee; padding-top:12px;">
      <p style="font-size:11px; color:#aaa; margin:0;">Umuco Core · Rwanda Cultural Archive</p>
    </div>
  </div>
</div>`,
      });

      if (attempt > 1) {
        console.log(`Email sent successfully on attempt ${attempt}`);
      }

      return { sent: true };
    } catch (error) {
      lastError = error;
      console.error(`Email sending attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // All retries failed
  throw lastError || new Error("Failed to send email after retries");
};

/**
 * Sends a security alert to the site owner whenever:
 *  - An admin account logs in, OR
 *  - Any user (admin or regular) visits the admin dashboard.
 *
 * @param {'admin_login'|'dashboard_visit'} type
 * @param {{ ip?: string, userAgent?: string, userId?: string }} meta
 */
export const sendAdminAlertEmail = async ({ type, meta = {} }) => {
  const OWNER_EMAIL = "mutimutujehope90@gmail.com";
  const now = new Date().toUTCString();

  const subjects = {
    admin_login:      "🔐 Admin Login Detected — Umuco Core",
    dashboard_visit:  "👀 Admin Dashboard Visit — Umuco Core",
  };

  const titles = {
    admin_login:     "Admin account logged in",
    dashboard_visit: "Admin dashboard was accessed",
  };

  const subject = subjects[type] || "Security Alert — Umuco Core";
  const title   = titles[type]   || "Security event";

  const html = `
<div style="background:#f4f4f4; padding:40px 0; font-family: Arial, sans-serif;">
  <div style="max-width:460px; margin:0 auto; background:#fff; border-radius:12px;
              padding:28px 26px; border:1px solid #eaeaea; border-left:4px solid #c46a4b;">
    <h2 style="font-size:17px; color:#111; margin:0 0 14px;">⚠️ ${title}</h2>
    <table style="width:100%; font-size:13px; color:#444; border-collapse:collapse;">
      <tr>
        <td style="padding:6px 0; width:110px; color:#888; font-weight:600;">Time</td>
        <td style="padding:6px 0;">${now}</td>
      </tr>
      <tr>
        <td style="padding:6px 0; color:#888; font-weight:600;">Event</td>
        <td style="padding:6px 0;">${type}</td>
      </tr>
      ${meta.userId ? `
      <tr>
        <td style="padding:6px 0; color:#888; font-weight:600;">User ID</td>
        <td style="padding:6px 0;">${meta.userId}</td>
      </tr>` : ''}
      ${meta.ip ? `
      <tr>
        <td style="padding:6px 0; color:#888; font-weight:600;">IP Address</td>
        <td style="padding:6px 0;">${meta.ip}</td>
      </tr>` : ''}
      ${meta.userAgent ? `
      <tr>
        <td style="padding:6px 0; color:#888; font-weight:600;">User-Agent</td>
        <td style="padding:6px 0; word-break:break-all;">${meta.userAgent.slice(0, 120)}</td>
      </tr>` : ''}
    </table>
    <p style="font-size:12px; color:#aaa; margin-top:20px; border-top:1px solid #eee; padding-top:10px;">
      If this was unexpected, review your admin credentials immediately.<br/>
      Umuco Core · Security Notification
    </p>
  </div>
</div>`;

  await sendEmail({
    to:      OWNER_EMAIL,
    subject,
    text:    `${title} at ${now}. Event: ${type}. IP: ${meta.ip || "unknown"}. User ID: ${meta.userId || "unknown"}.`,
    html,
  });
};
