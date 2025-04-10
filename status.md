# CalmHour MVP Status Tracker

## Feature Status (Based on context.md)

*   [x] **Step 1: Environment & Supabase Setup**
*   [x] **Step 2: Authentication (Google OAuth)**
    *   [x] Configure Supabase Google Auth provider
    *   [x] Implement Login/Logout UI & Flow
    *   [x] Server-side user data sync (via DB Trigger)
    *   [x] Protect app routes (Middleware/Layout checks)
*   [x] **Step 3: Google Calendar API Credentials**
    *   [x] Set up Google Cloud project, enable API, create OAuth credentials
    *   [x] Store Client ID/Secret in `.env.local`
    *   [x] Configure redirect URIs in Google Cloud Console
*   [x] **Step 4: Google Calendar Connection Flow**
    *   [x] **Frontend:** Add "Connect Calendar" button to dashboard/settings.
    *   [x] **Backend (API Route):** Create `/api/auth/google/calendar/connect` route.
    *   [x] **Backend (API Route):** Create `/api/auth/google/calendar/callback` route.
    *   [x] **Frontend:** Update UI to show "Connected" status.
*   [Pending] **Step 5: Core Calendar Analysis & Blocking**
*   [In Progress] **Step 6: Minimal Dashboard UI**
    *   [x] Create protected route `/dashboard`.
    *   [x] Display user email.
    *   [x] Show Calendar connection status & button.
    *   [ ] Include trigger button for blocking logic.
    *   [x] Add Logout button (via AuthButtonClient in Navbar).
*   [Pending] **Step 7: Deployment**

*Note: Update status markers ([ ], [In Progress], [x]) as development proceeds.*

## MVP Project Directory Structure (calmhour-landing)

```
calmhour-landing/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── google/
│   │           └── calendar/
│   │               ├── connect/
│   │               │   └── route.ts
│   │               └── callback/
│   │                   └── route.ts
│   ├── dashboard/
│   │   ├── dashboard-client-messages.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # shadcn components
│   ├── auth-button-client.tsx
│   ├── calendar-connect-button.tsx
│   ├── features.tsx
│   ├── footer.tsx
│   ├── hero.tsx
│   ├── navbar.tsx
│   ├── problem-statement.tsx
│   ├── solution.tsx
│   ├── testimonials.tsx
│   ├── theme-provider.tsx
│   └── waitlist-form.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── public/
├── styles/
│   └── globals.css
├── .env.local           # **NOT COMMITTED**
├── .gitignore
├── components.json
├── context.md           # NEW - Project plan & steps
├── middleware.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── status.md            # NEW - Progress tracker
├── tailwind.config.ts
└── tsconfig.json
```

*Note: This structure reflects the current state and anticipated additions for the MVP. Update as files/folders are added/changed.* 