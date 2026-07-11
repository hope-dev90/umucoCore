# Design Document: Gamification Platform Integration

## Overview

This design wires the existing `/api/gamification/*` backend endpoints into every meaningful user interaction on the Umuco platform and surfaces rewards through animated components built with Framer Motion. The approach is additive — no existing page logic is removed, only extended. All state is centralised in a new `GamificationContext` that wraps `useGamification` and is inserted once in `App.jsx` below `AuthProvider`. UI feedback is delivered through a portal-based `RewardToastContainer` that lives outside the page tree.

The six-month reading experience is modelled as an "adventure" and the UI copy is updated accordingly throughout the sidebar and public-facing pages.

---

## Architecture

### High-level data flow

```
User Action (click, scroll, audio play, ...)
    │
    ▼
Page / Component calls gamificationContext.awardXP / awardBadge / ...
    │
    ▼
GamificationContext dispatches API call (fire-and-forget, non-blocking)
    │           │
    │           ▼
    │       Gamification_Service responds
    │           │
    │           ├─► state updated (xp, level, badges, ...)
    │           │
    │           └─► event emitted on internal eventBus
    │                       │
    │                       ▼
    │               RewardToastContainer subscribes, enqueues toast
    │
    ▼
Primary user action completes regardless (graceful degradation)
```

### Event Bus pattern

A lightweight pub/sub module (`src/utils/gamificationEvents.js`) decouples reward emissions from the component tree. Context methods emit events after API responses; any component can subscribe without prop drilling.

```js
// src/utils/gamificationEvents.js
const listeners = {};
export const gamificationEvents = {
  emit:  (type, payload) => (listeners[type] || []).forEach(fn => fn(payload)),
  on:    (type, fn) => { listeners[type] = [...(listeners[type] || []), fn]; },
  off:   (type, fn) => { listeners[type] = (listeners[type] || []).filter(f => f !== fn); },
};
// Event types: 'xp', 'levelUp', 'badge', 'collectible', 'streak'
```

### Provider nesting in App.jsx

```
GoogleOAuthProvider
  AuthProvider
    GamificationProvider        ← NEW
      LanguageProvider
        BrowserRouter
          RewardToastContainer  ← NEW (portal, always mounted)
          Routes ...
```

`GamificationProvider` does not render until `user` is available from `AuthContext`, so all API calls are gated on authentication.


---

## Components and Interfaces

### New files to create

```
frontend/src/
├── contexts/
│   └── GamificationContext.jsx          # replaces direct useGamification calls
├── utils/
│   └── gamificationEvents.js            # event bus
├── components/
│   └── Gamification/
│       ├── RewardToastContainer.jsx      # portal wrapper, manages queue
│       ├── RewardToast.jsx               # single animated toast
│       ├── BadgePopup.jsx                # full-screen badge unlock popup
│       ├── CollectiblePopup.jsx          # full-screen collectible popup
│       ├── StoryCompletionScreen.jsx     # post-reading overlay
│       ├── AdventureStoryCard.jsx        # story card with XP/difficulty/lock
│       ├── ReadingProgress.jsx           # sticky progress bar for story pages
│       ├── DailyStreakWidget.jsx          # streak + best streak display
│       └── LeaderboardWidget.jsx         # top-10 ranked list
└── pages/
    └── (no new pages; existing pages modified)
```

### Existing files to modify

| File | Change |
|---|---|
| `frontend/src/App.jsx` | Add `GamificationProvider`, `RewardToastContainer` |
| `frontend/src/components/Gamification/XPBar.jsx` | Replace CSS transition with Framer Motion `motion.div` |
| `frontend/src/components/Gamification/BadgeCard.jsx` | Add `motion.div` hover lift |
| `frontend/src/components/Gamification/CollectibleCard.jsx` | Add `motion.div` hover lift |
| `frontend/src/components/Layout.jsx` | Add streak indicator in topbar; update adventure nav labels |
| `frontend/src/pages/Home.jsx` | Add `DailyStreakWidget`, `LeaderboardWidget`, daily-login call |
| `frontend/src/pages/Profile.jsx` | Consume `GamificationContext` instead of `useGamification` directly; add `LeaderboardWidget` |
| `frontend/src/pages/Listen.jsx` | Add `ReadingProgress`, audio XP hooks, `StoryCompletionScreen` |
| `frontend/src/pages/Explore.jsx` | Replace `heritage-card` with `AdventureStoryCard` |
| `frontend/src/pages/Landing.jsx` | Update "Sign Up" → "Begin Your Journey" |
| `frontend/src/pages/Signup.jsx` | Update button copy |
| `frontend/src/translations.js` | Add adventure language keys for both `en` and `rw` |
| `frontend/src/components/Gamification/Gamification.css` | Add rarity colour tokens, popup overlay styles |

