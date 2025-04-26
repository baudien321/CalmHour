import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

// Ensure necessary types are available (may resolve 'process' errors in some environments)
// import '@types/node'; -- Removed this incorrect import

interface DeleteFocusTimeRequestBody {
  calendarId: string;
  eventId: string;
}

export async function POST(req: NextRequest) {
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
            console.error('Failed to set cookie:', name, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.error('Failed to remove cookie:', name, error);
          }
        },
      },
    }
  );

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('Error getting session or no session:', sessionError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: providerData, error: providerError } = await supabase
    .from('google_tokens')
    .select('access_token, refresh_token')
    .eq('user_id', session.user.id)
    .single();

  if (providerError || !providerData) {
    console.error('Error fetching provider tokens:', providerError);
    const status = providerError?.code === 'PGRST116' ? 404 : 500;
    const message = status === 404 ? 'Google Calendar connection not found.' : 'Database error fetching tokens.';
    return NextResponse.json({ error: message }, { status });
  }

  const { access_token: accessToken, refresh_token: refreshToken } = providerData;

  if (!accessToken) {
    console.error('Access token not found');
    return NextResponse.json({ error: 'Google access token not found' }, { status: 400 });
  }

  let body: DeleteFocusTimeRequestBody;
  try {
    body = await req.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }


  const { calendarId, eventId } = body;

  if (!calendarId || !eventId) {
    return NextResponse.json({ error: 'Missing calendarId or eventId' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.NEXT_PUBLIC_REDIRECT_URI! // Ensure this matches your Google Cloud Console setup
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken // Include refresh token if you need to handle expired access tokens
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    console.log(`Attempting to delete event: ${eventId} from calendar: ${calendarId}`);


    await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
    });

    console.log(`Successfully deleted event: ${eventId}`);

    // Ensure a JSON body is returned on success (even if Google API gave 204)
    return NextResponse.json({ message: 'Focus time deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting Google Calendar event: ${eventId}`, error.response?.data || error.message || error);
    // Check for specific Google API errors if needed
    if (error.code === 404 || error.code === 410) {
       // Return 200 with a message if event is already gone
       return NextResponse.json({ message: 'Event already deleted or not found', eventId: eventId }, { status: 200 });
    }
    return NextResponse.json({ error: 'Failed to delete focus time', details: error.message || 'Unknown error' }, { status: 500 });
  }
} 