# WEB → MOBILE feature inventory & mapping

**Source of truth:** `/frontend` (READ ONLY)  
**Target:** `/mobile` — Expo + React Native + TypeScript rewrite  
**Rule:** migrate existing product features only.

Admin (`/admin`) and gov (`/gov`) remain **web-only**.

---

## Languages

| Code | Label |
|------|--------|
| `en` | English (UK) |
| `rw` | Kinyarwanda |
| `fr` | French (France) |

Catalogs: `mobile/src/translations/{en,rw,fr}.json` (from `frontend/src/translations.js`).

---

## Route / screen map

| Web route | Mobile screen | Status |
|-----------|---------------|--------|
| `/` Landing | `LandingScreen` | Done |
| `/login` | `LoginScreen` | Done (email + Google + forgot) |
| `/signup` | `SignupScreen` | Done (register + OTP + Google) |
| `/gov` | — | Web-only |
| `/dashboard` | `HomeScreen` | Done (quest strip, explorer picker, highlight, history) |
| `/explore` | `ExploreScreen` | Done (list + map + stories fallback) |
| `/listen` | `ListenScreen` | Done |
| `/videos` | `VideosScreen` | Done |
| `/collections` | `CollectionsScreen` | Done (museum gallery modal) |
| `/kwibuka` | `KwibukaScreen` | Done |
| `/testimonies` | `TestimoniesScreen` | Done |
| `/testimony/:id` | `TestimonyDetailScreen` | Done |
| `/intl-days` | `IntlDaysScreen` | Done |
| `/contribute` | `ContributeScreen` | Done |
| `/saved` | `SavedScreen` | Done |
| `/history` | `HistoryScreen` | Done |
| `/profile` | `ProfileScreen` | Done (avatar, badges catalog, edit) |
| `/settings` | `SettingsScreen` | Done (lang, notifs, a11y, password, sessions, export, deactivate, delete) |
| `/admin` | — | Web-only |

### Global overlays

| Web | Mobile | Status |
|-----|--------|--------|
| `ChatWidget` | `ChatWidget.tsx` | Done |
| `RiddlePopup` | `RiddlePopup.tsx` | Done |
| Reward toasts | `RewardToastContainer` + `GamificationContext` | Done |

---

## Final parity checklist

- [x] Landing page (+ language selector EN/RW/FR)
- [x] Navigation (tabs + More stack)
- [x] Authentication (login / signup / OTP / Google / logout)
- [x] Protected auth gate
- [x] Language selection + persistence + profile sync
- [x] Translation catalogs for all 3 languages
- [x] Dashboard Home (not marketing hero)
- [x] Explore list + map
- [x] Listen / Videos / Collections / Museum gallery
- [x] Kwibuka + testimonies
- [x] Intl days / Contribute / Saved / History
- [x] Profile (avatar upload via ImagePicker, badges catalog, XP)
- [x] Settings (notifications, accessibility, sessions, export, deactivate, delete)
- [x] Gamification (daily login, award XP, toasts, riddles)
- [x] Chat / AI assistant overlay
- [x] Design tokens from web
- [x] No web DOM / HTML / react-router in `/mobile`
- [x] Admin /gov intentionally web-only

---

## API base

`EXPO_PUBLIC_API_BASE` → `https://umucocore.onrender.com`  
Optional: `EXPO_PUBLIC_GEMINI_API_KEY`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

---

## Navigation

```
AuthStack: Landing → Login / Signup
MainTabs: Home | Explore | Listen | Collections | More
MoreStack: Kwibuka, Testimonies, IntlDays, Videos, Contribute,
           Saved, History, Profile, Settings
Overlays: ChatWidget, RiddlePopup, RewardToastContainer
```