---

### GamificationContext

**File:** `frontend/src/contexts/GamificationContext.jsx`

Wraps `useGamification` and adds:
- `streak` and `bestStreak` fields (fetched from `/api/gamification/xp` response or `daily-login`)
- A `dispatchReward(type, payload)` helper that calls the API **and** emits the event
- Calls `dailyLogin()` once after the user first authenticates (guards with `localStorage` key `lastLoginDate`)

```jsx
// Props exposed on context value:
{
  xp,          // number  — from user.xp
  level,       // number  — from user.level
  streak,      // number  — current daily streak
  bestStreak,  // number
  badges,      // Badge[]
  userBadges,  // UserBadge[]
  collectibles,    // Collectible[]
  userCollectibles,// UserCollectible[]
  leaderboard, // LeaderboardEntry[]
  loading,     // boolean
  serviceAvailable, // boolean — false when last API call failed
  refresh,     // () => Promise<void>
  awardXP,     // (amount: number, reason: string) => Promise<AwardXPResult>
  awardBadge,  // (badgeId: string) => Promise<void>
  awardCollectible, // (collectibleId: string) => Promise<void>
  getCurrentLevelData, // () => LevelData
  getNextLevelData,    // () => LevelData
}
```

The `dispatchReward` logic inside the context after each successful API call:
```js
// After awardXP response:
gamificationEvents.emit('xp', { amount, newXP: user.xp, newLevel: user.level, prevLevel });
if (newLevel > prevLevel) gamificationEvents.emit('levelUp', { level: newLevel });

// After awardBadge response:
gamificationEvents.emit('badge', { badge });

// After awardCollectible response:
gamificationEvents.emit('collectible', { collectible });

// After dailyLogin response with new streak:
gamificationEvents.emit('streak', { streak, isNew: true });
```


### RewardToastContainer + RewardToast

**File:** `frontend/src/components/Gamification/RewardToastContainer.jsx`

Renders via `ReactDOM.createPortal` into `document.body`. Subscribes to all `gamificationEvents` on mount. Maintains a `queue` array in state. Each toast auto-removes after 3 seconds. Stack position: `fixed bottom-6 right-6 flex flex-col gap-2 z-[200]`.

**Toast type discriminator:**
```js
// queue item shape:
{ id, type: 'xp' | 'levelUp' | 'badge' | 'collectible' | 'streak', payload, createdAt }
```

**File:** `frontend/src/components/Gamification/RewardToast.jsx`

Props: `{ toast, onRemove }`

Framer Motion variants:
```js
const variants = {
  initial: { opacity: 0, x: 80, scale: 0.8 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 28 } },
  exit:    { opacity: 0, x: 80, scale: 0.8, transition: { duration: 0.2 } },
};
```

Visual content per type:
- `xp`: amber background `#FEF3C7`, text `+{amount} XP ✨`
- `levelUp`: brand background `var(--primary)`, white text `⬆ Level {level} Unlocked!`, scale pulse on entrance
- `badge`: white card with badge icon + name + rarity badge chip
- `collectible`: same as badge with rarity glow border
- `streak`: orange flame gradient, `🔥 {streak}-Day Streak!`

Respects `prefers-reduced-motion`: when true, variants collapse to `{ opacity: 0 }` → `{ opacity: 1 }` only.

---

### BadgePopup

**File:** `frontend/src/components/Gamification/BadgePopup.jsx`

