import React from "react";
import { X } from "lucide-react";
import UmucoLogo from "./UmucoLogo";

const SignupWelcomeModal = ({
  onMaybeLater = () => {},
  onCreateAccount = () => {},
  onSecondaryAction = null,
  heroImageSrc,
  heroImageAlt = "",
  heading = "Welcome to Umuco Core",
  description = "You're one step away from unlocking Rwanda's stories, traditions, and living heritage.",
  primaryLabel = "Create Account →",
  secondaryLabel = "Maybe later",
  switchPrompt = "Already have an account?",
  switchLabel = "Log in",
}) => {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#FFFBF3] shadow-2xl shadow-black/30">
        {/* Close */}
        <button
          onClick={onMaybeLater}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-[#5a2d0c] hover:bg-black/5 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-3">
            <UmucoLogo className="h-8 w-8 rounded-full flex-shrink-0" />
            <h2 className="text-base font-bold leading-tight text-[#5a2d0c]">
              {heading}
            </h2>
          </div>

          <p className="mb-5 text-xs leading-relaxed text-[#4a4038]">
            {description}
          </p>

          {/* Actions */}
          <button
            onClick={onCreateAccount}
            className="mb-2 w-full rounded-lg bg-[#8B3A0E] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#a04412] active:scale-[0.98]"
          >
            {primaryLabel}
          </button>

          <button
            onClick={onMaybeLater}
            className="w-full rounded-lg border border-[#8B3A0E] py-2.5 text-xs font-bold text-[#8B3A0E] transition-colors hover:bg-[#8B3A0E]/[0.06]"
          >
            {secondaryLabel}
          </button>

          {onSecondaryAction && (
            <p className="mt-3 text-center text-xs text-[#6b6058]">
              {switchPrompt}{" "}
              <button
                type="button"
                onClick={onSecondaryAction}
                className="font-bold text-[#8B3A0E] hover:text-[#a04412] transition-colors"
              >
                {switchLabel}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupWelcomeModal;
