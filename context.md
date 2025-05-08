# CalmHour Project Context & MVP Plan

Calendar Pattern Analysis + Focus Time Blocker

This minimalist feature would:

Analyze the user's existing calendar (via Google Calendar/Outlook API)
Identify optimal deep work time slots based on:
Existing meeting patterns
Historical productivity data (if available)
Research-backed optimal focus times
Automatically suggest and schedule focus blocks directly on their calendar
The key is simplicity - don't build recommendation engines, team coordination, or analytics dashboards yet. Just solve the core problem: identifying and protecting time for deep work.

## Proposed Application Architecture

*   **Framework:** Next.js (App Router) - Leveraging server components, client components, API routes, and middleware (based on existing `calmhour-landing` structure).
*   **UI:**
    *   React
    *   Tailwind CSS for styling (using existing `tailwind.config.ts`).
    *   shadcn/ui for pre-built components (based on `components.json`).
    *   `sonner` for toast notifications.
*   **Backend:**
    *   Next.js API Routes for specific backend logic (e.g., Google OAuth callbacks, triggering calendar analysis).
    *   Supabase for:
        *   Authentication (Google OAuth provider).
        *   Database (PostgreSQL) to store user profiles (`users` table: `id`, `email`, `subscription_status`, `stripe_customer_id`) and potentially Google Calendar tokens (securely, perhaps in a separate `google_tokens` table linked to `users`).
*   **External APIs:**
    *   Google Calendar API for reading free/busy times and creating events.
*   **State Management:**
    *   Server Components for data fetching.
    *   React Context API or Zustand/Jotai for minimal shared client state (user session, calendar connection).
*   **Deployment:** Vercel.

## Revised MVP Development Steps (Focus: Core Functionality)

1.  **Environment & Supabase Setup:**
    *   [x] Ensure `@supabase/supabase-js` and `@supabase/ssr` are installed.
    *   [x] Create Supabase project, define `users` and `google_tokens` tables with RLS.
    *   [x] Set up Supabase client files (`lib/supabase/*`) and `.env.local`.

2.  **Authentication (Google OAuth):**
    *   [x] Configure Supabase Google Auth provider.
    *   [x] Implement Login/Logout `AuthButtonClient` component and add to Navbar.
    *   [x] Setup database trigger `handle_new_user` for syncing `users` table.
    *   [x] Implement `middleware.ts` for session refresh and route protection (e.g., `/dashboard`).

3.  **Google Calendar API Credentials:**
    *   [x] Set up Google Cloud project, enable Calendar API, create OAuth 2.0 credentials.
    *   [x] Store Client ID/Secret in `.env.local`.
    *   [x] Configure redirect URIs in Google Cloud Console.

4.  **Google Calendar Connection Flow:**
    *   [x] **Frontend:** Add a "Connect Calendar" button (e.g., using `Button` from shadcn/ui) visible to logged-in users on a dashboard/settings page.
    *   [x] **Backend (API Route):** Create `/api/auth/google/calendar/connect` route. This route initiates the Google OAuth flow, requesting `calendar.events.readonly` and `calendar.events` scopes, including `access_type=offline` and `prompt=consent`.
    *   [x] **Backend (API Route):** Create `/api/auth/google/calendar/callback` route (matching redirect URI). This handles the code exchange, fetches tokens, and securely stores the access token, refresh token, and expiry time in the `google_tokens` table associated with the logged-in Supabase user.
    *   [x] **Frontend:** Update UI to show "Connected" status based on presence of valid tokens for the user (fetch status from a server component or dedicated API route).

5.  **Core Calendar Analysis & Blocking (Server-Side):**
    *   [ ] Create a server action or API route (e.g., `/api/calendar/find-and-block`).
    *   [ ] This function will:
        *   [ ] Retrieve the user's valid Google Calendar tokens from the `google_tokens` table.
        *   [x] Use the Google API client library (e.g., `googleapis`) to fetch free/busy info for the primary calendar for the next 7 days.
        *   [x] Implement *basic* logic to find 3 suitable 1-hour slots during typical working hours (e.g., 9am-5pm Mon-Fri).
        *   [x] Use the Google API client library to create 3 "Focus Block (CalmHour)" events.
        *   [x] Include error handling for API calls and token refresh if needed.
    *   [x] **Trigger:** Add a manual button in the UI for the MVP that calls this server action/API route.
    *   [x] **Feedback:** Use `sonner` toasts to provide feedback (e.g., "Blocks created successfully!", "Failed to connect to Calendar", "Could not find 3 slots").