Props: `{ badge, onDismiss }`

Full-screen overlay (`fixed inset-0 z-[300] flex items-center justify-center`). Backdrop: `rgba(44,26,20,0.6)` with `backdropFilter: blur(8px)`.

Card: `max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl`

Framer Motion entrance:
```js
card: { initial: { scale: 0.4, rotate: -15, opacity: 0 }, animate: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } } }
icon: { initial: { scale: 0 }, animate: { scale: [0, 1.3, 1], transition: { times: [0, 0.6, 1], duration: 0.5 } } }
```

Displays: icon (4rem), name, description, rarity chip with colour from `RARITY_COLOURS`. Dismiss on backdrop click or Escape key.

---

### CollectiblePopup

**File:** `frontend/src/components/Gamification/CollectiblePopup.jsx`

Same structure as `BadgePopup`. Additional glow effect on the collectible icon using `box-shadow` keyed to rarity:

```js
const RARITY_GLOW = {
  common:    '0 0 20px rgba(156,163,175,0.6)',   // grey
  uncommon:  '0 0 20px rgba(16,185,129,0.6)',    // green
  rare:      '0 0 20px rgba(59,130,246,0.6)',    // blue
  epic:      '0 0 20px rgba(139,92,246,0.6)',    // purple
  legendary: '0 0 30px rgba(245,158,11,0.8)',    // gold
};
```

Framer Motion entrance:
```js
{ initial: { scale: 0, opacity: 0 }, animate: { scale: [0, 1.2, 1], opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } }
```

---

### AdventureStoryCard

**File:** `frontend/src/components/Gamification/AdventureStoryCard.jsx`

Props:
```js
{
  story: {
    id, title, description, image_url, category,
    readingTimeMinutes, difficulty,    // 'easy'|'medium'|'hard'
    xpReward, isCompleted, isLocked,
    prerequisiteIds
  },
  onClick: (story) => void
}
```

Framer Motion hover:
```js
whileHover={prefersReducedMotion ? {} : { y: -4, boxShadow: 'var(--shadow-lg)' }}
transition={{ type: 'spring', stiffness: 300, damping: 24 }}
```

Renders:
- Cover image with category chip top-left
- `isCompleted` → green `✓` checkmark overlay (top-right)
- `isLocked` → greyscale filter + lock icon overlay, click disabled
- Bottom bar: reading time estimate, difficulty dots (●●○ medium), `+{xpReward} XP` chip in amber
- CTA button text: "Embark on Adventure" (unlocked) / "Locked" (locked) / "Re-read" (completed)

---

### ReadingProgress

**File:** `frontend/src/components/Gamification/ReadingProgress.jsx`

Props: `{ totalWords, scrollContainerRef, storyId, xpReward }`

Sticky bar at top of story content (`position: sticky; top: 0; z-index: 50`).

Tracks scroll position of `scrollContainerRef` to calculate `percentComplete = scrollTop / (scrollHeight - clientHeight) * 100`.

Framer Motion progress fill:
```js
<motion.div animate={{ width: `${percentComplete}%` }} transition={{ duration: 0.3, ease: 'linear' }} />
```

Internal `useRef` tracks which milestones (25, 50, 75) have already been awarded to prevent duplicate calls.

Shows: progress %, estimated remaining time (`Math.round((1 - percentComplete/100) * totalWords / 200)` min), and `+{xpReward} XP on completion`.

When `percentComplete >= 100`: emits `onComplete()` callback to parent.

---

### DailyStreakWidget

**File:** `frontend/src/components/Gamification/DailyStreakWidget.jsx`

Props: `{ streak, bestStreak }` (consumed from `GamificationContext`).

Compact card with flame icon, current streak (large number), best streak. Used in Home sidebar and Profile.

Framer Motion: flame icon pulses with `animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}` unless `prefers-reduced-motion`.

---

### LeaderboardWidget

**File:** `frontend/src/components/Gamification/LeaderboardWidget.jsx`

Props: `{ entries, currentUserId, limit = 10 }`

Renders a ranked list table. Current user row styled with `background: var(--primary-soft); border-left: 3px solid var(--primary)`.

