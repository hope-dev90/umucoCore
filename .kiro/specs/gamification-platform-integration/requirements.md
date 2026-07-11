# Requirements Document

## Introduction

This feature transforms the existing Umuco platform from a static reading and heritage exploration application into a rewarding, game-like adventure experience. The gamification backend APIs (XP, badges, collectibles, leaderboard, daily login, notifications) already exist at `/api/gamification/*`. This integration wires every meaningful user action to those existing endpoints and surfaces the returned rewards through animated UI components using Framer Motion — without changing any story content, educational value, or existing design system.

## Glossary

- **Platform**: The React + Vite frontend application
- **Gamification_Service**: The existing backend at `http://localhost:5000/api/gamification`
- **GamificationContext**: A new React context that wraps `useGamification` and exposes live XP, level, streak, badges, collectibles, leaderboard, and refresh functions to all child components
- **RewardToast**: A transient animated notification component that displays XP gains, level-ups, badge unlocks, collectible finds, and streak saves
- **StoryCard**: A card component representing a heritage story with cover image, title, reading time, difficulty, category, XP reward, and completion/lock state
- **StoryCompletionScreen**: A full-screen overlay displayed after a user finishes reading a story, showing accumulated rewards for that session
- **XP**: Experience Points awarded by the backend `award-xp` endpoint
- **Badge**: A collectible achievement icon awarded by the backend `award-badge` endpoint
- **Collectible**: A rare item awarded by the backend `award-collectible` endpoint
- **DailyStreak**: The consecutive-day login count returned by the backend `daily-login` endpoint
- **Leaderboard**: The ranked list of users by XP returned by the backend `leaderboard` endpoint
- **ExplorerType**: The user's chosen archetype (warrior, nature-lover, royal-historian, folktale-hunter, music-explorer) that drives personalised recommendations
- **Adventure_Language**: Thematic copy replacing generic UI wording (e.g. "Read Story" → "Embark on Adventure", "Sign Up" → "Begin Your Journey")

---

## Requirements

### Requirement 1: Global Gamification State

**User Story:** As a logged-in user, I want my XP, level, streak, badges, and collectibles to stay in sync across every page, so that I never see stale data after earning a reward.

#### Acceptance Criteria

1. THE GamificationContext SHALL expose `xp`, `level`, `streak`, `bestStreak`, `badges`, `userBadges`, `collectibles`, `userCollectibles`, `leaderboard`, `loading`, and a `refresh` function to all descendant components.
2. WHEN a user logs in, THE GamificationContext SHALL call the `daily-login` endpoint and store the returned streak and XP data.
3. WHEN any gamification event fires (XP awarded, badge earned, collectible found), THE GamificationContext SHALL re-fetch XP, badges, collectibles, and leaderboard without requiring a page reload.
4. IF the Gamification_Service returns a non-2xx response, THEN THE GamificationContext SHALL log the error and retain the last known state rather than clearing it.
5. WHILE a user is not authenticated, THE GamificationContext SHALL expose empty default values and skip all API calls.

---

### Requirement 2: Reward Toast Notifications

**User Story:** As a user, I want to see animated feedback whenever I earn XP, level up, unlock a badge, find a collectible, or save a streak, so that every action feels immediately rewarding.

#### Acceptance Criteria

1. WHEN XP is awarded, THE RewardToast SHALL appear with the amount (e.g. "+25 XP") and disappear after 3 seconds.
2. WHEN the user reaches a new level, THE RewardToast SHALL display a level-up message with the new level number, animated with Framer Motion scale and fade.
3. WHEN a badge is unlocked, THE RewardToast SHALL display the badge icon, name, and rarity with an animated entrance.
4. WHEN a collectible is found, THE RewardToast SHALL display the collectible icon, name, and rarity with an animated entrance.
5. WHEN a daily streak is saved or extended, THE RewardToast SHALL display the current streak count and a flame emoji.
6. THE Platform SHALL queue multiple simultaneous RewardToast notifications and display them stacked without overlap.
7. IF the Gamification_Service fails to award XP, THEN THE RewardToast SHALL NOT appear for that event.

---

### Requirement 3: Story Cards

