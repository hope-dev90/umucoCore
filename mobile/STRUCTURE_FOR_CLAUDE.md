# Mobile App Structure - Detailed Overview for Claude

## Project Overview
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **State Management**: React Context API
- **Backend API**: https://umucocore.onrender.com

---

## Directory Structure

```
mobile/
├── App.tsx                          # Root component with providers
├── assets/                          # Images, icons, splash screens
│   ├── auth/                        # Authentication screen assets
│   ├── icons/                       # App icons
│   └── landing/                     # Landing page assets
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── ChatWidget.tsx
│   │   ├── EmptyState.tsx
│   │   ├── GoogleSignInButton.tsx
│   │   ├── HeritageCard.tsx
│   │   ├── MobileFooter.tsx
│   │   ├── MobileHeader.tsx
│   │   ├── MobileLogo.tsx
│   │   ├── RewardToastContainer.tsx
│   │   ├── RiddlePopup.tsx
│   │   ├── Screen.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ui.tsx
│   │   └── UmucoGlyph.tsx
│   ├── config/
│   │   └── auth.ts                  # Auth configuration
│   ├── context/                     # React Context providers
│   │   ├── AuthContext.tsx          # Authentication state & methods
│   │   ├── GamificationContext.tsx  # XP, levels, badges, streaks
│   │   └── LanguageContext.tsx      # i18n (en/rw/fr)
│   ├── data/                        # Static/local data
│   │   ├── artifacts.json
│   │   ├── explore-stories.json
│   │   ├── genocideMemorialSites.json
│   │   ├── intlEvents.ts
│   │   ├── museumGallery.json
│   │   ├── proverbs.json
│   │   ├── riddles.json
│   │   └── survivorTestimony.json
│   ├── navigation/                  # Navigation configuration
│   │   ├── AuthNavigator.tsx        # Auth stack (Landing, Login, Signup)
│   │   ├── MainTabs.tsx             # Bottom tab navigator
│   │   ├── MoreStack.tsx            # "More" tab stack navigator
│   │   ├── RootNavigator.tsx        # Root navigator (switches Auth/Main)
│   │   └── types.ts                 # Navigation TypeScript types
│   ├── screens/                     # Screen components
│   │   ├── auth/                    # Authentication screens
│   │   │   ├── _gradient.tsx
│   │   │   ├── LandingScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── collections/             # Collections browser
│   │   │   └── CollectionsScreen.tsx
│   │   ├── contribute/              # User contributions
│   │   │   └── ContributeScreen.tsx
│   │   ├── explore/                 # Explore heritage
│   │   │   └── ExploreScreen.tsx
│   │   ├── history/                 # Viewing history
│   │   │   └── HistoryScreen.tsx
│   │   ├── home/                    # Home dashboard
│   │   │   └── HomeScreen.tsx
│   │   ├── intl/                    # International days
│   │   │   └── IntlDaysScreen.tsx
│   │   ├── kwibuka/                 # Kwibuka (remembrance)
│   │   │   ├── KwibukaScreen.tsx
│   │   │   ├── MemorialMapScreen.tsx
│   │   │   ├── TestimoniesScreen.tsx
│   │   │   └── TestimonyDetailScreen.tsx
│   │   ├── listen/                  # Audio content
│   │   │   └── ListenScreen.tsx
│   │   ├── more/                    # More options menu
│   │   │   └── MoreHomeScreen.tsx
│   │   ├── profile/                 # User profile
│   │   │   └── ProfileScreen.tsx
│   │   ├── saved/                   # Saved/favorites
│   │   │   └── SavedScreen.tsx
│   │   ├── settings/                # App settings
│   │   │   └── SettingsScreen.tsx
│   │   └── videos/                  # Video content
│   │       └── VideosScreen.tsx
│   ├── services/                    # API service layers
│   │   ├── api.ts                   # Axios instance, token management
│   │   ├── audioService.ts
│   │   ├── authService.ts
│   │   ├── contributeService.ts
│   │   ├── gamificationService.ts
│   │   ├── geminiChat.ts
│   │   ├── heritageService.ts
│   │   ├── historyService.ts
│   │   ├── proverbService.ts
│   │   ├── savedService.ts
│   │   ├── userService.ts
│   │   └── videoService.ts
│   ├── theme/                       # Design system
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   ├── translations/                # i18n translation files
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── rw.json
│   ├── types/                       # TypeScript type definitions
│   │   └── index.ts                 # All shared types
│   └── utils/                       # Utility functions
│       ├── localization.ts          # Translation helper
│       └── validation.ts
└── package.json
```

