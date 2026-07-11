# Requirements Document

## Introduction

This feature enhances the signup flow of the UmucoCore cultural heritage platform. Currently the signup page presents a generic "Create Account" form immediately. This feature introduces an intermediate "explorer type" selection step before the form, then personalizes the form's heading, subtitle, and CTA button to match the chosen explorer type. It also addresses a perceived lag on the signup and login pages caused by the initial hidden/translated render state before the CSS transition activates.

The feature has three parts:
1. An intermediate explorer-type selection step shown before the signup form.
2. Themed/personalized signup form content driven by the selected explorer type.
3. Smoothed page-entry animation on the signup and login pages to eliminate the initial lag.

## Glossary

- **AuthPage**: The React component in `frontend/src/components/AuthPage.jsx` that renders the signup form and the `ExplorerTypeModal`.
- **ExplorerTypeModal**: The overlay component that presents explorer type choices before the signup form is shown.
- **Explorer_Type**: One of five predefined user personas — Warrior, Nature Lover, Royal Historian, Folktale Hunter, Music Explorer — each carrying a themed `adventureTitle`, `adventureSubtitle`, and `cta`.
- **LoginPage**: The React component in `frontend/src/components/LoginPage.jsx` that renders the login form.
- **SignupPage**: The page wrapper at `frontend/src/pages/Signup.jsx` that mounts `AuthPage` with a fade-in transition.
- **LoginRoute**: The page wrapper at `frontend/src/pages/Login.jsx` that mounts `LoginPage` with a fade-in transition.
- **LeftSlideshow**: The decorative image slideshow rendered on the left half of both auth pages on large screens.
- **Lag**: The visual jank caused by an element rendering in its initial hidden/translated-down CSS state for one paint frame before the transition animates it to its visible state.

---

## Requirements

### Requirement 1: Explorer Type Selection Step

**User Story:** As a new visitor, I want to choose what kind of explorer I am before creating an account, so that my signup experience feels relevant to my cultural interests.

#### Acceptance Criteria

1. WHEN the user navigates to the signup page, THE ExplorerTypeModal SHALL be displayed as an overlay before the signup form is interactable.
2. THE ExplorerTypeModal SHALL present exactly five selectable explorer type options: Warrior, Nature Lover, Royal Historian, Folktale Hunter, and Music Explorer.
3. WHEN the user selects an explorer type option, THE ExplorerTypeModal SHALL visually highlight the selected option to confirm the choice.
4. WHILE no explorer type is selected, THE ExplorerTypeModal SHALL keep the Continue button in a disabled state.
5. WHEN the user selects an explorer type and activates the Continue button, THE ExplorerTypeModal SHALL close and pass the selected explorer type identifier to the SignUpPage.
6. THE ExplorerTypeModal SHALL be keyboard accessible: each option SHALL be focusable and activatable via the Enter or Space key, and the Continue button SHALL be reachable via Tab.

---

### Requirement 2: Themed Signup Form

**User Story:** As a new visitor who has chosen an explorer type, I want the signup form to reflect my chosen adventure, so that account creation feels immersive rather than generic.

#### Acceptance Criteria

1. WHEN the ExplorerTypeModal is dismissed with a selected explorer type, THE AuthPage SHALL display the `adventureTitle` for that explorer type as the form heading in place of the generic "Create Account" text.
2. WHEN the ExplorerTypeModal is dismissed with a selected explorer type, THE AuthPage SHALL display the `adventureSubtitle` for that explorer type as the form description in place of the generic subtitle.
3. WHEN the ExplorerTypeModal is dismissed with a selected explorer type, THE AuthPage SHALL display the explorer type's `label` and icon in a badge above the form heading.
4. WHEN the ExplorerTypeModal is dismissed with a selected explorer type, THE AuthPage SHALL display the explorer type's `cta` text on the primary submit button in place of the generic "Sign Up" label.
5. IF no explorer type was selected when the modal was bypassed or dismissed, THEN THE AuthPage SHALL display the generic heading "Create Account", the generic subtitle, and the generic submit button label "Sign Up".
6. THE AuthPage SHALL store the selected explorer type identifier in component state and make it available for inclusion in the registration API call.

---

### Requirement 3: Explorer Type Persistence to Backend

**User Story:** As a product owner, I want the chosen explorer type to be captured during registration, so that the backend can use it for personalized content recommendations.

#### Acceptance Criteria

1. WHEN the user submits the signup form, THE AuthPage SHALL include the selected explorer type identifier in the registration request payload alongside name, email, and password.
2. IF no explorer type was selected, THEN THE AuthPage SHALL submit the registration request without an explorer type field, preserving backward compatibility.

---

### Requirement 5: Resend OTP

**User Story:** As a user who did not receive or whose OTP expired, I want to request a new OTP without starting the process over, so that I can complete verification without frustration.

#### Acceptance Criteria

1. WHEN the OTP verification step is displayed, THE page SHALL show a "Resend OTP" option.
2. WHEN the user activates "Resend OTP", THE system SHALL send a new OTP to the user's registered email or phone.
3. WHILE a resend request is in flight, THE "Resend OTP" option SHALL be disabled to prevent duplicate requests.
4. AFTER a new OTP is sent, THE system SHALL display a confirmation message (e.g. "A new code has been sent").
5. AFTER a successful resend, THE "Resend OTP" option SHALL enter a cooldown period of at least 30 seconds before it becomes active again, with a countdown visible to the user.
6. IF the resend request fails, THE system SHALL display an error message and re-enable the "Resend OTP" option.

---

### Requirement 4: Smooth Page-Entry Animation

**User Story:** As a user navigating to the signup or login page, I want the page to appear smoothly without any initial flicker or jump, so that the experience feels polished.

#### Acceptance Criteria

1. WHEN the SignupPage mounts, THE SignupPage SHALL begin its fade-in and slide-up transition from the first paint frame without an initial hidden or translated-down state.
2. WHEN the LoginRoute mounts, THE LoginRoute SHALL begin its fade-in and slide-up transition from the first paint frame without an initial hidden or translated-down state.
3. THE SignupPage transition duration SHALL be 300 milliseconds or less.
4. THE LoginRoute transition duration SHALL be 300 milliseconds or less.
5. WHEN the user triggers navigation away from the signup or login page, THE SignupPage and LoginRoute SHALL animate out before the navigation completes, with the out-animation completing within 300 milliseconds.