**User Story:** As a user browsing heritage content, I want each content card to show its XP reward, difficulty, and my completion state, so that I can choose adventures that suit my level and goals.

#### Acceptance Criteria

1. THE StoryCard SHALL display a cover image, title, estimated reading time, category, difficulty indicator, and XP reward value.
2. WHEN a user has completed a story, THE StoryCard SHALL display a completion badge or checkmark overlay.
3. WHERE a story has prerequisite stories not yet completed by the user, THE StoryCard SHALL display a locked state with a lock icon.
4. THE StoryCard SHALL animate on hover using Framer Motion (subtle lift and shadow).
5. WHEN a user clicks an unlocked StoryCard, THE Platform SHALL navigate to the story and award "story started" XP via the Gamification_Service.
6. IF the Gamification_Service is unavailable when starting a story, THEN THE Platform SHALL still navigate to the story content and attempt the XP award in the background.

---

### Requirement 4: Story Reading Experience

**User Story:** As a user reading a story, I want to see my reading progress, estimated time remaining, and a preview of XP I will earn, so that I feel motivated to finish.

#### Acceptance Criteria

1. WHILE a user is reading a story, THE Platform SHALL display a progress bar showing the percentage of the story completed.
2. THE Platform SHALL display the estimated remaining reading time based on a 200 words-per-minute reading speed.
3. THE Platform SHALL display a preview of the XP reward the user will earn upon completion.
4. WHEN a user reaches the 25%, 50%, and 75% milestones, THE Platform SHALL call the Gamification_Service `award-xp` endpoint with a "reading progress" reason.
5. WHEN a user bookmarks a story, THE Platform SHALL call the Gamification_Service `award-xp` endpoint with a "bookmark" reason and display a RewardToast.
6. WHEN a user likes a story, THE Platform SHALL call the Gamification_Service `award-xp` endpoint with a "like" reason and display a RewardToast.
7. WHEN a user shares a story, THE Platform SHALL call the Gamification_Service `award-xp` endpoint with a "share" reason and display a RewardToast.
8. WHEN a user plays audio for a story, THE Platform SHALL call the Gamification_Service `award-xp` endpoint with an "audio played" reason and display a RewardToast.
9. WHEN a user submits a comment on a story, THE Platform SHALL call the Gamification_Service `award-xp` endpoint with a "comment" reason and display a RewardToast.

---

### Requirement 5: Story Completion Screen

**User Story:** As a user who finishes a story, I want to see a celebratory screen summarising all the rewards I earned, so that I feel a sense of accomplishment.

#### Acceptance Criteria

1. WHEN a user completes a story (reaches 100% progress), THE Platform SHALL display the StoryCompletionScreen overlaying the current page.
2. THE StoryCompletionScreen SHALL display the total XP earned during the reading session, animated as a counting number using Framer Motion.
3. THE StoryCompletionScreen SHALL display an animated level progress bar reflecting the user's current XP toward the next level.
4. WHEN a new badge was earned during the session, THE StoryCompletionScreen SHALL display the badge with an animated entrance.
5. WHEN a new collectible was found during the session, THE StoryCompletionScreen SHALL display the collectible with rarity indicator and animated entrance.
6. THE StoryCompletionScreen SHALL provide a "Continue Adventure" button that dismisses the screen.
7. THE StoryCompletionScreen SHALL display the next recommended story based on the user's ExplorerType and reading history.
8. WHEN the StoryCompletionScreen is dismissed, THE GamificationContext SHALL refresh all gamification data.

---

### Requirement 6: Quiz Integration

**User Story:** As a user, I want a quiz to automatically appear after completing a story, so that I can test my knowledge and earn bonus XP.

#### Acceptance Criteria

1. WHEN a story is marked complete, THE Platform SHALL auto-launch the quiz associated with that story if one exists.
2. WHEN a user answers a quiz question correctly, THE Platform SHALL call the Gamification_Service `award-xp` endpoint with a "quiz correct" reason and display the correct answer confirmation.
3. WHEN a user completes the full quiz, THE Platform SHALL call the Gamification_Service `award-xp` endpoint with a "quiz completed" reason.
4. THE Platform SHALL display the total XP earned from the quiz at the quiz summary screen.
5. WHEN completing a quiz awards a badge, THE Platform SHALL display the badge unlock using a RewardToast.
6. IF a quiz does not exist for a story, THEN THE Platform SHALL skip quiz auto-launch and proceed directly to the StoryCompletionScreen.