Each row: rank badge (🥇🥈🥉 for top 3, then number), avatar initial circle, name, explorer type icon, level pill, XP total.

---

### StoryCompletionScreen

**File:** `frontend/src/components/Gamification/StoryCompletionScreen.jsx`

Props:
```js
{
  sessionXP,           // number — total XP earned this reading session
  newBadges,           // Badge[] — badges earned during session
  newCollectibles,     // Collectible[] — collectibles earned during session
  recommendedStories,  // Story[] — 3 next stories
  onDismiss            // () => void
}
```

Full-screen overlay. Three sections stacked vertically:

1. XP counter: Framer Motion count-up from 0 to `sessionXP` using `useMotionValue` + `useTransform`
2. Level progress bar: Framer Motion width animation
3. Rewards row: badges + collectibles with entrance animations (`staggerChildren: 0.1`)
4. Recommended stories row: 3 `AdventureStoryCard` components
5. "Continue Adventure" button

Entrance animation for the entire overlay:
```js
{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } } }
```


---

## Data Models

### Existing (from backend, unchanged)

```js
// User (from AuthContext)
{ id, name, email, xp, level, currentStreak, bestStreak, explorerType, profileImage }

// Badge
{ id, name, description, icon, rarity: 'common'|'rare'|'epic'|'legendary', category }

// UserBadge (join with earned timestamp)
{ id, name, icon, rarity, unlockedAt: ISO8601 | null }

// Collectible
{ id, name, description, icon, rarity: 'common'|'uncommon'|'rare'|'epic'|'legendary' }

// UserCollectible
{ id, name, icon, rarity, obtainedAt: ISO8601 | null }

// LeaderboardEntry
{ userId, name, xp, level, explorerType, rank }

// LevelData
{ level, requiredXP, title, description }
```

### New (frontend-only)

```js
// Story (mapped from heritage API response)
{
  id: string,
  title: string,
  description: string,
  image_url: string,
  category: string,             // 'warrior'|'nature'|'royal'|'folklore'|'music'
  readingTimeMinutes: number,   // derived: Math.ceil(wordCount / 200)
  wordCount: number,
  difficulty: 'easy'|'medium'|'hard',
  xpReward: number,             // configured per story or default 50
  isCompleted: boolean,         // derived from user's reading history
  isLocked: boolean,            // derived from prerequisiteIds check
  prerequisiteIds: string[],
}

// ToastQueueItem
{
  id: string,           // uuid
  type: 'xp'|'levelUp'|'badge'|'collectible'|'streak',
  payload: object,
  createdAt: number,    // Date.now()
}

// ReadingSession (in-memory only, not persisted)
{
  storyId: string,
  startedAt: number,
  earnedXP: number,
  earnedBadges: Badge[],
  earnedCollectibles: Collectible[],
  milestonesHit: Set<25|50|75|100>,
}
```

### RARITY_COLOURS constant (shared)

```js
// frontend/src/components/Gamification/Gamification.css additions
// Also exported as a JS constant from Gamification.css or a shared constants file

export const RARITY_COLOURS = {
  common:    { text: '#6B7280', bg: '#F3F4F6' },    // grey
  uncommon:  { text: '#059669', bg: '#D1FAE5' },    // green
  rare:      { text: '#2563EB', bg: '#DBEAFE' },    // blue
  epic:      { text: '#7C3AED', bg: '#EDE9FE' },    // purple
  legendary: { text: '#D97706', bg: '#FEF3C7' },    // gold
};
```

---

## API Integration Map

All calls go through `GamificationContext` methods. Direct `fetch` calls in pages are forbidden after this integration.