---

## Navigation Architecture

### Root Navigator (RootNavigator.tsx)
```
RootNavigator
├── Loading State (ActivityIndicator)
└── NavigationContainer
    └── Stack.Navigator (headerShown: false)
        ├── Auth (if NOT logged in)
        │   └── AuthNavigator
        └── Main (if logged in)
            └── MainTabs
```

### Auth Navigator (AuthNavigator.tsx)
```
AuthNavigator
└── Stack.Navigator
    ├── Landing (no header)
    ├── Login (header: "Sign In")
    └── Signup (header: "Sign Up")
```

### Main Tabs (MainTabs.tsx)
```
MainTabs
├── MobileHeader (always visible)
├── Tab.Navigator (bottom tabs)
│   ├── Home
│   ├── Explore
│   ├── Listen
│   ├── Collections
│   └── More (→ MoreStack)
├── ChatWidget (logged-in users)
└── RiddlePopup (logged-in users)
```

### More Stack (MoreStack.tsx)
```
MoreStack
└── Stack.Navigator
    ├── MoreHome
    ├── Kwibuka
    ├── MemorialMap
    ├── Testimonies
    ├── TestimonyDetail (params: { id: string })
    ├── IntlDays
    ├── Videos
    ├── Contribute
    ├── Saved
    ├── History
    ├── Profile
    └── Settings
```

---

## Context Providers (App.tsx)

### Provider Hierarchy
```
SafeAreaProvider
└── AuthProvider
    └── StatusBar
        └── AppTree
            └── LanguageProvider
                ├── If user exists:
                │   └── GamificationProvider
                │       ├── RootNavigator
                │       └── RewardToastContainer
                └── If no user:
                    └── RootNavigator
```

### Context Details

#### 1. AuthContext (AuthContext.tsx)
**Purpose**: Manages user authentication state

**State**:
- `user: User | null`
- `loading: boolean`

**Methods**:
- `login(email, password)` → Promise<void>
- `register(name, email, password, explorerType?)` → Promise<{ message?: string }>
- `verifyEmail(email, otp)` → Promise<void>
- `resendOtp(email)` → Promise<void>
- `googleLogin(idToken)` → Promise<void>
- `forgotPassword(email)` → Promise<{ message?: string }>
- `logout()` → Promise<void>
- `updateUser(patch: Partial<User>)` → void
- `getToken()` → Promise<string | null>
- `refreshProfile()` → Promise<void>

**Usage**: `useAuth()`

---

#### 2. LanguageContext (LanguageContext.tsx)
**Purpose**: Manages app language (i18n)

**State**:
- `language: LanguageCode` ('en' | 'rw' | 'fr')
- `isSaving: boolean`

**Methods**:
- `setLanguage(lang: LanguageCode)` → Promise<void>
- `t(key: string, params?)` → string (translation function)

**Storage**: AsyncStorage key: 'umuco_language'

**Usage**: `useLanguage()`

---

#### 3. GamificationContext (GamificationContext.tsx)
**Purpose**: Manages gamification (XP, levels, streaks, badges)

**State**:
- `xp: number`
- `level: number`
- `streak: number`
- `bestStreak: number`
- `nextLevelXP: number`
- `toasts: RewardToast[]`

**Methods**:
- `dismissToast(id: string)` → void
- `refreshXP()` → Promise<void>
- `awardXP(amount, reason?)` → Promise<AwardXPResult | null>
- `dailyLogin()` → Promise<DailyLoginResult | null>
- `trackActivity(activityType, itemId?)` → Promise<void>