---

### Requirement 7: Collectibles Popup

**User Story:** As a user, I want an animated popup to appear when I find a collectible, so that the discovery feels exciting and memorable.

#### Acceptance Criteria

1. WHEN the Gamification_Service awards a collectible, THE Platform SHALL display an animated full-screen collectible popup using Framer Motion (scale in, glow effect).
2. THE collectible popup SHALL display the collectible icon, name, description, and rarity tier.
3. WHEN the collectible popup is dismissed, THE Platform SHALL update the user's collectible inventory in the GamificationContext.
4. THE collectible popup SHALL show a rarity colour indicator: common (grey), uncommon (green), rare (blue), epic (purple), legendary (gold).

---

### Requirement 8: Badge Popup

**User Story:** As a user, I want an animated popup when I earn a new badge, so that badge unlocks feel like real achievements.

#### Acceptance Criteria

1. WHEN the Gamification_Service awards a badge, THE Platform SHALL display an animated badge popup using Framer Motion (rotate and scale entrance).
2. THE badge popup SHALL display the badge icon, name, description, and rarity tier.
3. WHEN the badge popup is dismissed, THE Platform SHALL update the user's badge collection in the GamificationContext.
4. THE badge popup SHALL be dismissible by clicking outside the popup or pressing the Escape key.

---

### Requirement 9: Dashboard Gamification Widgets

**User Story:** As a user on the dashboard, I want to see my current XP, level, streak, leaderboard position, and daily challenge at a glance, so that I always know how I'm progressing.

#### Acceptance Criteria

1. THE Dashboard SHALL display an XP widget showing the user's current XP, level, and progress toward the next level using the existing XPBar component.
2. THE Dashboard SHALL display a daily streak widget showing the current streak count and best streak count.
3. THE Dashboard SHALL display the user's most recently earned badge with its icon and name.
4. THE Dashboard SHALL display the user's leaderboard position among all users.
5. THE Dashboard SHALL display a "Today's Challenge" widget showing a recommended story for the day.
6. THE Dashboard SHALL display a "Continue Reading" widget showing the user's most recently viewed story with a progress indicator.
7. WHEN the Dashboard loads, THE GamificationContext SHALL call `daily-login` to record the visit and potentially update the streak.
8. AFTER any gamification event while on the Dashboard, THE Dashboard SHALL reflect updated XP and level data without a page reload.

---

### Requirement 10: Leaderboard

**User Story:** As a user, I want to see a leaderboard of top explorers, so that I have a sense of community and competition.

#### Acceptance Criteria

1. THE Platform SHALL display a Leaderboard component showing the top 10 users ranked by XP, sourced from the `leaderboard` endpoint.
2. THE Leaderboard SHALL highlight the current user's row with a distinct visual style.
3. THE Leaderboard SHALL display each user's rank, name, ExplorerType icon, XP total, and level.
4. WHEN a gamification event awards XP to the current user, THE Leaderboard SHALL automatically re-fetch from the Gamification_Service and update.
5. THE Platform SHALL display the Leaderboard on the Dashboard sidebar and as a dedicated section on the Profile page.

---

### Requirement 11: Profile Page Gamification Sync

**User Story:** As a user viewing my profile, I want to see all my gamification data — XP, badges, collectibles, reading history, streak, and explorer type — synced in real time.

#### Acceptance Criteria

1. THE Profile page SHALL display the user's current XP, level, and progress to next level using the existing XPBar component.
2. THE Profile page SHALL display all earned badges using the existing BadgeCard component, with locked badges shown as greyed-out.
3. THE Profile page SHALL display all collectibles using the existing CollectibleCard component, with unobtained collectibles shown as locked.
4. THE Profile page SHALL display current streak, best streak, and total days explored stats.
5. WHEN the Profile page mounts, THE Platform SHALL call the Gamification_Service to refresh XP, badges, and collectibles.
6. THE Profile page SHALL display the user's ExplorerType with the corresponding icon and accent colour.

