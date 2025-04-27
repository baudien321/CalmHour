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
    *   [x] **Event Editing Functionality:** (NEW)
        *   [x] API: Create `PATCH /api/calendar/update-focus-time` route.
        *   [x] UI (Details Sidebar): Add "Edit Block" button.
        *   [x] UI (Dashboard Layout): Add state (`editingEventDetails`) to manage edit mode.
        *   [x] UI (Dashboard Layout): Implement `handleUpdateEvent` function.
        *   [x] UI (Dashboard Layout): Implement logic to conditionally render sidebar for editing.
        *   [x] UI (Controls Sidebar): Modify to accept `initialEventData`, `isEditing`, `onCancelEdit`, `onUpdate`, `isLoading` props.
        *   [x] UI (Controls Sidebar): Implement form pre-filling based on `initialEventData`.
        *   [x] UI (Controls Sidebar): Add "Cancel" button for edit mode.
        *   [x] UI (Controls Sidebar): Modify form submission to call update/add handlers based on mode.
        *   [x] UI (Controls Sidebar): Implement smart default for start time (next hour).
        *   [x] UI (Controls Sidebar): Update start time label and rely on native input for AM/PM.
        *   [x] UI (Controls Sidebar): Implement custom AM/PM time picker UI (Selects + RadioGroup).
*   [Pending] **Step 8: Deployment**
    *   [ ] Configure Custom SMTP for reliable email confirmation
    *   [ ] Set up environment variables in Vercel
    *   [ ] Deploy project & test thoroughly
*   [Pending] **Step 9: Bug Fixing / Known Issues**
    *   [x] **FIXED:** Address `delete-focus-time` API errors (Incorrect table query `user_connections` -> `google_tokens`, Incorrect cookie handling).
    *   [ ] Address Supabase SSR cookie handling linter errors (See `errors.md`) - *Note: The previous fix in delete route might resolve some of these if pattern is repeated.*
    *   [x] **FIXED:** Inability to edit/delete some focus blocks due to unreliable identification (title check). Replaced with robust `extendedProperties` check.
    *   [x] **FIXED:** Event click logic only opened details for focus blocks. Now opens for all, with actions conditional.

*   [To Do] **Step 10: Implement Calm Vibes Page** (NEW)
    *   [x] **Page Structure:** Set up `app/calm-vibes/page.tsx` with full-screen layout (relative positioning).
    *   [x] **Background Layer:** Add a div for the background (image or video) with appropriate z-index.
    *   [x] **Overlay Container:** Add a container div for controls on top of the background.
    *   [x] **Timer Component:** Create `components/focus-timer.tsx` with HH:MM:SS display and state logic.
    *   [x] **Timer Integration:** Position Timer component top-left on the page.
    *   [x] **Player Component:** Create `components/lofi-player.tsx` with audio element, state (`isPlaying`), and UI (play/pause button, track title).
    *   [x] **Player Integration:** Position Player component bottom-left on the page.
    *   [x] **Fullscreen Component:** Create `components/fullscreen-toggle.tsx` using Fullscreen API and state.
    *   [x] **Fullscreen Integration:** Position Fullscreen component top-right on the page.
    *   [x] **Styling:** Apply Tailwind CSS for layout, positioning, colors, blur, etc., to match design.

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

## Current Status (as of last interaction)

- **Implemented:** Frontend Event Coloring based on Google Calendar `colorId`
  - Updated `/api/calendar/events` to fetch and return `colorId`.
  - Updated `components/full-calendar-view.tsx`:
    - Modified event interfaces (`ApiCalendarEvent`, `FullCalendarEvent`, `MappedEvent`) to include `colorId`.
    - Stored fetched `colorId` in `extendedProps`.
    - Updated `renderEventContent` and `getEventClassNames` to map Google `colorId` values to Tailwind text/background/border classes, providing visual priority indication.
- **Implemented:** Priority Colors & Default Naming for Manual Focus Blocks (API-side)
  - Updated `/api/calendar/add-focus-time` (uses default name, maps priority to `colorId`).
- **Implemented:** Event Click to Show Details Sidebar
  - Created `components/focus-event-details-sidebar.tsx`.
  - Updated `components/dashboard-layout.tsx` (state, handlers, conditional render).
  - Updated `components/full-calendar-view.tsx` (accepts `onEventClick`).
- **Implemented:** Basic structure for `FocusEventDetailsSidebar`.
- **Implemented:** Logic in `DashboardLayout` to only trigger details view for focus events.
- **TODO:** Refine `FocusEventDetailsSidebar` UI/content.
- **TODO:** Add actions to `FocusEventDetailsSidebar` (Edit, Delete).
- **TODO:** Thoroughly test manual event creation, priority colors (in-app and GCal), and click interaction.
- **Completed:** Refactor `delete-focus-time`