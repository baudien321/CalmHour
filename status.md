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
*   [In Progress] **Step 5: Core Calendar Analysis & Blocking**
    *   [x] Create a server action or API route (e.g., `/api/calendar/find-and-block`).
    *   [In Progress] This function will:
        *   [x] Retrieve the user's valid Google Calendar tokens from the `google_tokens` table.
        *   [x] Use the Google API client library (e.g., `googleapis`)
        *   [ ] Fetch free/busy info for the primary calendar for the next 7 days.
        *   [ ] Implement *basic* logic to find 3 suitable 1-hour slots during typical working hours (e.g., 9am-5pm Mon-Fri).
        *   [ ] Use the Google API client library to create 3 "Focus Block (CalmHour)" events.
        *   [ ] Include error handling for API calls and token refresh if needed.
    *   [ ] **Trigger:** Add a manual button in the UI for the MVP that calls this server action/API route.
    *   [ ] **Feedback:** Use `sonner` toasts to provide feedback (e.g., "Blocks created successfully!", "Failed to connect to Calendar", "Could not find 3 slots").
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