| User Action | API Endpoint | XP Reason | Other |
|---|---|---|---|
| User logs in / app mounts | `POST /api/gamification/daily-login` | — | Returns streak; call once per calendar day |
| Story click (unlocked) | `POST /api/gamification/award-xp` | `"story_started"` | 10 XP |
| Reading 25% milestone | `POST /api/gamification/award-xp` | `"reading_progress_25"` | 15 XP |
| Reading 50% milestone | `POST /api/gamification/award-xp` | `"reading_progress_50"` | 20 XP |
| Reading 75% milestone | `POST /api/gamification/award-xp` | `"reading_progress_75"` | 25 XP |
| Story completed (100%) | `POST /api/gamification/award-xp` | `"story_completed"` | 50 XP; then check badges |
| User bookmarks story | `POST /api/gamification/award-xp` | `"bookmark"` | 5 XP |
| User likes story | `POST /api/gamification/award-xp` | `"like"` | 5 XP |
| User shares story | `POST /api/gamification/award-xp` | `"share"` | 10 XP |
| User plays audio | `POST /api/gamification/award-xp` | `"audio_played"` | 10 XP |
| User submits comment | `POST /api/gamification/award-xp` | `"comment"` | 15 XP |
| Quiz correct answer | `POST /api/gamification/award-xp` | `"quiz_correct"` | 10 XP each |
| Quiz completed | `POST /api/gamification/award-xp` | `"quiz_completed"` | 30 XP |
| Badge trigger | `POST /api/gamification/award-badge` | — | `{ badgeId }` |
| Collectible trigger | `POST /api/gamification/award-collectible` | — | `{ collectibleId }` |
| Profile / Dashboard mount | `GET /api/gamification/xp` + `GET /api/gamification/my-badges` + `GET /api/gamification/my-collectibles` + `GET /api/gamification/leaderboard` | — | `refresh()` |

### Error handling contract

Every API call is wrapped in a `try/catch`. On failure:
- Log error to console (never display raw message to user)
- Set `serviceAvailable = false` on `GamificationContext`
- Primary user action continues (navigation, audio, etc.)
- Pending XP awards are stored in `localStorage` under `pendingXPAwards: [{amount, reason, storyId, timestamp}]`
- On next successful API call, drain the queue

Layout topbar shows a subtle `⚠ Sync paused` chip (not a modal) when `serviceAvailable === false`.


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: GamificationContext refresh after any event

*For any* gamification event type (XP award, badge award, collectible award), after the corresponding context method resolves successfully, the `refresh` function should have been called and the returned state should reflect the server's updated values.

**Validates: Requirements 1.3**

---

### Property 2: Error state preservation

*For any* current GamificationContext state snapshot, if the next API call returns a non-2xx response, the state values (xp, level, badges, collectibles, streak) should remain identical to their pre-call values.

**Validates: Requirements 1.4, 16.2**

---

### Property 3: Reward toast content completeness

*For any* reward event payload (xp amount, level number, badge object, collectible object, or streak count), the rendered `RewardToast` should contain a string representation of the reward's primary identifier — the XP amount for XP events, the level number for level-up events, the item name for badge/collectible events, and the streak count for streak events.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

---

### Property 4: Toast queue isolation on API failure

*For any* XP award action where the Gamification_Service returns an error, the `RewardToastContainer` queue length should be unchanged after the failed call compared to before it.

**Validates: Requirements 2.7**

---

### Property 5: Toast stack without overlap

*For any* N simultaneous toast events (N ≥ 2), all N toasts should be present in the DOM with distinct `top` positions such that no two toasts share the same vertical offset.

**Validates: Requirements 2.6**

---

### Property 6: AdventureStoryCard renders all required fields

*For any* story object with valid id, title, readingTimeMinutes, category, difficulty, and xpReward, the rendered `AdventureStoryCard` HTML should contain the title, reading time value, category value, and XP reward value as text content.

**Validates: Requirements 3.1**

---

### Property 7: Navigation always completes regardless of gamification availability

*For any* story, if `awardXP` throws an error when clicked, the `onClick` callback should still invoke the navigation handler exactly once.

**Validates: Requirements 3.6, 16.1, 16.2**

---

### Property 8: Reading progress accuracy

*For any* `totalWords` value and any scroll completion fraction `f` between 0 and 1, the `ReadingProgress` component should display a percentage equal to `Math.round(f * 100)` and an estimated remaining time of `Math.ceil((1 - f) * totalWords / 200)` minutes.

**Validates: Requirements 4.1, 4.2**

---