**Toast Types**:
```typescript
type RewardToast =
  | { id: string; type: 'xp'; amount: number; reason?: string; newXP?: number; newLevel?: number }
  | { id: string; type: 'levelUp'; level: number }
  | { id: string; type: 'badge'; badge: Badge }
  | { id: string; type: 'streak'; streak: number; isNew?: boolean };
```

**Usage**: `useGamification()`

---

## TypeScript Types (types/index.ts)

### Core Types

```typescript
// Language codes
type LanguageCode = 'en' | 'rw' | 'fr';

// Explorer types (user archetypes)
type ExplorerType =
  | 'warrior'
  | 'nature-lover'
  | 'royal-historian'
  | 'folktale-hunter'
  | 'music-explorer';

// User profile
interface User {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  avatar?: string | null;
  profileImage?: string | null;
  explorerType?: ExplorerType | string;
  language?: string;
  xp?: number;
  level?: number;
  currentStreak?: number;
  bestStreak?: number;
  emailVerified?: boolean;
  xpToNextLevel?: number;
  notifications?: {
    archiveUpdates?: boolean;
    newsletter?: boolean;
    eventReminders?: boolean;
  };
  accessibility?: {
    voice?: number;
    fontSize?: number;
    highContrast?: boolean;
    reduceMotion?: boolean;
    dateFormat?: string;
    timezone?: string;
  };
}

// Heritage items (cultural artifacts, places, etc.)
interface HeritageItem {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  image_url?: string;
  image?: string;
  location?: string;
  region?: string;
  era?: string;
  lat?: number | null;
  lng?: number | null;
  [key: string]: unknown;
}

// Audio content
interface AudioItem {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  narrator?: string;
  duration?: string | number;
  durationSec?: number;
  audio_url?: string;
  audioUrl?: string;
  thumbnail_url?: string;
  image?: string;
  genre?: string;
  [key: string]: unknown;
}

// Video content
interface VideoItem {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  duration?: number | string;
  video_url?: string;
  thumbnail_url?: string;
  [key: string]: unknown;
}

// Proverbs
interface Proverb {
  id: number | string;
  text?: string;
  proverb?: string;
  meaning?: string;
  translation?: string;
  language?: string;
  category?: string;
  [key: string]: unknown;
}

// Saved/favorited items
interface SavedItem {
  id?: number | string;
  item_id: number | string;
  item_type: string;
  item_title: string;
  item_subtitle?: string;
  item_image?: string;
  item_meta?: Record<string, unknown>;
  created_at?: string;
}

// Viewing history
interface HistoryItem {
  id: number | string;
  title: string;
  type?: string;
  category?: string;
  image?: string;
  viewedAt?: string;
  item_id?: number | string;
}

// Survivor testimonies
interface SurvivorTestimony {
  id: string;
  title: string;
  subjects?: string[];
  district?: string;
  language?: string;
  translation?: string;
  summary?: string;
  item_url?: string | string[] | null;
  listing_url?: string;
}

// Gamification
interface GamificationXP {
  xp: number;
  level: number;
  currentStreak?: number;
  bestStreak?: number;
  current_streak?: number;
  best_streak?: number;
  totalDays?: number;
  total_days?: number;
}

interface Badge {
  id: number | string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  requirement?: string;
  unlockedAt?: string | null;
  unlocked_at?: string | null;
}

interface Collectible {
  id: number | string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  rarity?: string;
  obtainedAt?: string | null;
  obtained_at?: string | null;
}

// International events
interface IntlEvent {
  date: string;
  type: string;
  title: Record<LanguageCode, string>;
  desc: Record<LanguageCode, string>;
}
```

---

## API Services (services/)

### Base API Configuration (api.ts)
- **Base URL**: `https://umucocore.onrender.com` (or EXPO_PUBLIC_API_BASE env var)
- **Timeout**: 30 seconds
- **Token Storage**: Expo SecureStore
- **Auth Header**: `Authorization: Bearer <token>`
- **Auto-attaches token** to all requests via interceptor

