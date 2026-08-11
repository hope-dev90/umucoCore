# Umuco Core Mobile

React Native (Expo + TypeScript) rewrite of the web app in `/frontend`.

**Source of truth:** `/frontend`  
**Backend:** `https://umucocore.onrender.com` (unchanged)  
**Web app:** `/frontend` (unchanged)

See [MAPPING.md](./MAPPING.md) for WEB → MOBILE screen mapping.

## Features (parity with web product)

| Area | Mobile |
|------|--------|
| Auth | Welcome, Login, Signup + email OTP |
| Home | XP / level / streak, quick links, heritage highlight, recent history, daily login |
| Explore | Heritage list, search, save |
| Listen | Audio playback (expo-audio), proverbs, save |
| Collections | Artifacts + heritage categories, save |
| Kwibuka | Remembrance hub → survivor testimonies + in-app YouTube |
| Videos | Video library |
| Intl Days | National remembrance calendar |
| Contribute | Oral history + photo/audio/video uploads |
| Saved / History | Full library + stats |
| Profile / Settings | Explorer type, language en/rw/fr, password, logout |

Admin (`/admin`) and gov login stay **web-only**.

## Run

```bash
cd mobile
npm install
npx expo start
```

Android emulator (with Expo Go installed):

```bash
export ANDROID_HOME=$HOME/Android/Sdk
npx expo start --android
# or open: adb shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8081"
```

## Env

```env
EXPO_PUBLIC_API_BASE=https://umucocore.onrender.com
```

## Structure

```
mobile/
├── App.tsx
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── theme/
│   ├── types/
│   └── utils/
└── MAPPING.md
```