6.  **Minimal Dashboard UI:**
    *   [x] Create a protected route (e.g., `/dashboard`) using Next.js file-based routing.
    *   [x] Display user email (fetched server-side).
    *   [x] Show Google Calendar connection status and Connect/Refresh button.
    *   [x] Include the manual trigger button for the blocking logic.
    *   [x] Add Logout button.

6.5. **Dashboard Calendar View (Post-MVP Addition):** - NEW
    *   [x] **Goal:** Display the user's actual Google Calendar events for the current week directly within the dashboard.
    *   [x] **Backend:** Create an API endpoint structure to fetch event data (summary, start, end) from Google Calendar using stored tokens. (Implemented)
    *   [x] **Frontend:** Update the dashboard UI (`CalendarWeekView`) to fetch data from the backend endpoint and render the events visually within the grid. (Implemented with basic overlap handling)

7.  **Deployment:**
    *   [ ] Ensure all necessary environment variables (Supabase, Google Cloud) are configured in Vercel project settings.
    *   [ ] Deploy the `calmhour-landing` project to Vercel.
    *   [ ] Test the full flow on the deployed version. 

# Project Context: CalmHour Landing Page & App

## Goal

Create a landing page and a web application (CalmHour) that allows users to connect their Google Calendar and automatically schedule focused work blocks.

## Core Components & Flow

1.  **Landing Page (`app/page.tsx`)**: Simple marketing page.
2.  **Authentication**: Supabase Auth handles user sign-up/sign-in.
3.  **Dashboard (`app/dashboard/page.tsx`)**: Main application view after login.
    *   Uses `components/dashboard-layout.tsx` (Client Component) for structure.
    *   Fetches initial user/calendar data (server-side).
    *   `DashboardLayout` manages calendar refresh state and selected event state.
4.  **Calendar Connection (`components/calendar-connect-button.tsx`, `/api/auth/google`, `/api/auth/callback/google`)**:
    *   Handles OAuth 2.0 flow with Google Calendar API.
    *   Stores tokens securely (e.g., in Supabase DB `google_tokens` table).
5.  **Calendar View (`components/full-calendar-view.tsx`)**:
    *   Uses `FullCalendar` library to display events fetched from `/api/calendar/events`.
    *   Fetches events based on the current view's date range.
    *   Receives a `key` prop from `DashboardLayout` to trigger re-renders/refreshes.
    *   Receives an `onEventClick` prop from `DashboardLayout` to handle event clicks.
    *   **Frontend Coloring:** Styles events (background, border, text) based on the `colorId` fetched from Google Calendar (via `/api/calendar/events`). Maps Google `colorId` to Tailwind classes.
6.  **Focus Controls (`components/focus-controls-sidebar.tsx`)**:
    *   UI for manually adding focus blocks (date, time, duration, name, priority).
    *   Calls `/api/calendar/add-focus-time` to create the event.
    *   Calls `onEventAdded` prop (passed from `DashboardLayout`) after successful event creation to trigger calendar refresh.
    *   UI for toggling auto-scheduling preference (calls `/api/user/settings`).
7.  **Focus Block Details (`components/focus-event-details-sidebar.tsx`)**:
    *   Displays details of a clicked focus block event.
    *   Receives event details and an `onClose` function from `DashboardLayout`.
    *   Rendered conditionally by `DashboardLayout` based on `selectedEvent` state.
8.  **API Routes (`/api/`)**:
    *   `/calendar/events`: Fetches events from Google Calendar (fetches `id`, `summary`, `start`, `end`, `colorId`).
    *   `/calendar/add-focus-time`: Creates a new focus event on Google Calendar.
        *   Sets event `summary` to `sessionName` input, or defaults to "Focus Time" if input is empty.
        *   Sets event `colorId` based on the selected `priority` (High=11, Medium=5, Low=2, Default=8).
    *   `/user/settings`: Gets/sets user preferences (e.g., auto-schedule).
    *   Authentication routes (`/auth/*`).

## Data Flow (Event Add & Refresh)

