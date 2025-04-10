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
        *   [ ] Use the Google API client library (e.g., `googleapis`) to fetch free/busy info for the primary calendar for the next 7 days.
        *   [ ] Implement *basic* logic to find 3 suitable 1-hour slots during typical working hours (e.g., 9am-5pm Mon-Fri).
        *   [ ] Use the Google API client library to create 3 "Focus Block (CalmHour)" events.
        *   [ ] Include error handling for API calls and token refresh if needed.
    *   [ ] **Trigger:** Add a manual button in the UI for the MVP that calls this server action/API route.
    *   [ ] **Feedback:** Use `sonner` toasts to provide feedback (e.g., "Blocks created successfully!", "Failed to connect to Calendar", "Could not find 3 slots").

6.  **Minimal Dashboard UI:**
    *   [x] Create a protected route (e.g., `/dashboard`) using Next.js file-based routing.
    *   [x] Display user email (fetched server-side).
    *   [x] Show Google Calendar connection status and Connect/Refresh button.
    *   [ ] Include the manual trigger button for the blocking logic.
    *   [x] Add Logout button.

7.  **Deployment:**
    *   [ ] Ensure all necessary environment variables (Supabase, Google Cloud) are configured in Vercel project settings.
    *   [ ] Deploy the `calmhour-landing` project to Vercel.
    *   [ ] Test the full flow on the deployed version. 