# Umuco Core Monorepo

```
umucocore/
├── backend/     # Express API → https://umucocore.onrender.com  (do not break)
├── frontend/    # React (Vite) web app — SOURCE OF TRUTH for product UX
└── mobile/      # React Native (Expo + TypeScript) rewrite of frontend
```

| App | Path | Run |
|-----|------|-----|
| Backend | `/backend` | Deployed on Render |
| Web | `/frontend` | `cd frontend && npm install && npm run dev` |
| Mobile | `/mobile` | `cd mobile && npm install && npx expo start` |

Mobile screen mapping: [mobile/MAPPING.md](./mobile/MAPPING.md)
