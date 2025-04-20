# CalmHour MVP Status Tracker

## Feature Status (Based on context.md)

*   [x] **Step 1: Environment & Supabase Setup**
*   [x] **Step 2: Authentication (Email & Google)**
    *   [x] Configure Supabase Email & Google Auth providers
    *   [x] Implement Login/Signup/Logout UI & Flow
    *   [x] Server-side user data sync
    *   [x] Protect app routes (Middleware)
    *   [x] Ensure user redirected to `/dashboard` after login
*   [x] **Step 3: Google Calendar API Credentials**
    *   [x] Setup Google Cloud project & credentials
    *   [x] Store credentials securely
    *   [x] Configure redirect URIs (Supabase & Localhost)
*   [x] **Step 4: Google Calendar Connection Flow**
    *   [x] Frontend: Add Connect/Status button (`components/calendar-connect-button`)
    *   [x] Backend: Implement `/connect` and `/callback` API routes
*   [x] **Step 5: Core Calendar Analysis & Blocking**
    *   [x] Create API route (`/api/calendar/find-and-block`)
    *   [x] Implement logic: Get tokens, fetch free/busy, find 3 slots, create events
    *   [x] Include token refresh logic & basic error handling
    *   [x] Frontend: Add trigger button & feedback (`components/dashboard-action-card-content`)
*   [In Progress] **Step 6: Dashboard UI/UX Refinement**
    *   [x] Create protected route & base layout (`/dashboard`)
    *   [x] Implement Dashboard Header (`components/dashboard-header`)
    *   [x] Implement card layout for Welcome/Status & Actions
    *   [x] Implement `CalendarView` with Day/Week/Month switching & basic event display
    *   [x] Show Calendar connection status (Badge)
    *   [x] Display Connect/Find&Block buttons conditionally
    *   [x] Add persistent feedback line for Find/Block action
    *   [x] Implement Week/Day/Month Navigation (Prev/Next/Today) in `CalendarView`
    *   [ ] Review overall visual consistency (colors, spacing, **typography**, **border-radius**)
    *   [ ] Ensure responsiveness on mobile/tablet views
    *   [ ] Add basic empty/loading states within cards/calendar
    *   [ ] Refine Dashboard Header UI (add sync status/time display)
*   [x] **Step 6.5: Dashboard Calendar View (Display Google Events)**
*   [In Progress] **Step 7: Implement Advanced Features & Visualization** 
    *   [x] **Functional Controls Sidebar:**
        *   [x] Implement Manual "Add Focus Time" button functionality (API + Frontend)
        *   [x] Implement Duration controls logic (affecting manual add)
        *   [x] Implement Auto-schedule toggle logic (API + Frontend - stores preference)
        *   [x] Implement Priority selection logic (affecting manual scheduling - sets event color)
        *   [x] Implement Session Name logic (Input exists, affects manual add)
    *   [To Do] **Analysis Visualization:**
        *   [ ] Backend: Logic/API for calculating meeting patterns.
        *   [ ] Backend: Logic/API for calculating productivity scores (requires defining metrics).
        *   [ ] Frontend: Implement Meeting Pattern Chart (`components/charts/meeting-pattern-chart.tsx`?).
        *   [ ] Frontend: Implement Productivity Score Chart (`components/charts/productivity-chart.tsx`?).
        *   [ ] Frontend: Implement Recommended Focus Times display.
    *   [To Do] **Calendar View Enhancements:**
        *   [ ] Display All-Day events correctly.
        *   [ ] Improve Event Overlap visualization (more sophisticated layout).
        *   [ ] Use Google Calendar event colors for rendering.
        *   [ ] Implement basic event interaction (e.g., clicking to view details).
    *   [To Do] **Header Functionality:**
        *   [ ] Implement "Sync Now" button functionality.
        *   [ ] Implement "Settings" page/modal and link button.
*   [Pending] **Step 8: Deployment**
    *   [ ] Configure Custom SMTP for reliable email confirmation
    *   [ ] Set up environment variables in Vercel
    *   [ ] Deploy project & test thoroughly
*   [Pending] **Step 9: Bug Fixing / Known Issues**
    *   [ ] Address Supabase SSR cookie handling linter errors (See `errors.md`)

*Note: Update status markers ([ ], [In Progress], [x]) as development proceeds.*

## Project Directory Structure (Current)

```
calmhour-landing/
├── app/
│   ├── api/
│   │   ├── auth/                 # Auth-related API routes
│   │   │   └── google/
│   │   │       └── calendar/       # Calendar connection routes
│   │   │           ├── connect/
│   │   │           ├── callback/
│   │   │           └── disconnect/    # Delete tokens route (NEW)
│   │   │               └── route.ts
│   │   └── calendar/
│   │       └── find-and-block/     # Core blocking logic route
│   │           └── route.ts
│   ├── dashboard/
│   │   ├── dashboard-client-messages.tsx # Handles toast messages
│   │   └── page.tsx              # Main dashboard page layout
│   ├── login/
│   │   └── page.tsx              # Login page route
│   ├── signup/
│   │   └── page.tsx              # Signup page route
│   ├── globals.css
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page route
├── components/
│   ├── ui/                     # shadcn components (Button, Card, Badge, etc.)
│   ├── auth-button-client.tsx    # Main Navbar Login/Logout button
│   ├── calendar-connect-button.tsx # Button to connect Google Calendar
│   ├── calendar-view.tsx        # Renamed from calendar-week-view (NEW)
│   ├── dashboard-action-card-content.tsx # Client comp for Action Card button/feedback
│   ├── dashboard-header.tsx      # Header specific to the /dashboard page
│   ├── focus-controls-sidebar.tsx # Updated (NEW)
│   ├── login-form.tsx            # Email/Password Login form
│   ├── navbar.tsx                # Main site navigation bar
│   ├── signup-form.tsx           # Email/Password Signup form
│   ├── theme-provider.tsx
│   └── # (Landing page specific components: features, footer, hero, etc.)
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase client for Client Components
│   │   └── server.ts             # Supabase client for Server Components/Routes
│   └── utils.ts
├── # (Config files: .env.local, .gitignore, components.json, middleware.ts, etc.)
├── # (Docs: context.md, status.md, test.md, errors.md)
└── # (Package manager files: package.json, pnpm-lock.yaml)
```

*Note: Structure simplified for clarity. Landing page components omitted.* 
