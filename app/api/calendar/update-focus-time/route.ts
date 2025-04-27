import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { addMinutes, parseISO } from 'date-fns'; // Need date-fns

// TODO: Define the expected request body interface
interface UpdateFocusTimeRequestBody {
  eventId: string;
  startTime: string; // Expect ISO string e.g., "2024-07-30T10:00:00.000Z"
  duration: number; // Duration in minutes
  sessionName?: string;
  priority?: 'high' | 'medium' | 'low';
}

// Priority mapping
const priorityColorMap: { [key: string]: string } = {
  high: '11', // Red
  medium: '5', // Yellow
  low: '2', // Green
  default: '8', // Grey
};

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.error('[API update-focus-time] Failed to set cookie:', name, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.error('[API update-focus-time] Failed to remove cookie:', name, error);
          }
        },
      },
    }
  );

  // 1. Get User Session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    console.error('[API update-focus-time] Error getting session or no session:', sessionError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Get Google Tokens
  const { data: tokenData, error: tokenError } = await supabase
    .from('google_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (tokenError || !tokenData) {
    console.error('[API update-focus-time] Error fetching tokens:', tokenError);
    const status = tokenError?.code === 'PGRST116' ? 404 : 500;
    const message = status === 404 ? 'Google Calendar connection not found.' : 'Database error fetching tokens.';
    return NextResponse.json({ error: message }, { status });
  }

  let { access_token: currentAccessToken, refresh_token: currentRefreshToken, expires_at: expiresAt } = tokenData;

  if (!currentAccessToken) {
     console.error('[API update-focus-time] Access token not found for user:', userId);
     return NextResponse.json({ error: 'Google access token not found' }, { status: 400 });
  }

  // 3. Initialize Google OAuth Client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    // Redirect URI might not be strictly needed for API calls after initial auth,
    // but good practice to include if library expects it.
    process.env.NEXT_PUBLIC_REDIRECT_URI 
  );

  // 4. Handle Token Refresh (reuse logic from other routes)
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiryBufferSeconds = 300; // 5 minutes buffer
  const expiresAtSeconds = expiresAt ? Number(expiresAt) : 0;

  if (expiresAtSeconds < (nowSeconds + expiryBufferSeconds)) {
    console.log('[API update-focus-time] Access token expired or expiring soon, attempting refresh for user:', userId);
    if (!currentRefreshToken) {
      console.error('[API update-focus-time] Refresh token missing, cannot refresh. User ID:', userId);
      // Optionally delete the connection here if refresh token is mandatory
      await supabase.from('google_tokens').delete().eq('user_id', userId);
      return NextResponse.json({ error: 'Google session expired, please reconnect calendar.' }, { status: 401 });
    }
    try {
      oauth2Client.setCredentials({ refresh_token: currentRefreshToken });
      const { credentials } = await oauth2Client.refreshAccessToken();
      const newAccessToken = credentials.access_token;
      const newExpiryDate = credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null;
      // Use the new refresh token if provided, otherwise keep the old one
      const newRefreshToken = credentials.refresh_token || currentRefreshToken; 

      if (!newAccessToken) {
         throw new Error('Refresh token request did not return an access token.');
      }

      // Update Supabase with new tokens
      const { error: updateError } = await supabase
        .from('google_tokens')
        .update({
           access_token: newAccessToken,
           expires_at: newExpiryDate,
           refresh_token: newRefreshToken // Store the potentially new refresh token
         })
        .eq('user_id', userId);

      if (updateError) {
         console.error('[API update-focus-time] Failed to update refreshed token in DB:', updateError);
         // Proceed with new token anyway, but log the DB error
      } else {
         console.log('[API update-focus-time] Successfully refreshed and updated token for user:', userId);
      }

      currentAccessToken = newAccessToken;
      currentRefreshToken = newRefreshToken; // Update local variable
      oauth2Client.setCredentials({ 
          access_token: newAccessToken, 
          refresh_token: newRefreshToken 
      });

    } catch (refreshError: any) {
      console.error('[API update-focus-time] Failed to refresh Google token for user:', userId, refreshError.message || refreshError);
      // Critical error: Delete the connection info as it's invalid
      await supabase.from('google_tokens').delete().eq('user_id', userId);
      return NextResponse.json({ error: `Failed to refresh Google Calendar connection: ${refreshError.message}. Please reconnect.` }, { status: 401 });
    }
  } else {
    // Set credentials with existing tokens if not expired
    oauth2Client.setCredentials({
      access_token: currentAccessToken,
      refresh_token: currentRefreshToken,
    });
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // 5. Parse Request Body
  let body: UpdateFocusTimeRequestBody;
  try {
    body = await req.json();
  } catch (error) {
    console.error("[API update-focus-time] Error parsing request body:", error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { eventId, startTime, duration, sessionName, priority } = body;

  // 6. Validate Input
  if (!eventId || !startTime || duration == null || duration <= 0) {
    return NextResponse.json({ error: 'Missing required fields: eventId, startTime, and positive duration are required.' }, { status: 400 });
  }

  try {
    // 7. Prepare Google Calendar API Patch Request
    const startDate = parseISO(startTime); // Convert ISO string to Date object
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'Invalid startTime format. Please use ISO 8601 format.' }, { status: 400 });
    }
    const endDate = addMinutes(startDate, duration);

    const colorId = priority ? priorityColorMap[priority] : priorityColorMap.default;
    const eventSummary = sessionName || 'Focus Time'; // Use provided name or default

    const eventPatchPayload: any = {
      summary: eventSummary,
      start: {
        dateTime: startDate.toISOString(),
        // Assuming you want to use the user's primary timezone, otherwise specify timezone
      },
      end: {
        dateTime: endDate.toISOString(),
      },
      colorId: colorId,
      // Add any other fields you want to allow updating
    };

    // 8. Call Google Calendar API (calendar.events.patch)
    console.log(`[API update-focus-time] Patching event ${eventId} for user ${userId}`);
    const response = await calendar.events.patch({
      calendarId: 'primary', // Assuming update happens on primary calendar
      eventId: eventId,
      requestBody: eventPatchPayload,
    });

    console.log(`[API update-focus-time] Successfully patched event ${eventId}. Status:`, response.status);

    // 9. Handle Response
    // Google API patch usually returns 200 OK with the updated event resource
    return NextResponse.json({ message: 'Focus time updated successfully', data: response.data }, { status: 200 });

  } catch (error: any) {
    console.error(`[API update-focus-time] Error updating Google Calendar event ${eventId} for user ${userId}:`, error.response?.data || error.message || error);
    // Handle potential Google API errors (e.g., 404 Not Found, 403 Forbidden)
    const status = error.response?.status || 500;
    let message = 'Failed to update focus time.';
    if (status === 404) {
        message = 'Focus time event not found on Google Calendar.';
    } else if (status === 403) {
        message = 'Permission denied to update this Google Calendar event.';
    } else if (error.message) {
        message = error.message;
    }
    return NextResponse.json({ error: message, details: error.response?.data?.error }, { status });
  }
} 