---

### Requirement 12: Daily Login and Streak

**User Story:** As a user, I want to be rewarded for logging in every day, so that I am motivated to return regularly.

#### Acceptance Criteria

1. WHEN a user logs in, THE Platform SHALL call the Gamification_Service `daily-login` endpoint once per calendar day.
2. WHEN the `daily-login` endpoint returns a streak reward, THE Platform SHALL display the streak count via a RewardToast.
3. THE Platform SHALL display a streak indicator in the navigation showing the current streak count with a flame icon.
4. WHEN a daily streak is extended to a milestone (7, 14, 30 days), THE Platform SHALL display a RewardToast with the milestone celebration.
5. IF the `daily-login` endpoint has already been called today (returns no new reward), THEN THE Platform SHALL update the displayed streak without showing a RewardToast.

---

### Requirement 13: Navigation Adventure Language

**User Story:** As a user, I want the platform's navigation and CTA copy to use adventure-themed language, so that the app feels like an immersive game.

#### Acceptance Criteria

1. THE Platform SHALL replace "Read Story" with "Embark on Adventure" across all navigation, cards, and buttons.
2. THE Platform SHALL replace "Sign Up" with "Begin Your Journey" on the Landing and Signup pages.
3. THE Platform SHALL replace "Explore" section titles with "Discover Quests" or equivalent adventure phrasing.
4. THE Platform SHALL replace "Dashboard" with "Adventure Hub" in navigation labels.
5. THE Platform SHALL replace "History" (reading history) navigation label with "Chronicles".
6. THE Platform SHALL replace "Saved" navigation label with "My Scrolls".
7. WHEN adventure language is applied, THE Platform SHALL preserve all existing functionality and routing behind the updated labels.

---

### Requirement 14: Animations with Framer Motion

**User Story:** As a user, I want fluid animations throughout the platform, so that the experience feels alive and engaging.

#### Acceptance Criteria

1. THE Platform SHALL use Framer Motion for all XP counter animations (counting up to new value).
2. THE Platform SHALL use Framer Motion for all progress bar fill animations.
3. THE Platform SHALL use Framer Motion for badge unlock animations (rotate and scale).
4. THE Platform SHALL use Framer Motion for level-up animations (burst / glow effect).
5. THE Platform SHALL use Framer Motion for reward popup entrance and exit transitions.
6. THE Platform SHALL use Framer Motion for StoryCard hover effects (lift and shadow).
7. THE Platform SHALL use Framer Motion for page-level route transitions (fade in/out).
8. WHERE a user has set their system preference to `prefers-reduced-motion`, THE Platform SHALL disable or reduce all Framer Motion animations.

---

### Requirement 15: Story Recommendations

**User Story:** As a user, I want story recommendations tailored to my ExplorerType and reading history, so that I always have a relevant adventure ready.

#### Acceptance Criteria

1. THE Platform SHALL display recommended stories on the Dashboard filtered by the user's ExplorerType category.
2. WHEN a user completes a story, THE Platform SHALL exclude that story from future recommendations.
3. THE Platform SHALL display at least 3 recommended stories on the StoryCompletionScreen.
4. THE Platform SHALL prioritise stories with matching category to the user's ExplorerType when fetching from the heritage API.
5. IF fewer than 3 matching stories are available, THEN THE Platform SHALL supplement with stories from other categories.

---

### Requirement 16: Graceful Degradation

**User Story:** As a user, I want the platform to remain fully functional even if the gamification service is temporarily unavailable, so that I can still read and explore content.

#### Acceptance Criteria

1. IF the Gamification_Service is unreachable, THEN THE Platform SHALL display all content pages normally without gamification overlays.
2. IF a gamification API call fails, THEN THE Platform SHALL NOT block the primary user action (navigation, reading, audio playback).
3. THE Platform SHALL display a subtle inline indicator (not a blocking modal) when gamification sync is unavailable.
4. WHEN the Gamification_Service becomes reachable again, THE Platform SHALL automatically retry pending XP awards.
5. THE Platform SHALL not expose raw error messages from the Gamification_Service to end users.