### Service Modules

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `authService.ts` | Login, register, OTP, Google auth | `login()`, `register()`, `verifyEmail()`, `googleLogin()`, `forgotPassword()`, `logout()`, `fetchProfile()` |
| `userService.ts` | User profile management | `updateProfile()`, `uploadAvatar()` |
| `heritageService.ts` | Heritage items CRUD | `fetchHeritage()`, `fetchHeritageById()`, `searchHeritage()` |
| `audioService.ts` | Audio content | `fetchAudio()`, `fetchAudioById()` |
| `videoService.ts` | Video content | `fetchVideos()`, `fetchVideoById()` |
| `proverbService.ts` | Proverbs | `fetchProverbs()`, `fetchProverbById()` |
| `savedService.ts` | Saved/favorites | `fetchSaved()`, `saveItem()`, `unsaveItem()` |
| `historyService.ts` | Viewing history | `fetchHistory()`, `clearHistory()` |
| `gamificationService.ts` | XP, levels, badges | `fetchXP()`, `fetchLevels()`, `awardXP()`, `dailyLogin()`, `trackActivity()` |
| `contributeService.ts` | User contributions | `submitContribution()` |
| `geminiChat.ts` | AI chat integration | Chat with Gemini AI |

---

## Screens Overview

### Authentication Screens
- **LandingScreen**: Welcome page, app introduction
- **LoginScreen**: Email/password login, Google Sign-In
- **SignupScreen**: Registration with explorer type selection

### Main Tab Screens
- **HomeScreen**: Dashboard with featured content, daily proverbs, riddles
- **ExploreScreen**: Browse heritage items, stories, categories
- **ListenScreen**: Audio content (stories, music, podcasts)
- **CollectionsScreen**: Museum gallery, artifact collections
- **MoreHomeScreen**: Menu for additional features

### More Stack Screens
- **KwibukaScreen**: Kwibuka remembrance section
- **MemorialMapScreen**: Interactive map of memorial sites
- **TestimoniesScreen**: Survivor testimonies list
- **TestimonyDetailScreen**: Individual testimony view
- **IntlDaysScreen**: International commemorative days
- **VideosScreen**: Video content library
- **ContributeScreen**: User content contributions
- **SavedScreen**: User's saved/favorited items
- **HistoryScreen**: Viewing history
- **ProfileScreen**: User profile & stats
- **SettingsScreen**: App settings, language, accessibility

---

## Key Features

### 1. Authentication
- Email/password login & registration
- Google Sign-In integration
- Email OTP verification
- Password reset flow
- Persistent sessions (SecureStore)

### 2. Gamification System
- XP points for activities
- Level progression
- Daily login streaks
- Badges & achievements
- Toast notifications for rewards
- Activity tracking

### 3. Multi-language Support
- English (en)
- Kinyarwanda (rw)
- French (fr)
- Persistent language preference
- Server-side sync

### 4. Content Types
- Heritage items (cultural artifacts, places)
- Audio content (stories, music)
- Video content
- Proverbs & riddles
- Survivor testimonies
- International events

### 5. User Features
- Save/favorite items
- Viewing history
- User profile with explorer type
- Contribution submissions
- Accessibility options (font size, voice, high contrast)

---

## Component Patterns

### Common Components
- **MobileHeader**: Top navigation bar with logo, language switcher
- **MobileFooter**: Bottom navigation (if needed)
- **SearchBar**: Reusable search input
- **HeritageCard**: Card component for heritage items
- **EmptyState**: Placeholder for empty lists
- **ChatWidget**: AI chat interface (Gemini)
- **RiddlePopup**: Daily riddle popup
- **RewardToastContainer**: Gamification toast notifications
- **GoogleSignInButton**: Google authentication button

---

## Data Flow

### Authentication Flow
1. App loads → AuthContext checks for stored token
2. If token exists → fetch profile from API
3. If valid → set user state → show MainTabs
4. If invalid → clear token → show AuthNavigator
5. If no token → show AuthNavigator

### Language Flow
1. App loads → check AsyncStorage for saved language
2. If user logged in → sync with user profile language
3. All screens use `useLanguage().t()` for translations
4. Language change → update AsyncStorage + API

### Gamification Flow
1. User logs in → GamificationProvider initializes
2. Fetches XP, level, streak from API
3. Daily login check → award streak XP
4. Activities (view, listen, etc.) → trackActivity()
5. XP awards → show toast notifications
6. Level up → special toast + badge awards

