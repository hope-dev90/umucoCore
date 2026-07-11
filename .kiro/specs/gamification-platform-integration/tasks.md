# Implementation Plan: Gamification Platform Integration

## Overview

Wire the existing `/api/gamification/*` backend into every meaningful user interaction on the Umuco platform. Deliver animated reward feedback through Framer Motion components centralised under a new `GamificationContext`. All changes are additive — no existing content, routing, or design system is removed.

## Tasks

- [ ] 1. Install dependencies and configure test infrastructure
  - Run `npm install framer-motion@^11` inside `frontend/`
  - Run `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fast-check` inside `frontend/`
  - Add `test` script and `vitest.config.js` (or update `vite.config.js`) with jsdom environment and `@testing-library/jest-dom` setup file
  - _Requirements: 14.1–14.8_

- [x] 2. Create event bus utility
  - [ ] 2.1 Create `frontend/src/utils/gamificationEvents.js`
    - Implement `emit`, `on`, `off` with the listeners registry as designed
    - Export event type constants: `'xp'`, `'levelUp'`, `'badge'`, `'collectible'`, `'streak'`
    - _Requirements: 1.3, 2.1–2.5_
  - [ ]* 2.2 Write unit tests for gamificationEvents
    - Test `on` + `emit` calls listener, `off` removes it, multiple listeners for same type all fire
    - File: `frontend/src/utils/__tests__/gamificationEvents.test.js`
    - _Requirements: 1.3_

- [x] 3. Create GamificationContext
  - [ ] 3.1 Create `frontend/src/contexts/GamificationContext.jsx`
    - Wrap `useGamification` hook; expose all fields listed in design (`xp`, `level`, `streak`, `bestStreak`, `badges`, `userBadges`, `collectibles`, `userCollectibles`, `leaderboard`, `loading`, `serviceAvailable`, `refresh`, `awardXP`, `awardBadge`, `awardCollectible`, `getCurrentLevelData`, `getNextLevelData`)
    - Gate all API calls on authenticated user; expose empty defaults when unauthenticated
    - Call `daily-login` once per calendar day (guard with `localStorage` key `lastLoginDate`) after first auth
    - After each successful API call emit the corresponding `gamificationEvents` event as per design
    - On API failure: log error, set `serviceAvailable = false`, preserve previous state, append failed XP awards to `localStorage.pendingXPAwards` (max 20 entries)
    - Drain `pendingXPAwards` on next successful API call
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.1, 16.1–16.5_
  - [ ]* 3.2 Write property test: error state preservation (Property 2)
    - Generate random valid state snapshots; mock next fetch to return 4xx/5xx; assert all state values unchanged
    - File: `frontend/src/contexts/__tests__/GamificationContext.test.jsx`
    - **Property 2: Error state preservation**
    - **Validates: Requirements 1.4, 16.2**
  - [ ]* 3.3 Write unit tests for GamificationContext
    - Mount with mocked fetch; verify `daily-login` called on first login; verify state preserved on error; verify `serviceAvailable` flag toggles correctly
    - File: `frontend/src/contexts/__tests__/GamificationContext.test.jsx`
    - _Requirements: 1.1–1.5_

- [ ] 4. Create motionConfig utility
  - Create `frontend/src/utils/motionConfig.js`
  - Export `useMotionSafe()` hook using `useReducedMotion` from framer-motion as specified in design
  - _Requirements: 14.8_

- [x] 5. Create RewardToast and RewardToastContainer
  - [ ] 5.1 Create `frontend/src/components/Gamification/RewardToast.jsx`
    - Accept `{ toast, onRemove }` props
    - Implement Framer Motion variants (spring slide-in, slide-out right) per design spec
    - Render correct content per toast type (`xp`, `levelUp`, `badge`, `collectible`, `streak`) with correct colours
    - Apply `useMotionSafe()` to collapse animation when `prefers-reduced-motion` is set
    - _Requirements: 2.1–2.5, 14.5, 14.8_
  - [ ] 5.2 Create `frontend/src/components/Gamification/RewardToastContainer.jsx`
    - Render via `ReactDOM.createPortal` into `document.body`
    - Subscribe to all `gamificationEvents` on mount; unsubscribe on unmount
    - Maintain `queue` state array; auto-remove each toast after 3 seconds
    - Position: `fixed bottom-6 right-6 flex flex-col gap-2 z-[200]`
    - Wrap queue rendering in `AnimatePresence` to handle exit animations
    - _Requirements: 2.1–2.6_
  - [ ]* 5.3 Write property test: toast content completeness (Property 3)
    - Generate arbitrary XP amounts, level numbers, badge objects, collectible objects, streak counts; render `RewardToast`; assert primary identifier is present in DOM
    - **Property 3: Reward toast content completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
    - File: `frontend/src/components/Gamification/__tests__/RewardToast.test.jsx`
  - [ ]* 5.4 Write property test: toast queue isolation on API failure (Property 4)
    - Mock `awardXP` to throw; assert queue length unchanged before and after failed call
    - **Property 4: Toast queue isolation on API failure**
    - **Validates: Requirements 2.7**
    - File: `frontend/src/components/Gamification/__tests__/RewardToast.test.jsx`
  - [ ]* 5.5 Write property test: toast stack without overlap (Property 5)
    - Simulate N ≥ 2 simultaneous events; assert all N toasts in DOM with distinct vertical positions
    - **Property 5: Toast stack without overlap**
    - **Validates: Requirements 2.6**
    - File: `frontend/src/components/Gamification/__tests__/RewardToast.test.jsx`

