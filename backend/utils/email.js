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

  return nodemailer.createTransport({
    host: cachedHost,
    port: config.email.port,
    secure: config.email.port === 465,
    requireTLS: config.email.port !== 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      minVersion: "TLSv1.2",
      servername: config.email.host, // SNI must match original hostname, not IP
    },
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transport = await createTransporter();
  await transport.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html,
  });
};

export const sendOtpEmail = async ({ to, otp, purpose, name }) => {
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

  return { sent: true };
};