### Property 9: Milestone XP awards fire exactly once

*For any* story session, each progress milestone (25%, 50%, 75%) should trigger the `awardXP` API call exactly once per session, even if the scroll position crosses the threshold multiple times (e.g. user scrolls back and forward).

**Validates: Requirements 4.4**

---

### Property 10: Engagement actions award XP and emit toast

*For any* engagement action type (bookmark, like, share, audio play, comment, quiz correct, quiz completed), calling the action handler should: (a) call `awardXP` with the correct reason string, and (b) result in a toast event being emitted on the `gamificationEvents` bus.

**Validates: Requirements 4.5, 4.6, 4.7, 4.8, 4.9, 6.2, 6.3**

---

### Property 11: Completion screen session rewards completeness

*For any* reading session that produces a non-empty set of earned badges and collectibles, the `StoryCompletionScreen` should render a DOM element containing the name of every badge and every collectible earned during that session.

**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

---

### Property 12: ExplorerType recommendations match category

*For any* ExplorerType and a collection of available stories, the recommended stories array should contain no stories whose category conflicts with the user's ExplorerType mapping — unless fewer than 3 matching stories exist, in which case the fallback stories from other categories should make the total count equal to 3 (or the total available story count if fewer than 3 exist overall).

**Validates: Requirements 5.7, 15.1, 15.2, 15.4, 15.5**

---

### Property 13: Reward popup renders required fields for its reward type

*For any* badge object passed to `BadgePopup`, the rendered HTML should contain the badge icon, name, description, and rarity label. *For any* collectible object passed to `CollectiblePopup`, the rendered HTML should contain the collectible icon, name, description, and rarity colour indicator matching `RARITY_COLOURS`.

**Validates: Requirements 7.2, 7.4, 8.2**

---

### Property 14: Leaderboard correctness

*For any* array of `LeaderboardEntry` objects, `LeaderboardWidget` should render them in descending XP order, and each rendered row should contain the user's rank, name, XP total, and level. The row corresponding to `currentUserId` should have a visually distinct class applied.

**Validates: Requirements 10.1, 10.2, 10.3**

---

### Property 15: Streak milestone toasts fire at correct thresholds

*For any* streak count value that equals 7, 14, or 30, the `daily-login` response handler should emit a `streak` event with `milestone: true`. For streak counts not equal to these values, `milestone` should be false.

**Validates: Requirements 12.4, 12.5**

---

### Property 16: Reduced-motion compliance

*For any* Framer Motion `variants` object used in this feature, when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true, the `transition.duration` of all animated variants should be set to 0 or the `animate` target should equal the `initial` state (no visible movement).

**Validates: Requirements 14.8**

---

### Property 17: Raw errors never surface to users

*For any* API error response from the Gamification_Service, the text content rendered to the DOM should not contain the raw HTTP status code, error stack trace, or backend error message string.

**Validates: Requirements 16.5**


---

## Error Handling

### Hierarchy of concerns

1. **Primary action first** — navigation, audio playback, and content rendering always happen before any gamification side-effect is awaited.
2. **Fire-and-forget XP awards** — `awardXP` calls are `async` but callers do not `await` them unless they need the XP delta for UI (e.g., `StoryCompletionScreen`). They use `.catch(console.error)`.
3. **Pending queue** — failed XP awards are appended to `localStorage.pendingXPAwards`. On the next successful API response, `GamificationContext` drains this queue (max 20 entries to prevent unbounded growth, oldest dropped first).
4. **Service availability flag** — `serviceAvailable` is set to `false` on the first failure and back to `true` on the first success. The Layout topbar renders `⚠ Sync paused` only when `false`.
5. **State preservation** — on any failed fetch, existing context state is never cleared (requirement 1.4).
6. **No raw errors** — all catch blocks log to `console.error` and show only friendly copy or nothing to the user.

### Specific error scenarios

| Scenario | Behaviour |
|---|---|
| `daily-login` fails on app mount | Streak stays at last known value; no toast |
| `award-xp` fails mid-reading | XP stored in pending queue; progress bar continues |
| `award-badge` fails | Badge popup not shown; silently retried from queue |
| Leaderboard fetch fails | Widget renders last cached data with a subtle "data may be stale" footnote |
| Story navigation while API unavailable | Navigate immediately; XP award queued for retry |