- [x] 6. Create BadgePopup and CollectiblePopup
  - [ ] 6.1 Create `frontend/src/components/Gamification/BadgePopup.jsx`
    - Accept `{ badge, onDismiss }` props
    - Full-screen overlay with blurred backdrop; card with spring scale+rotate entrance per design spec
    - Display badge icon, name, description, rarity chip with `RARITY_COLOURS`
    - Dismiss on backdrop click or Escape key
    - _Requirements: 8.1–8.4_
  - [ ] 6.2 Create `frontend/src/components/Gamification/CollectiblePopup.jsx`
    - Same structure as `BadgePopup` with rarity glow box-shadow from `RARITY_GLOW` map per design spec
    - Framer Motion: scale `[0, 1.2, 1]` entrance
    - _Requirements: 7.1–7.4_
  - [ ] 6.3 Add rarity colour tokens and popup overlay styles to `frontend/src/components/Gamification/Gamification.css`
    - Add `RARITY_COLOURS` CSS custom properties and overlay/backdrop styles
    - _Requirements: 7.4, 8.2_
  - [ ]* 6.4 Write property test: popup renders required fields (Property 13)
    - Generate arbitrary badge and collectible objects; assert icon, name, description, rarity label all present in rendered HTML
    - **Property 13: Reward popup renders required fields**
    - **Validates: Requirements 7.2, 7.4, 8.2**
    - File: `frontend/src/components/Gamification/__tests__/BadgePopup.test.jsx`, `CollectiblePopup.test.jsx`
  - [ ]* 6.5 Write unit tests for BadgePopup and CollectiblePopup
    - Test Escape key dismiss, backdrop click dismiss, snapshot tests
    - File: `frontend/src/components/Gamification/__tests__/BadgePopup.test.jsx`, `CollectiblePopup.test.jsx`
    - _Requirements: 8.4_

- [ ] 7. Create AdventureStoryCard
  - [ ] 7.1 Create `frontend/src/components/Gamification/AdventureStoryCard.jsx`
    - Accept story shape and `onClick` as per design spec
    - Render cover image, category chip, title, reading time, difficulty dots, XP reward chip
    - Apply completed overlay (green checkmark) and locked state (greyscale + lock icon, click disabled)
    - CTA button: "Embark on Adventure" / "Locked" / "Re-read"
    - Framer Motion `whileHover` lift via `useMotionSafe()`
    - _Requirements: 3.1–3.6, 14.6_
  - [ ]* 7.2 Write property test: AdventureStoryCard renders all required fields (Property 6)
    - Generate arbitrary story objects; assert title, reading time, category, XP reward all present as text content
    - **Property 6: AdventureStoryCard renders all required fields**
    - **Validates: Requirements 3.1**
    - File: `frontend/src/components/Gamification/__tests__/AdventureStoryCard.test.jsx`
  - [ ]* 7.3 Write property test: navigation completes despite API failure (Property 7)
    - Mock `awardXP` to throw; assert `onClick` navigation handler called exactly once
    - **Property 7: Navigation always completes regardless of gamification availability**
    - **Validates: Requirements 3.6, 16.1, 16.2**
    - File: `frontend/src/components/Gamification/__tests__/AdventureStoryCard.test.jsx`
  - [ ]* 7.4 Write unit tests for AdventureStoryCard
    - Test locked state disables click, completed state shows checkmark
    - File: `frontend/src/components/Gamification/__tests__/AdventureStoryCard.test.jsx`
    - _Requirements: 3.2, 3.3_

