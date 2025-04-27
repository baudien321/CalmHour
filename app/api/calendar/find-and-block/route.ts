import { google } from 'googleapis';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => { try { cookieStore.set({ name, value, ...options }); } catch (error) { /* Ignore */ } },
        remove: (name: string, options: CookieOptions) => { try { cookieStore.set({ name, value: '', ...options }); } catch (error) { /* Ignore */ } },
      },
    }
  );

  try {
    // 1. Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Retrieve user's Google tokens from the database
  const { data: tokenData, error: tokenError } = await supabase
    .from('google_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      console.error('Error fetching tokens:', tokenError);
      if (tokenError?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Google Calendar not connected. Please connect your calendar first.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Database error fetching tokens.' }, { status: 500 });
    }

    // 3. Set up Google API client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
    );

    let currentAccessToken = tokenData.access_token;
    let currentRefreshToken = tokenData.refresh_token;
    const expiryBufferSeconds = 5 * 60;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expiresAtSeconds = tokenData.expires_at ? Number(tokenData.expires_at) : 0;

    if (currentRefreshToken && expiresAtSeconds < (nowSeconds + expiryBufferSeconds)) {
      console.log('Google token expired or nearing expiry. Attempting refresh...');
      oauth2Client.setCredentials({ refresh_token: currentRefreshToken });
      
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        console.log('Token refreshed successfully.');
        
        const newAccessToken = credentials.access_token;
        const newExpiryDate = credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null;

        const { error: updateError } = await supabase
          .from('google_tokens')
          .update({
             access_token: newAccessToken,
             expires_at: newExpiryDate,
             refresh_token: credentials.refresh_token || currentRefreshToken 
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Failed to update refreshed token in database:', updateError);
        }
        
        currentAccessToken = newAccessToken;
  oauth2Client.setCredentials({
          access_token: newAccessToken, 
          refresh_token: credentials.refresh_token || currentRefreshToken 
        });

      } catch (refreshError) {
        console.error('Failed to refresh Google token:', refreshError);
        // Add type check for refreshError before accessing properties
        let errorMessage = 'Unknown error during token refresh';
        if (typeof refreshError === 'object' && refreshError !== null && 'message' in refreshError) {
          errorMessage = (refreshError as Error).message;
        } else if (typeof refreshError === 'string') {
          errorMessage = refreshError;
        }
         console.error('Failed to refresh Google token:', errorMessage);
         // If refresh fails (e.g., invalid grant), the user might need to reconnect
         // Consider logging the specific error type if available (e.g., refreshError.response?.data)
         await supabase.from('google_tokens').delete().eq('user_id', user.id); // Optional: Clear invalid token
         return NextResponse.json({ error: `Failed to refresh Google Calendar connection: ${errorMessage}. Please reconnect your calendar.` }, { status: 401 }); // Unauthorized or Bad Request
      }
    } else {
       oauth2Client.setCredentials({
          access_token: currentAccessToken,
          refresh_token: currentRefreshToken,
        });
    }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 4. Define time range (next 7 days)
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMaxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const timeMax = timeMaxDate.toISOString();

    // 5. Fetch free/busy information
    console.log(`Fetching free/busy from ${timeMin} to ${timeMax}`);

    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin,
        timeMax: timeMax,
        items: [{ id: 'primary' }],
      },
    });

    // --- Implement logic to find slots --- 
    const busyTimes = freeBusyResponse.data.calendars?.primary?.busy || [];
    const foundSlots: { start: string; end: string }[] = [];
    const slotsNeeded = 3;
    const workingHoursStart = 9; // 9 AM
    const workingHoursEnd = 17; // 5 PM (exclusive for start time, e.g. 4 PM is last start)

    // Iterate through the next 7 days
    let currentDate = new Date(now.getTime()); // Start from today
    currentDate.setUTCHours(0, 0, 0, 0); // Start at the beginning of the day UTC

    for (let day = 0; day < 7 && foundSlots.length < slotsNeeded; day++) {
      const dayOfWeek = currentDate.getUTCDay(); // 0 = Sunday, 6 = Saturday

      // Check if it's a weekday (Monday=1 to Friday=5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Iterate through potential 1-hour slots within working hours (UTC)
        for (let hour = workingHoursStart; hour < workingHoursEnd && foundSlots.length < slotsNeeded; hour++) {
          const slotStart = new Date(currentDate.getTime());
          slotStart.setUTCHours(hour, 0, 0, 0);

          const slotEnd = new Date(slotStart.getTime());
          slotEnd.setUTCHours(hour + 1, 0, 0, 0);

          // Check if this slot is within the overall query range (safety check)
          if (slotStart.getTime() < timeMaxDate.getTime()) {
            // Check for conflicts with busy times
            let isBusy = false;
            for (const busyInterval of busyTimes) {
              const busyStart = new Date(busyInterval.start!).getTime();
              const busyEnd = new Date(busyInterval.end!).getTime();

              // Basic overlap check
              if (slotStart.getTime() < busyEnd && slotEnd.getTime() > busyStart) {
                isBusy = true;
                break; // No need to check further busy intervals for this slot
              }
            }

            // If the slot is not busy, add it to found slots
            if (!isBusy) {
              foundSlots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
              });
              console.log(`Found free slot: ${slotStart.toISOString()} - ${slotEnd.toISOString()}`);
            }
          }
        }
      }

      // Move to the next day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    console.log(`Found ${foundSlots.length} suitable slots.`);

    // --- Implement logic to create events using foundSlots --- 
    const createdEvents = [];
    let creationErrors = [];

    if (foundSlots.length > 0) {
      console.log('Attempting to create events for found slots...');
      for (const slot of foundSlots) {
        try {
          const event = {
            summary: 'Focus Block (CalmHour)', // Event title
            description: 'Scheduled by CalmHour to protect your focus time.',
            start: {
              dateTime: slot.start,
              // timeZone: 'UTC', // Explicitly set timezone if needed
            },
            end: {
              dateTime: slot.end,
              // timeZone: 'UTC', // Explicitly set timezone if needed
            },
            // Optional: Add reminders, color, etc.
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 10 },
              ],
            },
            // You can set a specific color via colorId (1-11)
            // colorId: '2' // Example: Green
            extendedProperties: {
              private: {
                "calmhourFocusBlock": "true"
              }
            },
          };

          const createdEvent = await calendar.events.insert({
            calendarId: 'primary', // Use 'primary' for the main calendar
            requestBody: event,
          });
          console.log('Event created: ', createdEvent.data.htmlLink);
          createdEvents.push(createdEvent.data);
        } catch (error) {
          console.error(`Error creating event for slot ${slot.start}:`, error);
          // Capture specific error details if available, with type check
          let errorMessage = 'Unknown error creating event';
          if (typeof error === 'object' && error !== null && 'response' in error) {
            const gError = error as { response?: { data?: { error?: { message?: string } } } };
            if (gError.response?.data?.error?.message) {
              errorMessage = `Google API Error: ${gError.response.data.error.message}`;
            }
          } else if (error instanceof Error) {
             errorMessage = error.message;
          }
          creationErrors.push({ slot: slot, error: errorMessage });
          // Decide if we should stop on first error or try creating others
          // For now, let's continue and report all errors
        }
      }
    }

    // --- Update response based on creation results --- 

    if (creationErrors.length > 0) {
      // If some events were created despite errors
      if (createdEvents.length > 0) {
         return NextResponse.json({
           message: `Successfully created ${createdEvents.length} focus blocks, but failed to create ${creationErrors.length} due to errors.`, 
           createdEventIds: createdEvents.map(e => e.id),
           errors: creationErrors
         }, { status: 207 }); // Multi-Status
      }
      // If all creations failed
      return NextResponse.json({
        message: `Failed to create any focus blocks. Encountered ${creationErrors.length} errors.`, 
        errors: creationErrors
      }, { status: 500 });
    }

    if (foundSlots.length === 0) {
       return NextResponse.json({ 
         message: 'No suitable 1-hour slots found in the next 7 weekdays. No events created.'
       }, { status: 200 }); 
    }
    
    if (foundSlots.length > 0 && createdEvents.length === 0 && creationErrors.length === 0) {
      // This case might occur if foundSlots had items but the loop didn't run or errored unexpectedly before pushing
      console.error("Logic error: Slots were found but no events were created and no errors logged.");
       return NextResponse.json({ 
         message: 'Found slots but failed to initiate event creation.'
       }, { status: 500 }); 
    }

    // Default success case: All found slots resulted in created events
    return NextResponse.json({ 
      message: `Successfully created ${createdEvents.length} focus blocks.`, 
      createdEventIds: createdEvents.map(e => e.id) 
    }); 

  } catch (error) {
    console.error('Error in find-and-block:', error);

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const gError = error as { response?: { data?: { error?: { message?: string } } } };
      if (gError.response?.data?.error?.message) {
        console.error('Google API Error Details:', gError.response.data.error);
        return NextResponse.json({ error: `Google API Error: ${gError.response.data.error.message}` }, { status: 500 });
      }
    }
    return NextResponse.json({ error: 'Internal Server Error occurred during calendar processing.' }, { status: 500 });
  }
} 