---

## Adventure Language Copy Map

These keys are added to `translations.js` for both `en` and `rw`.

| Old text | New key | `en` value | `rw` value |
|---|---|---|---|
| "Read Story" | `adventure.readStory` | "Embark on Adventure" | "Tangira Urugendo" |
| "Sign Up" | `adventure.signUp` | "Begin Your Journey" | "Tangira Inzira Yawe" |
| "Explore" (section title) | `adventure.explore` | "Discover Quests" | "Shakisha Inzira" |
| "Dashboard" (nav label) | `sidebar.home` *(update existing)* | "Adventure Hub" | "Ahabanza h'Urugendo" |
| "History" (nav label) | `sidebar.history` *(update existing)* | "Chronicles" | "Inkuru z'Amateka" |
| "Saved" (nav label) | `sidebar.saved` *(update existing)* | "My Scrolls" | "Ibandiko Byange" |
| "Explore Now" (home CTA) | `home.exploreNow` *(update existing)* | "Begin Quest" | "Tangira Inzira" |
| "Continue Exploring" | `home.continueExploring` *(update existing)* | "Continue Your Adventure" | "Komeza Urugendo Rwawe" |
| "Today's Highlight" | `home.todayHighlight` *(update existing)* | "Today's Quest" | "Urugendo rw'Uyu Munsi" |
| XP widget label | `adventure.xpLabel` | "Adventure XP" | "XP y'Urugendo" |
| Streak label | `adventure.streakLabel` | "Day Streak 🔥" | "Inshuro Zikurikirana 🔥" |

The `sidebar.home`, `sidebar.history`, and `sidebar.saved` keys are updated in place in the existing translations file. All other navigation functionality and routing is unchanged.

---

## Framer Motion Animation Specs

Add `framer-motion` as a dependency: `npm install framer-motion@^11`.

### Shared motion utilities

```js
// frontend/src/utils/motionConfig.js
import { useReducedMotion } from 'framer-motion';

export function useMotionSafe() {
  const prefersReduced = useReducedMotion();
  return (variants) => prefersReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : variants;
}
```

### Animation catalogue

| Element | Type | Spec |
|---|---|---|
| `XPBar` fill | Width transition | `animate={{ width: '${pct}%' }} transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}` |
| XP count-up | Counter | `useMotionValue(0)` → `animate(target, { duration: 1.5, ease: 'easeOut' })` |
| `BadgePopup` card | Spring scale+rotate | `initial: { scale: 0.4, rotate: -15 }, animate: { scale: 1, rotate: 0 }, spring stiffness 300` |
| `BadgePopup` icon | Bounce scale | `animate: { scale: [0, 1.3, 1] }, duration 0.5` |
| `CollectiblePopup` card | Scale + glow | `initial: { scale: 0 }, animate: { scale: [0, 1.2, 1] }, duration 0.5` |
| `RewardToast` enter | Spring slide | `initial: { x: 80, opacity: 0, scale: 0.8 }, animate spring stiffness 400` |
| `RewardToast` exit | Slide out right | `exit: { x: 80, opacity: 0 }, duration 0.2` |
| Level-up toast | Pulse glow | `animate: { scale: [1, 1.05, 1] }, repeat 2, duration 0.3` |
| `AdventureStoryCard` hover | Lift + shadow | `whileHover: { y: -4, boxShadow: var(--shadow-lg) }, spring stiffness 300` |
| `StoryCompletionScreen` | Fade+scale | `initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, duration 0.4` |
| `DailyStreakWidget` flame | Pulse loop | `animate: { scale: [1, 1.15, 1] }, repeat: Infinity, duration 2` |
| Reward items in completion screen | Stagger | `staggerChildren: 0.1, delayChildren: 0.3` |
| Page route transitions | Fade | Wrap `<Routes>` in `<AnimatePresence>`, each page `initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, duration 0.25` |
| `ReadingProgress` bar | Linear width | `animate={{ width: '${pct}%' }} transition={{ duration: 0.3, ease: 'linear' }}` |
| `BadgeCard` hover | Lift | `whileHover: { y: -2, boxShadow: var(--shadow-md) }` |

