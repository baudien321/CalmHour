import { createClient } from "@/lib/supabase/server";
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Construct dashboard URL for redirection
  const dashboardUrl = new URL('/dashboard', origin);

  // 1. Handle case where user denied access
  if (error) {
    console.error(`Google OAuth Error: ${error}`);
    dashboardUrl.searchParams.set('calendar_error', 'Permissions denied by user.');
    return NextResponse.redirect(dashboardUrl);
  }

  // 2. Handle case where code is missing (shouldn't happen normally)
  if (!code) {
    console.error('Google OAuth Callback: Missing code parameter.');
    dashboardUrl.searchParams.set('calendar_error', 'Authorization code missing.');
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Get Supabase client and check for authenticated user
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('API route accessed without authenticated user or auth error:', authError);
    // Redirect to home or an error page if user session lost during OAuth flow
    return redirect('/');
  }

  // 4. Retrieve Google Credentials from environment
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables.');
    dashboardUrl.searchParams.set('calendar_error', 'Server configuration error.');
    return NextResponse.redirect(dashboardUrl);
  }

  // 5. Determine the redirect URI used in the *initial* request (must match)
  //    This needs to be consistent with the one sent in the /connect route
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/auth/google/calendar/callback`;

  try {
    // 6. Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Failed to exchange Google auth code for tokens:', tokens);
      throw new Error(tokens.error_description || 'Failed to fetch tokens from Google');
    }

    const { access_token, refresh_token, expires_in } = tokens;

    if (!access_token) {
        console.error('Missing access_token in Google token response:', tokens);
        throw new Error('Missing access_token from Google');
    }

    // 7. Calculate expiry timestamp (expires_in is in seconds)
    const expires_at = Math.floor(Date.now() / 1000) + expires_in;

    // 8. Store tokens securely in the database (upsert handles new or existing)
    const { error: dbError } = await supabase
      .from('google_tokens')
      .upsert({
        user_id: user.id,
        access_token: access_token,
        refresh_token: refresh_token, // May be null if user previously authorized without offline access
        expires_at: new Date(expires_at * 1000).toISOString(), // Convert to ISO string for timestamptz
      });

    if (dbError) {
      console.error('Error saving Google tokens to database:', dbError);
      throw new Error('Could not save calendar credentials.');
    }

    // 9. Redirect back to dashboard on success
    dashboardUrl.searchParams.set('calendar_connected', 'true');
    return NextResponse.redirect(dashboardUrl);

  } catch (err: any) {
    console.error('Error in Google Calendar callback:', err);
    dashboardUrl.searchParams.set('calendar_error', err.message || 'An unexpected error occurred.');
    return NextResponse.redirect(dashboardUrl);
  }
} 