- [x] 8. Create ReadingProgress
  - [ ] 8.1 Create `frontend/src/components/Gamification/ReadingProgress.jsx`
    - Accept `{ totalWords, scrollContainerRef, storyId, xpReward, onComplete }` props
    - Sticky bar; derive `percentComplete` from scroll position of `scrollContainerRef`
    - Framer Motion linear width animation on progress fill
    - Display percentage, estimated remaining time (`Math.ceil((1 - pct/100) * totalWords / 200)` min), and XP preview
    - Track milestones 25/50/75 in a `useRef` set to prevent duplicate `awardXP` calls; call `onComplete` at 100%
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 8.2 Write property test: reading progress accuracy (Property 8)
    - Generate float scroll fractions and word counts; assert displayed percentage and remaining time match formula
    - **Property 8: Reading progress accuracy**
    - **Validates: Requirements 4.1, 4.2**
    - File: `frontend/src/components/Gamification/__tests__/ReadingProgress.test.jsx`
  - [ ]* 8.3 Write property test: milestone XP fires exactly once (Property 9)
    - Generate scroll sequences that cross thresholds multiple times; assert `awardXP` called exactly once per milestone per session
    - **Property 9: Milestone XP awards fire exactly once**
    - **Validates: Requirements 4.4**
    - File: `frontend/src/components/Gamification/__tests__/ReadingProgress.test.jsx`

- [ ] 9. Create DailyStreakWidget and LeaderboardWidget
  - [ ] 9.1 Create `frontend/src/components/Gamification/DailyStreakWidget.jsx`
    - Accept `{ streak, bestStreak }` props
    - Compact card: flame icon with infinite pulse animation (via `useMotionSafe()`), current streak, best streak
    - _Requirements: 9.2, 12.3_
  - [ ] 9.2 Create `frontend/src/components/Gamification/LeaderboardWidget.jsx`
    - Accept `{ entries, currentUserId, limit = 10 }` props
    - Render ranked list; highlight current user row; show rank badge (🥇🥈🥉 for top 3), avatar initial, name, explorer type icon, level pill, XP total
    - _Requirements: 10.1–10.3, 10.5_
  - [ ]* 9.3 Write property test: leaderboard order and fields (Property 14)
    - Generate arrays of leaderboard entries; assert rendered in descending XP order, each row has rank/name/XP/level, current user row has distinct class
    - **Property 14: Leaderboard correctness**
    - **Validates: Requirements 10.1, 10.2, 10.3**
    - File: `frontend/src/components/Gamification/__tests__/LeaderboardWidget.test.jsx`
  - [ ]* 9.4 Write unit tests for DailyStreakWidget
    - Verify streak and best streak values render correctly
    - File: `frontend/src/components/Gamification/__tests__/DailyStreakWidget.test.jsx`
    - _Requirements: 9.2_

- [x] 10. Create StoryCompletionScreen
  - [ ] 10.1 Create `frontend/src/components/Gamification/StoryCompletionScreen.jsx`
    - Accept `{ sessionXP, newBadges, newCollectibles, recommendedStories, onDismiss }` props
    - Full-screen overlay with fade+scale entrance animation
    - XP count-up using `useMotionValue` + `animate()` from 0 to `sessionXP`
    - Animated level progress bar (Framer Motion width)
    - Rewards row with `staggerChildren: 0.1` for badges and collectibles
    - 3 `AdventureStoryCard` recommended stories row
    - "Continue Adventure" button calls `onDismiss` → triggers `context.refresh()`
    - _Requirements: 5.1–5.8, 14.1, 14.2_
  - [ ]* 10.2 Write property test: completion screen session rewards completeness (Property 11)
    - Generate non-empty arrays of badges and collectibles; assert every item's name present in rendered DOM
    - **Property 11: Completion screen session rewards completeness**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
    - File: `frontend/src/components/Gamification/__tests__/StoryCompletionScreen.test.jsx`
  - [ ]* 10.3 Write unit tests for StoryCompletionScreen
    - Verify `onDismiss` fires on button click, verify recommended stories render
    - File: `frontend/src/components/Gamification/__tests__/StoryCompletionScreen.test.jsx`
    - _Requirements: 5.6, 5.7, 5.8_

