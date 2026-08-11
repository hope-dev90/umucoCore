# WEB → MOBILE mapping

Source of truth: `frontend/` (web). Mobile rewrite lives in `mobile/` (Expo + TypeScript).

Admin (`/admin`) and gov (`/gov`) are **web-only** and omitted from mobile.

## Routes

| Web route | Mobile screen | Notes |
|---|---|---|
| `/` Landing | `LandingScreen` | Full brand landing (hero/archive/discover/community/footer) |
| `/login` | `LoginScreen` | Email/password + **Continue with Google** + forgot password |
| `/signup` | `SignupScreen` | Register + OTP + **Continue with Google** |
| `/dashboard` | `HomeScreen` (tab) | XP, streak, history, heritage highlight |
| `/explore` | `ExploreScreen` (tab) | `GET /api/heritage` + search/save |
| `/listen` | `ListenScreen` (tab) | `GET /api/audio`, `GET /api/proverbs`, expo-audio |
| `/collections` | `CollectionsScreen` (tab) | Artifacts JSON + heritage categories + save |
| `/kwibuka` | `KwibukaScreen` (More stack) | Remembrance UI |
| `/testimonies` | `TestimoniesScreen` | Local `survivorTestimony.json` |
| `/testimony/:id` | `TestimonyDetailScreen` | WebView YouTube embed |
| `/intl-days` | `IntlDaysScreen` | Ported static 2026 events |
| `/videos` | `VideosScreen` | `GET /api/video` |
| `/contribute` | `ContributeScreen` | FormData → `/api/contributions/*` |
| `/saved` | `SavedScreen` | `GET/DELETE /api/saved` |
| `/history` | `HistoryScreen` | `GET /api/history`, `/api/history/stats` |
| `/profile` | `ProfileScreen` | User + explorer type |
| `/settings` | `SettingsScreen` | Language en/rw/fr, password, logout |

## Auth

| Web | Mobile |
|---|---|
| `localStorage` key `token` | `expo-secure-store` key `token` |
| `AuthContext` login/register/profile/logout | `src/context/AuthContext.tsx` |
| OTP via `AuthPage` verify/resend | Signup step → `/auth/verify-email`, `/auth/resend-otp` |

## API base

- Web: `VITE_API_BASE` → `https://umucocore.onrender.com`
- Mobile: `EXPO_PUBLIC_API_BASE` → same

## Design tokens

From `frontend/src/styles/global.css` → `mobile/src/theme/colors.ts`:

- primary `#8D493A`, primaryDark `#3E2723`, primarySoft `#FCDFD3`
- bgMain `#FDFBF7`, bgCard `#FFFFFF`
- textPrimary `#2C1A14`, textSecondary `#6F5B55`, textMuted `#8A7B73`
- border `#EADBC8`

## Navigation shape

```
AuthStack: Welcome → Login / Signup(OTP)
MainTabs:
  Home | Explore | Listen | Collections | More
MoreStack:
  MoreHome, Kwibuka, Testimonies, TestimonyDetail,
  IntlDays, Videos, Contribute, Saved, History, Profile, Settings
```

## Data copied locally

- `frontend/src/data/survivorTestimony.json` → `mobile/src/data/survivorTestimony.json`
- `frontend/src/data/artifacts.json` → `mobile/src/data/artifacts.json` (collections grid)
- Intl day events adapted into `mobile/src/data/intlEvents.ts`
