import { sendOtpEmail } from "./utils/email.js";
import config from "./config/env.js";

const testEmail = async () => {
  const recipient = process.env.TEST_EMAIL || config.email.user;

  if (!recipient || recipient === "test@example.com") {
    console.error("Set TEST_EMAIL in .env or configure EMAIL_USER before running this test.");
    process.exit(1);
  }

  console.log(`Testing email sending to ${recipient}...`);

  try {
    const result = await sendOtpEmail({
      to: recipient,
      otp: "123456",
      name: "Test User",
    });

    if (result?.devFallback) {
      console.log("SMTP unavailable — development OTP fallback used. Check server output above for [DEV OTP].");
    } else {
      console.log("Email sent successfully!");
    }
  } catch (error) {
    console.error("Email sending failed:", error.userMessage || error.message);
    process.exit(1);
  }
};

testEmail();
