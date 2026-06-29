
import nodemailer from "nodemailer";
import config from "../config/env.js";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

// GENERIC EMAIL SENDER
export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html,
  });
};

// OTP EMAIL
export const sendOtpEmail = async ({ to, otp, purpose, name }) => {
  await sendEmail({
    to,
    subject: "Verification Code",
    text: `Hello ${name || "there"}, your verification code is ${otp}. It expires in 10 minutes.`,
html: `
  <div style="background:#f4f4f4; padding:40px 0; font-family: Arial, sans-serif;">
    
    <div style="max-width:420px; margin:0 auto; background:#ffffff; border-radius:12px; padding:28px 26px; border:1px solid #eaeaea;">
      
      <!-- HEADER -->
      <div style="text-align:center; margin-bottom:20px;">
        <p style="font-size:13px; color:#888; margin-top:8px;">
          Umuco Core
        </p>
      </div>

      <!-- TITLE -->
      <h2 style="font-size:18px; color:#111; margin-bottom:12px; text-align:left;">
        Confirm your email
      </h2>

      <!-- BODY -->
      <p style="font-size:14px; color:#444; margin-bottom:12px;">
        Hi ${name || "there"},
      </p>

      <p style="font-size:13px; color:#555; margin-bottom:18px; line-height:1.6;">
        Use the code below to finish setting up your account. It’s only valid for a short time.
      </p>

      <!-- OTP -->
      <div style="
        background:#f8f8f8;
        border:1px solid #e5e5e5;
        border-radius:10px;
        padding:18px;
        text-align:center;
        margin:20px 0;
      ">
        <span style="
          font-size:28px;
          font-weight:600;
          letter-spacing:8px;
          color:#c46a4b;
        ">
          ${otp}
        </span>
      </div>

      <!-- META -->
      <p style="font-size:12px; color:#777; margin-bottom:6px;">
        Expires in 10 minutes.
      </p>

      <p style="font-size:12px; color:#777; margin-bottom:18px;">
        If you didn’t request this, you can ignore this message.
      </p>

      <!-- FOOTER -->
      <div style="border-top:1px solid #eee; padding-top:12px;">
        <p style="font-size:11px; color:#aaa; margin:0;">
          Umuco Core · Rwanda Cultural Archive
        </p>
      </div>

    </div>

  </div>
`



  });
};
