import { createClient } from "@/lib/supabase/server";
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { getSiteUrl } from '@/lib/config';

export async function GET(request: Request) {
  // 1. Get Supabase client and check for authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This should technically be handled by middleware, but double-check
    console.error('API route accessed without authenticated user.');
    // Redirect to home or an error page
    return redirect('/');
  }

  // 2. Get Google Client ID from environment variables
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    console.error('GOOGLE_CLIENT_ID is not set in environment variables.');
    // TODO: Return a proper error response
    return new NextResponse('Server configuration error', { status: 500 });
  }

  // 3. Determine the callback URL for *this* flow
  const siteUrl = getSiteUrl(request);
  const redirectUri = `${siteUrl}/api/auth/google/calendar/callback`;

  // 4. Define required scopes
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  // 5. Construct the Google OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', googleClientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('access_type', 'offline'); // Request refresh token
  authUrl.searchParams.set('prompt', 'consent'); // Force consent screen for refresh token
  // Optional: Add state parameter for CSRF protection later if needed
  // authUrl.searchParams.set('state', 'SOME_RANDOM_CSRF_TOKEN');

  // 6. Redirect the user to Google
  return NextResponse.redirect(authUrl.toString());
} 