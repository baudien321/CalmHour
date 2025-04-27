import { NextRequest, NextResponse } from 'next/server';
// Use createServerClient for Route Handlers
import { createServerClient, type CookieOptions } from '@supabase/ssr'; 
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { startOfWeek, endOfWeek, formatISO } from 'date-fns';

// Define CalendarEvent type within this file
interface CalendarEvent {
  id: string;
  summary?: string | null;
  start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
  colorId?: string | null;
  extendedProperties?: { private?: { [key: string]: string } };
}

// Define the response event type including our new flag
interface ResponseEvent extends Omit<CalendarEvent, 'extendedProperties'> { 
  isFocusBlock: boolean;
}

export async function GET(request: NextRequest) {
  // Use Supabase client with cookies for Route Handler context
  const cookieStore = await cookies(); 
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try { cookieStore.set({ name, value, ...options }); } catch (error) { /* Ignore */ }
        },
        remove: (name: string, options: CookieOptions) => {
          try { cookieStore.set({ name, value: '', ...options }); } catch (error) { /* Ignore */ }
        },
      },
    }
  );

  try {
    // 1. Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Ensure user is checked *before* accessing user.id
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id; // Store id safely after check

    // 2. Retrieve user's Google tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId) // Use stored userId
      .single();
      
    // Ensure tokenData is checked *before* accessing its properties
    if (tokenError || !tokenData) {
      const status = tokenError?.code === 'PGRST116' ? 400 : 500;
      const message = tokenError?.code === 'PGRST116' 
        ? 'Google Calendar not connected.' 
        : 'Database error fetching tokens.';
      return NextResponse.json({ error: message }, { status });
    }

    // 3. Determine date range 
    const searchParams = request.nextUrl.searchParams;
    const today = new Date();
    const timeMin = searchParams.get('startDate') || formatISO(startOfWeek(today, { weekStartsOn: 0 }));
    const timeMax = searchParams.get('endDate') || formatISO(endOfWeek(today, { weekStartsOn: 0 }));

    // --- Google Client Setup & Token Refresh --- 
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Safely access tokenData properties after null check above
    let currentAccessToken = tokenData.access_token;
    let currentRefreshToken = tokenData.refresh_token;
    const expiryBufferSeconds = 5 * 60;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expiresAtSeconds = tokenData.expires_at ? Number(tokenData.expires_at) : 0;

    if (currentRefreshToken && expiresAtSeconds < (nowSeconds + expiryBufferSeconds)) {
      console.log('[API /calendar/events] Refreshing token...');
      oauth2Client.setCredentials({ refresh_token: currentRefreshToken });
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;
        const newExpiryDate = credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null;

        const { error: updateError } = await supabase
          .from('google_tokens')
          .update({ 
             access_token: newAccessToken,
             expires_at: newExpiryDate,
             refresh_token: credentials.refresh_token || currentRefreshToken
           })
          .eq('user_id', userId); // Use stored userId
        if (updateError) {
           console.error('[API /calendar/events] Failed to update refreshed token:', updateError);
        }
        currentAccessToken = newAccessToken;
        oauth2Client.setCredentials({ 
           access_token: newAccessToken, 
           refresh_token: credentials.refresh_token || currentRefreshToken 
        });
      } catch (refreshError) {
         let errorMessage = 'Unknown error during token refresh';
         if (typeof refreshError === 'object' && refreshError !== null && 'message' in refreshError) {
             errorMessage = (refreshError as Error).message;
         } else if (typeof refreshError === 'string') {
             errorMessage = refreshError;
         }
         console.error('[API /calendar/events] Failed to refresh Google token:', errorMessage);
         await supabase.from('google_tokens').delete().eq('user_id', userId); // Use stored userId
         return NextResponse.json({ error: `Failed to refresh Google Calendar connection: ${errorMessage}. Please reconnect.` }, { status: 401 });
      }
    } else {
        oauth2Client.setCredentials({
          access_token: currentAccessToken,
          refresh_token: currentRefreshToken,
        });
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // --- End Google Client Setup & Token Refresh ---

    // 4. Fetch calendar events
    console.log(`[API /calendar/events] Fetching events for ${userId} from ${timeMin} to ${timeMax}`); // Use stored userId
    
    let fetchedEvents: ResponseEvent[] = [];
    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin,
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 250,
            fields: 'items(id,summary,start,end,colorId,extendedProperties)'
        });

        if (response.data.items) {
            fetchedEvents = response.data.items.map((event): ResponseEvent => {
                const isFocus = event.extendedProperties?.private?.calmhourFocusBlock === 'true';
                return {
                id: event.id!,
                summary: event.summary,
                start: event.start,
                end: event.end,
                   colorId: event.colorId,
                   isFocusBlock: isFocus
                }
            });
            console.log(`[API /calendar/events] Found ${fetchedEvents.length} events.`);
        }
    } catch (apiError: any) {
         console.error('[API /calendar/events] Google Calendar API error:', apiError);
         let errorMessage = 'Failed to fetch calendar events from Google.';
         if (apiError.response?.data?.error?.message) { 
             errorMessage = `Google API Error: ${apiError.response.data.error.message}`;
         } else if (apiError.message) {
            errorMessage = apiError.message;
         }
         const statusCode = apiError.code || apiError.response?.status || 500;
         if (statusCode === 401) {
             await supabase.from('google_tokens').delete().eq('user_id', userId);
             return NextResponse.json({ error: 'Authentication failed with Google Calendar. Please reconnect.' }, { status: 401 });
         }
          if (statusCode === 403) {
             return NextResponse.json({ error: 'Permission denied to read Google Calendar events.' }, { status: 403 });
         }
         return NextResponse.json({ error: errorMessage }, { status: typeof statusCode === 'number' ? statusCode : 500 });
    }

    // 5. Return fetched events
    return NextResponse.json({ events: fetchedEvents });

  } catch (error) {
    console.error('[API /calendar/events] General Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
