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
  const supabase = await createClient();
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

    // --- START DEBUG LOGGING ---
    console.log("[Callback] Full token response received from Google:", JSON.stringify(tokens));
    // --- END DEBUG LOGGING ---

    if (!tokenResponse.ok) {
      console.error('Failed to exchange Google auth code for tokens:', tokens);
      throw new Error(tokens.error_description || 'Failed to fetch tokens from Google');
    }

    // Extract necessary fields (including scope for potential logging/validation later)
    const { access_token, refresh_token, expires_in, scope } = tokens;

    // Log the specific scope received
    console.log(`[Callback] Granted Scopes: ${scope}`);

    if (!access_token) {
        console.error('Missing access_token in Google token response:', tokens);
        throw new Error('Missing access_token from Google');
    }

    // --- START expires_in / expires_at DEBUGGING ---
    console.log(`[Callback] Received expires_in: ${expires_in} (Type: ${typeof expires_in})`);
    
    let calculated_expires_at_timestamp: number | null = null;
    let expires_at_iso: string | null = null;

    if (typeof expires_in !== 'number' || expires_in <= 0) {
        console.error(`[Callback] Invalid expires_in value received: ${expires_in}. Cannot calculate expiry.`);
        // Decide how to handle: throw error, store null, or use a default fallback?
        // For now, we will allow storing null, but this might cause issues later.
    } else {
    // 7. Calculate expiry timestamp (expires_in is in seconds)
        calculated_expires_at_timestamp = Math.floor(Date.now() / 1000) + expires_in;
        console.log(`[Callback] Calculated expires_at UNIX timestamp: ${calculated_expires_at_timestamp}`);
        try {
            expires_at_iso = new Date(calculated_expires_at_timestamp * 1000).toISOString();
            console.log(`[Callback] Calculated expires_at ISO string: ${expires_at_iso}`);
        } catch (dateError) {
            console.error(`[Callback] Error converting calculated timestamp to ISO string:`, dateError);
            // Decide how to handle: throw error or store null?
            expires_at_iso = null; 
        }
    }
    // --- END expires_in / expires_at DEBUGGING ---

    // 8. Store tokens securely in the database (upsert handles new or existing)
    const { error: dbError } = await supabase
      .from('google_tokens')
      .upsert({
        user_id: user.id,
        access_token: access_token,
        refresh_token: refresh_token, 
        expires_at: expires_at_iso,
        scopes: scope,
      });

    // --- START DEBUG LOGGING (AFTER UPSERT) ---
    if (dbError) {
      console.error('[Callback] Error during Supabase upsert:', dbError);
      throw new Error('Could not save calendar credentials.');
    } else {
      console.log(`[Callback] Supabase upsert completed successfully for user ${user.id}. expires_at sent: ${expires_at_iso}, scopes sent: ${scope}`);
    }
    // --- END DEBUG LOGGING (AFTER UPSERT) ---

    // 9. Redirect back to dashboard on success
    dashboardUrl.searchParams.set('calendar_connected', 'true');
    return NextResponse.redirect(dashboardUrl);

  } catch (err: any) {
    console.error('Error in Google Calendar callback:', err);
    dashboardUrl.searchParams.set('calendar_error', err.message || 'An unexpected error occurred.');
    return NextResponse.redirect(dashboardUrl);
  }
} 