- [ ] 11. Checkpoint — ensure all new components build and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Animate existing Gamification components
  - [ ] 12.1 Update `frontend/src/components/Gamification/XPBar.jsx`
    - Replace CSS width transition with Framer Motion `motion.div` width animation: `duration: 1.2, ease: [0.4, 0, 0.2, 1]`
    - Apply `useMotionSafe()` for reduced-motion compliance
    - _Requirements: 14.1, 14.2, 14.8_
  - [ ] 12.2 Update `frontend/src/components/Gamification/BadgeCard.jsx`
    - Wrap card in `motion.div` with `whileHover: { y: -2, boxShadow: var(--shadow-md) }` via `useMotionSafe()`
    - _Requirements: 14.3_
  - [ ] 12.3 Update `frontend/src/components/Gamification/CollectibleCard.jsx`
    - Same hover lift pattern as BadgeCard
    - _Requirements: 14.6_

- [ ] 13. Update translations and adventure language copy
  - Update `frontend/src/translations.js`
    - Add all new keys from the Adventure Language Copy Map in the design: `adventure.readStory`, `adventure.signUp`, `adventure.explore`, `adventure.xpLabel`, `adventure.streakLabel` for both `en` and `rw`
    - Update existing keys in place: `sidebar.home` → "Adventure Hub", `sidebar.history` → "Chronicles", `sidebar.saved` → "My Scrolls", `home.exploreNow`, `home.continueExploring`, `home.todayHighlight`
    - _Requirements: 13.1–13.7_

- [ ] 14. Update Layout.jsx with streak indicator and adventure nav labels
  - Update `frontend/src/components/Layout.jsx`
    - Use updated translation keys for sidebar nav labels (`sidebar.home`, `sidebar.history`, `sidebar.saved`)
    - Add streak indicator in topbar: flame icon + streak count from `GamificationContext`; only render when user is authenticated
    - Render `⚠ Sync paused` chip in topbar when `serviceAvailable === false` from context
    - _Requirements: 12.3, 13.4–13.6, 16.3_

- [ ] 15. Wire GamificationProvider and RewardToastContainer into App.jsx
  - Update `frontend/src/App.jsx`
    - Import and wrap with `GamificationProvider` inside `AuthProvider` but outside `LanguageProvider` and `BrowserRouter` as per design nesting order
    - Mount `RewardToastContainer` inside `BrowserRouter` but outside `Routes`
    - Wrap `Routes` in `AnimatePresence` for page route transition animations
    - _Requirements: 1.1, 2.1–2.6, 14.7_

- [ ] 16. Add page route transition animations
  - Add Framer Motion page wrapper to each main page component (`Home`, `Profile`, `Explore`, `Listen`, `Landing`, `Signup`)
    - Each page: `initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 }`
    - Use `useMotionSafe()` to disable if `prefers-reduced-motion`
    - _Requirements: 14.7, 14.8_
  - [ ]* 16.1 Write property test: reduced-motion compliance (Property 16)
    - Mock `useReducedMotion` to return true; assert transition duration is 0 or animate equals initial state for each Framer Motion variant in this feature
    - **Property 16: Reduced-motion compliance**
    - **Validates: Requirements 14.8**
    - File: `frontend/src/utils/__tests__/motionConfig.test.js`

- [ ] 17. Wire gamification hooks into Heritage and content pages
  - [ ] 17.1 Update `frontend/src/pages/Explore.jsx`
    - Replace existing `heritage-card` elements with `AdventureStoryCard`
    - On story card click: call `context.awardXP(10, 'story_started')` (fire-and-forget) then navigate
    - _Requirements: 3.5, 3.6_
  - [ ] 17.2 Update `frontend/src/pages/Listen.jsx`
    - Mount `ReadingProgress` passing `scrollContainerRef`, `totalWords`, `storyId`, `xpReward`, and `onComplete`
    - On `onComplete`: call `context.awardXP(50, 'story_completed')`, collect session rewards, show `StoryCompletionScreen`
    - Hook audio play button: call `context.awardXP(10, 'audio_played')` on first play
    - Hook bookmark, like, share buttons with their respective XP calls and reasons per API Integration Map
    - After story completion, auto-launch quiz if one exists for the story (Requirement 6)
    - _Requirements: 4.1–4.9, 5.1, 6.1, 6.6_
  - [ ] 17.3 Wire quiz XP calls in the existing quiz component/page
    - On correct answer: call `context.awardXP(10, 'quiz_correct')` and show answer confirmation
    - On quiz completed: call `context.awardXP(30, 'quiz_completed')`
    - Display total quiz XP at quiz summary screen
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  - [ ]* 17.4 Write property test: engagement actions award XP (Property 10)
    - For each action type (bookmark, like, share, audio_played, comment); mock context; assert `awardXP` called with correct reason and a toast event emitted
    - **Property 10: Engagement actions award XP and emit toast**
    - **Validates: Requirements 4.5, 4.6, 4.7, 4.8, 4.9, 6.2, 6.3**
    - File: `frontend/src/components/Gamification/__tests__/ReadingProgress.test.jsx`