---

## Environment Variables

```env
EXPO_PUBLIC_API_BASE=https://umucocore.onrender.com
```

---

## Important Notes for Claude

1. **Context Dependencies**: 
   - `GamificationProvider` only renders if `user` exists
   - All contexts use React Context API (no Redux/Zustand)

2. **Navigation Types**:
   - All navigation params are typed in `navigation/types.ts`
   - Uses React Navigation's typed navigators

3. **API Communication**:
   - All API calls go through `services/api.ts` axios instance
   - Token auto-attached via request interceptor
   - Error handling via `getErrorMessage()`

4. **Localization**:
   - Translation keys in `translations/*.json`
   - Helper function in `utils/localization.ts`
   - Use `t('key')` from `useLanguage()`

5. **Gamification**:
   - XP awarded for activities via `trackActivity()`
   - Manual XP awards via `awardXP()`
   - Daily login streak tracking
   - Toast notifications for rewards

6. **Assets**:
   - Images in `assets/` folder
   - Use `assetUrl()` from `api.ts` for remote images
   - Local assets imported directly

7. **Platform**:
   - Built with Expo (iOS/Android)
   - Uses expo-secure-store for tokens
   - Uses expo-status-bar for status bar styling

---

## Common Patterns

### Using Context
```typescript
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';

function MyComponent() {
  const { user, login } = useAuth();
  const { t, language } = useLanguage();
  const { xp, level, awardXP } = useGamification();
  
  // ...
}
```

### Navigation
```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MoreStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<MoreStackParamList, 'TestimonyDetail'>;

// Usage
navigation.navigate('TestimonyDetail', { id: '123' });
```

### API Calls
```typescript
import { api } from '../services/api';
import { getToken } from '../services/api';

// Direct API call
const response = await api.get('/api/endpoint');

// With auth check
const token = await getToken();
if (!token) {
  // Handle not authenticated
}
```

---

## File Naming Conventions

- **Screens**: `PascalCaseScreen.tsx` (e.g., `HomeScreen.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `MobileHeader.tsx`)
- **Services**: `camelCaseService.ts` (e.g., `authService.ts`)
- **Contexts**: `PascalCaseContext.tsx` (e.g., `AuthContext.tsx`)
- **Types**: `index.ts` in types folder
- **Utils**: `camelCase.ts` (e.g., `localization.ts`)

---

## Dependencies (Key Packages)

```json
{
  "react-native": "Expo managed",
  "@react-navigation/native": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "expo-secure-store": "^12.x",
  "expo-status-bar": "~1.x",
  "react-native-safe-area-context": "4.x",
  "axios": "^1.x",
  "expo-google-app-auth": "or expo-auth-session"
}
```

---

## Backend API Endpoints (Expected)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-otp`
- `POST /api/auth/google`
- `POST /api/auth/forgot-password`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

### Heritage
- `GET /api/heritage`
- `GET /api/heritage/:id`
- `GET /api/heritage/search`

### Audio/Video
- `GET /api/audio`
- `GET /api/audio/:id`
- `GET /api/videos`
- `GET /api/videos/:id`

### User
- `PATCH /api/users/profile`
- `POST /api/users/avatar`
- `GET /api/users/saved`
- `POST /api/users/save`
- `DELETE /api/users/unsave`
- `GET /api/users/history`

### Gamification
- `GET /api/gamification/xp`
- `GET /api/gamification/levels`
- `POST /api/gamification/award-xp`
- `POST /api/gamification/daily-login`
- `POST /api/gamification/track`

---

## Summary

This is a **React Native Expo app** for the UmucoCore cultural heritage platform with:
- **3 main tabs**: Home, Explore, Listen + Collections + More
- **11 screens** in the More stack
- **3 context providers**: Auth, Language, Gamification
- **11 service modules** for API communication
- **Multi-language support**: English, Kinyarwanda, French
- **Gamification**: XP, levels, streaks, badges
- **Authentication**: Email/password + Google Sign-In
- **Content types**: Heritage, audio, video, proverbs, testimonies

The app is well-structured with clear separation of concerns, TypeScript typing throughout, and a modular architecture suitable for scaling.