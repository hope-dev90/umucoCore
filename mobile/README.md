# Umuco Core — Mobile (React Native / Expo)

Phase 1: **core infrastructure**, ported from the web app with nothing
removed or reinterpreted — only the platform-specific parts (routing,
storage, styling primitives) were swapped for their RN equivalents.

## What's fully ported (same logic, same API endpoints)

- `src/config/api.js` — `apiUrl`, `assetUrl`, `apiFetch`, `apiJson`, same
  `API_BASE` (`https://umucocore.onrender.com`). `localStorage` → `AsyncStorage`.
- `src/contexts/AuthContext.js` — same `login`, `register`, `googleLogin`,
  `logout`, `updateUser`, `getToken`, same `/auth/*` endpoints and token
  handling.
- `src/contexts/LanguageContext.js` — same `mapLanguageCode`, same `t()`
  lookup against `translations`, same `/api/users/profile` save call.
- `src/contexts/GamificationContext.js` — same XP/badges/collectibles/
  levels/leaderboard/streak logic, same `/api/gamification/*` endpoints.
- `src/utils/gamificationEvents.js`, `src/utils/rewardFeed.js` — copied
  unchanged (pure JS, no web APIs to begin with).
- `src/services/geminiChat.js` — same prompts, same request shape; only
  the API-key lookup source changed (`Constants.expoConfig.extra` /
  `AsyncStorage` instead of `import.meta.env` / `window` / `sessionStorage`).
- `src/translations.js` — copied byte-for-byte (pure data).
- `src/theme/colors.js` — your exact hex palette, pulled from the CSS/
  Tailwind usage across the app, centralized for reuse.
- `src/navigation/AppNavigator.js` — same route map and the same
  logged-out / logged-in / admin redirect rules as `App.jsx`'s
  `PublicRoute` / `PrivateRoute` / `AdminRoute`, translated from
  react-router to react-navigation (RN has no DOM router, so "guard
  components" become "which stack is mounted").
- `App.js` — same provider order (`Auth` → `Gamification` → `Language`),
  same `ChatWidgetGate` / `RiddlePopupGate` visibility rules.

## What's stubbed (placeholder screens — next phases)

All 19 top-level screens (`Landing`, `Login`, `GovLogin`, `Signup`, `Home`,
`Explore`, `Listen`, `Videos`, `Collections`, `Kwibuka`,
`SurvivorTestimoniesPage`, `SurvivorTestimonyView`, `IntlDays`,
`Contribute`, `Saved`, `History`, `Settings`, `Profile`, `Admin`) and 4
root components (`ChatWidget`, `RiddlePopup`, `RewardToastContainer`,
`BadgeUnlockToast`) currently render a "not yet converted" placeholder.
The plumbing (auth, navigation, API, gamification, translations) all
already works underneath them — each one just needs its real JSX and
Tailwind styling carried over to RN `View`/`Text`/`StyleSheet`.

Not yet started: the **Map** feature (`react-leaflet` → `react-native-maps`,
different API) and the **admin panel** internals — flagged in the original
scoping as the two areas needing the most rework.

## Setup

```bash
npm install
npx expo start
```

Requires the Expo Go app (or a simulator) to preview. `google-services.json`
/ `GoogleService-Info.plist` and native Google Sign-In config are not
included — that's a platform-specific step for when you build a real
binary, noted in `App.js`.