- [ ] 18. Wire gamification into Dashboard (Home page)
  - Update `frontend/src/pages/Home.jsx`
    - Call `context.refresh()` (which includes `daily-login`) on mount
    - Render `DailyStreakWidget` with `streak` and `bestStreak` from context
    - Render `LeaderboardWidget` in sidebar with entries from context
    - Render XP widget using existing `XPBar` component with `xp`/`level` from context
    - Render most recently earned badge, "Today's Challenge" story, and "Continue Reading" widget
    - Use updated translation keys for CTA copy
    - _Requirements: 9.1–9.8, 12.7, 12.8, 13.1–13.3_
  - [ ]* 18.1 Write property test: streak milestone toasts (Property 15)
    - For streak values 7, 14, 30 assert `milestone: true` emitted; for other values assert `milestone: false`
    - **Property 15: Streak milestone toasts fire at correct thresholds**
    - **Validates: Requirements 12.4, 12.5**
    - File: `frontend/src/contexts/__tests__/GamificationContext.test.jsx`

- [ ] 19. Update Profile.jsx to consume GamificationContext
  - Update `frontend/src/pages/Profile.jsx`
    - Replace direct `useGamification` calls with `useContext(GamificationContext)`
    - Call `context.refresh()` on mount
    - Render `XPBar` with `xp`/`level` from context
    - Render all badges using `BadgeCard` (locked badges greyed-out for unearned)
    - Render all collectibles using `CollectibleCard` (unobtained shown locked)
    - Render `DailyStreakWidget`, best streak, total days explored
    - Render `LeaderboardWidget`
    - Display ExplorerType with icon and accent colour
    - _Requirements: 11.1–11.6_

- [ ] 20. Update Landing.jsx and Signup.jsx with adventure copy
  - Update `frontend/src/pages/Landing.jsx` to use `adventure.signUp` translation key for Sign Up button
  - Update `frontend/src/pages/Signup.jsx` to use `adventure.signUp` translation key for the submit button
  - _Requirements: 13.2_

- [ ] 21. Implement ExplorerType story recommendations logic
  - Add a `getRecommendedStories(explorerType, allStories, completedStoryIds, count = 3)` helper function (e.g. in `frontend/src/utils/recommendations.js`)
    - Filter stories matching ExplorerType category first; exclude completed stories
    - Supplement with other categories if fewer than 3 matches; total capped at `count`
    - _Requirements: 15.1–15.5_
  - Wire into `StoryCompletionScreen` and `Home.jsx` "Today's Challenge" widget
  - [ ]* 21.1 Write property test: ExplorerType recommendations (Property 12)
    - Generate ExplorerType + story arrays; assert no conflicting categories returned unless fewer than 3 available; assert total equals min(3, available)
    - **Property 12: ExplorerType recommendations match category**
    - **Validates: Requirements 5.7, 15.1, 15.2, 15.4, 15.5**
    - File: `frontend/src/utils/__tests__/recommendations.test.js`

- [ ] 22. Validate graceful degradation and error handling
  - [ ] 22.1 Verify `serviceAvailable` flag and `⚠ Sync paused` indicator in Layout render correctly when API fails
    - Add/verify error boundary or catch logic in `GamificationContext` covers all fetch paths
    - _Requirements: 16.1, 16.3_
  - [ ]* 22.2 Write property test: raw errors never surface to users (Property 17)
    - Mock gamification API to return various 4xx/5xx responses with raw message strings; assert none appear as text content in the DOM
    - **Property 17: Raw errors never surface to users**
    - **Validates: Requirements 16.5**
    - File: `frontend/src/contexts/__tests__/GamificationContext.test.jsx`
  - [ ]* 22.3 Write property test: GamificationContext refresh after any event (Property 1)
    - For each event type assert that after successful API response `refresh` has been called
    - **Property 1: GamificationContext refresh after any event**
    - **Validates: Requirements 1.3**
    - File: `frontend/src/contexts/__tests__/GamificationContext.test.jsx`

- [ ] 23. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- All gamification API calls go through `GamificationContext` — direct `fetch` calls in pages are not permitted after this integration
- Property tests use fast-check with `numRuns: 100` minimum
- Property test files use the tag format: `// Feature: gamification-platform-integration, Property N: <property text>`
