import React from "react";
import { X, BookOpen, Headphones, Trophy } from "lucide-react";
import UmucoLogo from "./UmucoLogo";
import heroIllustration from "../assets/nyanza.jpg";

// Imigongo-style triangle strip — reused from the dashboard/signup-card
// components so this modal reads as the same product, not a one-off popup.
function ImigongoBorder({ flip = false }) {
  const triangles = Array.from({ length: 26 });
  return (
    <div className={`flex w-full ${flip ? "rotate-180" : ""}`} aria-hidden="true">
      {triangles.map((_, i) => (
        <svg key={i} viewBox="0 0 20 14" className="h-3 w-4 flex-shrink-0">
          <polygon
            points="0,0 20,0 10,14"
            fill={i % 3 === 0 ? "#8B3A2C" : "#D9C7A3"}
          />
        </svg>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: BookOpen,
    title: "Read timeless stories",
    body: "Explore legends and real stories from across Rwanda.",
  },
  {
    icon: Headphones,
    title: "Listen & learn",
    body: "Hear tales and language lessons passed down for generations.",
  },
  {
    icon: Trophy,
    title: "Earn & grow",
    body: "Collect XP, badges, and streaks as you go.",
  },
];

const SignupWelcomeModal = ({
  onMaybeLater = () => {},
  onCreateAccount = () => {},
  onSecondaryAction = null,
  heroImageSrc = heroIllustration,
  heroImageAlt = "The Royal Palace of Nyanza",
  heading = "Welcome to Umuco Core",
  description = "You're one step away from unlocking powerful stories, rich traditions, and the legacy of Rwanda.",
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="relative flex w-full max-w-[900px] overflow-hidden rounded-2xl bg-[#FFFBF3] shadow-2xl shadow-black/30">
        {/* Close button */}
        <button
          onClick={onMaybeLater}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#5a2d0c] transition-colors hover:bg-black/5"
        >
          <X size={20} />
        </button>

        {/* Hero image — hidden below sm breakpoint via Tailwind, not JS */}
        <div className="hidden w-1/2 sm:block">
          <img
            src={heroImageSrc}
            alt={heroImageAlt}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex w-full flex-col justify-center p-8 sm:w-1/2">
          <div className="mb-4 flex items-center gap-3">
            <UmucoLogo className="h-10 w-10 rounded-full" />
            <h2 className="text-2xl font-bold leading-tight text-[#5a2d0c]">
              {heading}
            </h2>
          </div>

          <p className="mb-5 text-[15px] leading-relaxed text-[#4a4038]">
            {description}
          </p>

          <div className="mb-5 rounded-xl bg-white p-4 shadow-sm shadow-black/5">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className={`flex items-start gap-3 ${i > 0 ? "mt-3.5 border-t border-[#F0E6D6] pt-3.5" : ""}`}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F4E9D6] text-[#8B3A0E]">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2B1B14]">{title}</p>
                  <p className="text-sm text-[#6b6058]">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onCreateAccount}
            className="mb-3 w-full rounded-lg bg-[#8B3A0E] py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#a04412] active:scale-[0.98]"
          >
            {primaryLabel}
          </button>

          <button
            onClick={onMaybeLater}
            className="w-full rounded-lg border border-[#8B3A0E] py-3.5 text-[15px] font-bold text-[#8B3A0E] transition-colors hover:bg-[#8B3A0E]/[0.06]"
          >
            {secondaryLabel}
          </button>

          {onSecondaryAction && (
            <p className="mt-4 text-center text-sm text-[#6b6058]">
              {switchPrompt}{" "}
              <button
                type="button"
                onClick={onSecondaryAction}
                className="font-bold text-[#8B3A0E] transition-colors hover:text-[#a04412]"
              >
                {switchLabel}
              </button>
            </p>
          )}

          <p className="mt-4 text-center text-xs text-[#8B7A6A]">
            Culture is Rwanda, and Rwanda is us.
          </p>
        </div>

        {/* Bottom border strip spans the full modal width */}
        <div className="absolute bottom-0 left-0 right-0">
          <ImigongoBorder flip />
        </div>
      </div>
    </div>
  );
};

export default SignupWelcomeModal;
