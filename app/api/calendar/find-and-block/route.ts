import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { google } from "googleapis"
import { OAuth2Client } from "google-auth-library"

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  console.log("User authenticated:", user.id)

  // Step 5b: Retrieve Google Tokens
  const { data: tokenData, error: tokenError } = await supabase
    .from('google_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', user.id)
    .single() // Expecting only one row per user

  if (tokenError) {
    console.error("Error fetching Google tokens:", tokenError)
    if (tokenError.code === 'PGRST116') { // code for 'No rows found'
      return new NextResponse(JSON.stringify({ error: "Google Calendar not connected or token not found." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    return new NextResponse(JSON.stringify({ error: "Database error fetching tokens." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!tokenData) {
    // This case should ideally be caught by .single() error PGRST116, but added for robustness
    return new NextResponse(JSON.stringify({ error: "Google Calendar not connected or token not found." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { access_token, refresh_token, expires_at } = tokenData
  console.log("Successfully retrieved Google tokens for user:", user.id)
  // console.log("Access Token:", access_token); // Be careful logging tokens
  // console.log("Refresh Token:", refresh_token);
  // console.log("Expires At:", expires_at);

  // Step 5c: Setup Google API Client
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Missing Google Client ID or Secret in environment variables")
    return new NextResponse(JSON.stringify({ error: "Server configuration error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
    // Redirect URI is not strictly needed here as we are not initiating auth flow,
    // but could be added for completeness if desired.
  );

  oauth2Client.setCredentials({
    access_token: access_token,
    refresh_token: refresh_token,
    // Convert Supabase timestamp (seconds or ISO string) to milliseconds if needed
    // expiry_date: expires_at ? new Date(expires_at).getTime() : undefined,
  });

  // Instantiate the Calendar API client
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  console.log("Google API client initialized successfully.")

  // TODO: Handle token expiry and refresh (Step 5f part 1)
  // TODO: Implement Step 5d: Fetch free/busy info
  // TODO: Implement Step 5e: Find slots
  // TODO: Implement Step 5f part 2: Create events
  // TODO: Implement Step 5g: Error handling for Google API calls

  // Placeholder success response
  return NextResponse.json({ message: "Google API client initialized. Blocking logic pending." })
} 