1.  User configures (duration, name, **priority**, time/date) and clicks "Add Focus Time" in `FocusControlsSidebar`.
2.  `FocusControlsSidebar` calls `/api/calendar/add-focus-time` with the details.
3.  API route determines the event `summary` (input name or "Focus Time") and `colorId` (based on priority).
4.  API route interacts with Google Calendar API to create the event with the determined summary and color.
5.  On success, API responds.
6.  `FocusControlsSidebar` receives success response and calls `onEventAdded` (which is `triggerCalendarRefresh` from `DashboardLayout`).
7.  `triggerCalendarRefresh` updates the `calendarKey` state in `DashboardLayout`.
8.  `DashboardLayout` re-renders, passing the new `key` to `FullCalendarView`.
9.  `FullCalendarView`, due to the changed `key`, re-mounts or its `useEffect` refetches events from `/api/calendar/events` (now including `colorId`).
10. `FullCalendarView` renders the new event, using the fetched `colorId` to determine its styling (background, border, text color).

## Data Flow (Event Click & Details View)

1.  User clicks on a focus block event in `FullCalendarView`.
2.  `FullCalendarView` calls the `onEventClick` prop (passed from `DashboardLayout`).
3.  `DashboardLayout`'s `handleEventClick` function receives the event details and updates the `selectedEvent` state.
4.  `DashboardLayout` re-renders.
5.  The `<aside>` section now renders `FocusEventDetailsSidebar` instead of `FocusControlsSidebar` because `selectedEvent` is not null.
6.  `FocusEventDetailsSidebar` displays the details from the `selectedEvent` state.
7.  User clicks the "Close" button in `FocusEventDetailsSidebar`.
8.  `FocusEventDetailsSidebar` calls the `onClose` prop (which is `handleCloseDetails` from `DashboardLayout`).
9.  `handleCloseDetails` sets `selectedEvent` back to `null`.
10. `DashboardLayout` re-renders, now showing `FocusControlsSidebar` again. 

## Current Status / Notes

- **Problem:** The "Delete Focus Time" feature fails.
- **Root Cause Analysis:**
    - **Primary:** API route `app/api/calendar/delete-focus-time/route.ts` incorrectly queried non-existent `user_connections` table instead of `google_tokens`. (FIXED)
    - **Secondary:** Runtime error `Route "/api/calendar/delete-focus-time" used cookies().get(...) ... cookies() should be awaited...` was observed, indicating incorrect usage of `@supabase/ssr` helpers. (FIXED by awaiting `cookies()`)
- **Fix Applied:**
    - Modified `app/api/calendar/delete-focus-time/route.ts` to query `google_tokens`.
    - Updated `select` statement columns to `access_token`, `refresh_token`.
    - Corrected cookie handling by awaiting `cookies()` before passing to `createServerClient`.
- **Next Step:** Test the "Delete Focus Time" functionality.

## Current Status / Notes (Update)

- **Problem:** After fixing the initial API issues, testing revealed a new error: `Error: Missing calendarId or eventId at DashboardLayout.useCallback[handleDeleteEvent] ...dashboard-layout.tsx:87:27`.
- **Root Cause:** The `handleDeleteEvent` function in `DashboardLayout` was correctly passed to `FocusEventDetailsSidebar`, but the sidebar's delete button only called it with the `eventId`, while the API expected both `eventId` and `calendarId`.
- **Fix Applied:**
    - Modified `handleDeleteEvent` in `DashboardLayout` to accept `calendarId` (defaulting to 'primary') and include it in the API request body.
    - Updated the `onDelete` prop interface in `FocusEventDetailsSidebar` to accept `calendarId`.
    - Modified the `handleDeleteClick` function in `FocusEventDetailsSidebar` to call `onDelete` with both the event `id` and the string `'primary'` as the `calendarId`.
- **Next Step:** Re-test the "Delete Focus Time" functionality. 

### `lib/supabase/server.ts`
- Exports an async `createClient` function for server-side Supabase operations.
- Uses `createServerClient` from `@supabase/ssr`.
- Integrates with `next/headers` `cookies()` for server-side session management.
- Reads Supabase URL and anon key from environment variables.

- **`lib/supabase/client.ts`**: Defines a function `createClient` using `createBrowserClient` from `@supabase/ssr` to create a Supabase client instance for the browser environment. It utilizes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables for configuration. 

The focus branch has been merged into the main branch, and all changes have been pushed to the remote repository on GitHub. The main branch is now up-to-date. 
- **Deployment Issue:** Encountered `ERR_PNPM_OUTDATED_LOCKFILE` on Vercel. Resolved by running `pnpm install --no-frozen-lockfile` to update `pnpm-lock.yaml` and committing the change. 