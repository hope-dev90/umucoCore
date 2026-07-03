import { sendOtpEmail } from "./utils/email.js";

const testEmail = async () => {
  console.log("Testing email sending...");
  
  try {
    await sendOtpEmail({
      to: "mutimahope8@gmail.com",
      otp: "123456",
      name: "Test User"
    });
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

testEmail();
