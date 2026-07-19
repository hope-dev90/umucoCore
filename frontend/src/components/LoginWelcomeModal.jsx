import React from "react";
import SignupWelcomeModal from "./SignupWelcomeModal";
import nyanzaImage from "../assets/home/nyanza.jpg";

export default function LoginWelcomeModal({
  onMaybeLater = () => {},
  onLogin = () => {},
  onCreateAccount = () => {},
}) {
  return (
    <SignupWelcomeModal
      onMaybeLater={onMaybeLater}
      onCreateAccount={onLogin}
      onSecondaryAction={onCreateAccount}
      heroImageSrc={nyanzaImage}
      heroImageAlt="A view of Rwanda's cultural heritage"
      heading="Welcome back to Umuco Core"
      description="Log in to continue your journey through Rwanda's stories, traditions, and living heritage."
      primaryLabel="Log In →"
      secondaryLabel="Maybe later"
      switchPrompt="New here?"
      switchLabel="Create account"
    />
  );
}