All animations check `useReducedMotion()` and collapse to opacity-only if true.

---

## Testing Strategy

### Dual approach

Unit tests cover specific examples, integration points, and edge cases. Property-based tests verify universal correctness across many generated inputs. Both are required — unit tests catch concrete regressions, property tests verify general correctness that examples might miss.

### Unit tests (Vitest + React Testing Library)

Focus areas:
- `GamificationContext`: mount with mocked `fetch`, verify `daily-login` called on login, verify state preserved on error
- `RewardToastContainer`: simulate event bus emissions, verify toasts appear and auto-remove after 3s
- `BadgePopup` / `CollectiblePopup`: snapshot + Escape key dismiss test
- `StoryCompletionScreen`: verify session rewards appear, verify `onDismiss` calls `context.refresh`
- `AdventureStoryCard`: locked state disables click, completed state shows checkmark
- Navigation adventure copy: verify sidebar labels match expected strings
- `ReadingProgress`: verify 200 wpm calculation for given word counts

Keep unit tests focused on concrete examples and edge cases. Don't duplicate what property tests cover.

### Property-based tests (fast-check, minimum 100 runs each)

Each property test references its design property by tag comment.

```js
// Tag format: Feature: gamification-platform-integration, Property N: <property text>
```

**Configured minimum iterations: 100 per test** (fast-check default is 100; explicit `numRuns: 100`).

Property tests to implement:

| Test | fast-check arbitraries | Design Property |
|---|---|---|
| Context state preserved on error | `fc.record({ xp: fc.nat(), level: fc.integer(1,50), ... })` | Property 2 |
| Toast content completeness | `fc.oneof(xpArb, levelArb, badgeArb, collectibleArb, streakArb)` | Property 3 |
| Toast isolation on failure | `fc.nat()` for XP amount with mocked failure | Property 4 |
| Story card fields present | `fc.record({ title: fc.string(), xpReward: fc.nat(), ... })` | Property 6 |
| Navigation despite API failure | `fc.record(storyShape)` with fetch mock throwing | Property 7 |
| Reading progress accuracy | `fc.float(0,1)` for scroll fraction, `fc.nat(100, 50000)` for word count | Property 8 |
| Milestone XP fires exactly once | `fc.array(fc.float(0,1), { minLength: 10 })` for scroll sequence | Property 9 |
| Engagement actions award XP | `fc.constantFrom('bookmark','like','share','audio_played','comment')` | Property 10 |
| Completion screen rewards | `fc.array(badgeArb, { minLength: 1 })`, `fc.array(collectibleArb)` | Property 11 |
| Recommendations by explorer type | `fc.constantFrom('warrior','nature','royal','folktale','music')`, story array | Property 12 |
| Popup renders required fields | `fc.record(badgeShape)`, `fc.record(collectibleShape)` | Property 13 |
| Leaderboard order and fields | `fc.array(leaderboardEntryArb, { minLength: 2, maxLength: 10 })` | Property 14 |
| Streak milestone thresholds | `fc.constantFrom(7, 14, 30)` vs `fc.integer(1, 100).filter(n => ![7,14,30].includes(n))` | Property 15 |
| Raw errors not in DOM | `fc.record({ status: fc.integer(400,599), message: fc.string() })` | Property 17 |

### Test file locations

```
frontend/src/
├── contexts/__tests__/GamificationContext.test.jsx
├── components/Gamification/__tests__/
│   ├── RewardToast.test.jsx
│   ├── BadgePopup.test.jsx
│   ├── CollectiblePopup.test.jsx
│   ├── AdventureStoryCard.test.jsx
│   ├── StoryCompletionScreen.test.jsx
│   ├── LeaderboardWidget.test.jsx
│   ├── DailyStreakWidget.test.jsx
│   └── ReadingProgress.test.jsx
└── utils/__tests__/gamificationEvents.test.js
```

