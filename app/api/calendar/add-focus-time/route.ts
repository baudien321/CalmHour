import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { 
  addMinutes, 
  isWeekend, 
  isBefore, 
  isAfter, 
  startOfDay, 
  endOfDay, 
  setHours, 
  setMinutes, 
  parseISO, 
  formatISO,
  addDays,
  max,
  differenceInMinutes
} from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Default working hours (adjust as needed)
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17; 
const DEFAULT_TIMEZONE = 'America/New_York'; // Example timezone, ideally get from user settings later

interface AddFocusTimeRequestBody {
  duration: number; // Duration in minutes
  sessionName?: string;
  priority?: 'high' | 'medium' | 'low'; // Add priority
  startTime?: string; // <-- Add optional specific start time (ISO string)
}

// Google Calendar Color IDs (Examples - adjust as desired)
// See: https://developers.google.com/calendar/api/v3/reference/colors
const PRIORITY_COLOR_MAP = {
  high: '11',   // Red
  medium: '5',  // Yellow
  low: '2',     // Green
  default: '8' // Default Grey/Blue if no priority given
};

// Helper function to find the next available slot
async function findNextAvailableSlot(
  calendar: ReturnType<typeof google.calendar>, 
  durationMinutes: number, 
  userTimeZone: string = DEFAULT_TIMEZONE,
  authClient: typeof google.auth.OAuth2 | any // Using 'any' for simplicity, ideally import OAuth2Client type
): Promise<{ start: string, end: string } | null> {
  
  const now = new Date();
  let searchStart = toZonedTime(now, userTimeZone); 
  
  const workStartTimeToday = setMinutes(setHours(searchStart, WORK_START_HOUR), 0);
  const workEndTimeToday = setMinutes(setHours(searchStart, WORK_END_HOUR), 0);

  if (isAfter(searchStart, workEndTimeToday) || isWeekend(searchStart)) {
      searchStart = startOfDay(addDays(searchStart, isWeekend(searchStart) ? (searchStart.getDay() === 6 ? 2 : 1) : 1));
      searchStart = setMinutes(setHours(searchStart, WORK_START_HOUR), 0);
  } else {
      searchStart = max([searchStart, workStartTimeToday]);
  }

  const searchEndLimit = addDays(searchStart, 7);
  console.log(`[findNextAvailableSlot] Searching for ${durationMinutes} min slot...`);

  // Define params first
  const freeBusyParams = {
      requestBody: {
          // Ensure ISO string includes timezone offset
          timeMin: formatISO(searchStart),
          timeMax: formatISO(searchEndLimit),
          items: [{ id: 'primary' }],
          timeZone: userTimeZone,
        }
  };

  // --- DEBUG LOGGING (IMMEDIATELY BEFORE CALL) ---
  console.log("--- [findNextAvailableSlot] CREDS JUST BEFORE freebusy QUERY:", JSON.stringify(authClient.credentials));
  console.log("--- [findNextAvailableSlot] PARAMS FOR freebusy QUERY:", JSON.stringify(freeBusyParams)); // Log the defined params
  // --- END DEBUG LOGGING ---

  try {
    // Use the defined params variable here
    const freeBusyResponse = await calendar.freebusy.query(freeBusyParams);

    const busyTimes = freeBusyResponse.data.calendars?.primary?.busy;
    if (!busyTimes) {
        console.log("[findNextAvailableSlot] No busy times found, checking first possible slot.");
        let potentialStart = searchStart;
        let potentialEnd = addMinutes(potentialStart, durationMinutes);
        const dayWorkEnd = setMinutes(setHours(potentialStart, WORK_END_HOUR), 0);
        while (isWeekend(potentialStart)) {
            potentialStart = startOfDay(addDays(potentialStart, potentialStart.getDay() === 6 ? 2 : 1));
            potentialStart = setMinutes(setHours(potentialStart, WORK_START_HOUR), 0);
            potentialEnd = addMinutes(potentialStart, durationMinutes);
        }
        const currentDayWorkEnd = setMinutes(setHours(potentialStart, WORK_END_HOUR), 0);
        if (isBefore(potentialEnd, currentDayWorkEnd)) {
            console.log(`[findNextAvailableSlot] Found immediate slot: ${formatISO(potentialStart)}`);
            return { start: formatISO(potentialStart), end: formatISO(potentialEnd) };
        } else {
             console.log("[findNextAvailableSlot] Immediate slot extends past working hours.");
              potentialStart = startOfDay(addDays(potentialStart, 1)); 
              while (isWeekend(potentialStart)) {
                  potentialStart = startOfDay(addDays(potentialStart, potentialStart.getDay() === 6 ? 2 : 1));
              }
              potentialStart = setMinutes(setHours(potentialStart, WORK_START_HOUR), 0);
              potentialEnd = addMinutes(potentialStart, durationMinutes);
              const nextDayWorkEnd = setMinutes(setHours(potentialStart, WORK_END_HOUR), 0);
               if (isBefore(potentialEnd, nextDayWorkEnd)) {
                   console.log(`[findNextAvailableSlot] Found slot next working day: ${formatISO(potentialStart)}`);
                   return { start: formatISO(potentialStart), end: formatISO(potentialEnd) };
               } else {
                   console.log("[findNextAvailableSlot] Could not find slot even on next working day start.");
                   return null;
               }
        }
    }

    console.log(`[findNextAvailableSlot] Found ${busyTimes.length} busy intervals.`);
    busyTimes.sort((a, b) => parseISO(a.start!).getTime() - parseISO(b.start!).getTime());
    let lastEndTime = searchStart;
    for (const busy of busyTimes) {
      const busyStart = toZonedTime(parseISO(busy.start!), userTimeZone);
      const busyEnd = toZonedTime(parseISO(busy.end!), userTimeZone);
      let potentialSlotStart = lastEndTime;
      while(isWeekend(potentialSlotStart) || isBefore(potentialSlotStart, setMinutes(setHours(potentialSlotStart, WORK_START_HOUR), 0))) {
          potentialSlotStart = startOfDay(addDays(potentialSlotStart, isWeekend(potentialSlotStart) ? (potentialSlotStart.getDay() === 6 ? 2 : 1) : 1));
          potentialSlotStart = setMinutes(setHours(potentialSlotStart, WORK_START_HOUR), 0);
      }
      const potentialSlotEnd = addMinutes(potentialSlotStart, durationMinutes);
      const currentDayWorkEnd = setMinutes(setHours(potentialSlotStart, WORK_END_HOUR), 0);
      if (isBefore(potentialSlotEnd, busyStart) && isBefore(potentialSlotEnd, currentDayWorkEnd)) {
        console.log(`[findNextAvailableSlot] Found slot before busy interval ${busy.start}: ${formatISO(potentialSlotStart)}`);
        return { start: formatISO(potentialSlotStart), end: formatISO(potentialSlotEnd) };
      }
      lastEndTime = max([lastEndTime, busyEnd]); 
    }
    let finalPotentialStart = lastEndTime;
    while(isWeekend(finalPotentialStart) || isBefore(finalPotentialStart, setMinutes(setHours(finalPotentialStart, WORK_START_HOUR), 0))) {
          finalPotentialStart = startOfDay(addDays(finalPotentialStart, isWeekend(finalPotentialStart) ? (finalPotentialStart.getDay() === 6 ? 2 : 1) : 1));
          finalPotentialStart = setMinutes(setHours(finalPotentialStart, WORK_START_HOUR), 0);
    }
    const finalPotentialEnd = addMinutes(finalPotentialStart, durationMinutes);
    const finalDayWorkEnd = setMinutes(setHours(finalPotentialStart, WORK_END_HOUR), 0);
    if (isBefore(finalPotentialEnd, finalDayWorkEnd) && isBefore(finalPotentialStart, searchEndLimit) ) {
      console.log(`[findNextAvailableSlot] Found slot after last busy interval: ${formatISO(finalPotentialStart)}`);
      return { start: formatISO(finalPotentialStart), end: formatISO(finalPotentialEnd) };
    }
    console.log("[findNextAvailableSlot] No suitable slot found within the search range.");
    return null;

  } catch (error: any) {
    // Log the *original* error from Google API
    console.error('[findNextAvailableSlot] Error querying free/busy:', error);
    // Construct a more informative error message
    let detailedErrorMessage = 'Failed to query Google Calendar free/busy information.';
    if (error.response?.data?.error?.message) {
      // Try to get the specific message from Google
      detailedErrorMessage += ` Google Error: ${error.response.data.error.message}`;
    } else if (error.message) {
       detailedErrorMessage += ` Details: ${error.message}`;
    }
    // Throw the more detailed error
    throw new Error(detailedErrorMessage);
  }
}


export async function POST(request: NextRequest) {
  // Await cookies() here
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // 2. Parse request body
    let duration: number;
    let sessionName: string | undefined;
    let priority: 'high' | 'medium' | 'low' | undefined;
    let startTimeISO: string | undefined; // <-- Variable for specific start time
    try {
        const body: AddFocusTimeRequestBody = await request.json();
        duration = body.duration;
        sessionName = body.sessionName;
        priority = body.priority;
        startTimeISO = body.startTime; // <-- Get startTime from body

        if (typeof duration !== 'number' || duration <= 0) {
            throw new Error('Invalid duration provided.');
        }
        // Optional: Validate priority value if needed
        if (priority && !['high', 'medium', 'low'].includes(priority)) {
             console.warn(`[API /add-focus-time] Invalid priority value received: ${priority}. Using default color.`);
             priority = undefined; // Reset to default if invalid
        }
        // Optional: Validate startTimeISO format if provided
        if (startTimeISO) {
            try {
                parseISO(startTimeISO); // Attempt to parse to validate format
            } catch (timeParseError) {
                 console.warn(`[API /add-focus-time] Invalid startTime format received: ${startTimeISO}. Will attempt auto-scheduling.`);
                 startTimeISO = undefined; // Treat as invalid, fall back to auto-scheduling
            }
        }
    } catch (parseError) {
         return NextResponse.json({ error: 'Invalid request body. Ensure "duration" (number in minutes) is provided.' }, { status: 400 });
    }

    // 3. Retrieve Google tokens including scopes
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('access_token, refresh_token, expires_at, scopes') // Add scopes to select
      .eq('user_id', userId)
      .single();
      
    console.log(`[API /add-focus-time] Raw tokenData received from DB for user ${userId}:`, JSON.stringify(tokenData));
    if (tokenError) { console.error(`[API /add-focus-time] Error fetching tokenData from DB:`, tokenError); }

    if (tokenError || !tokenData) {
        const status = tokenError?.code === 'PGRST116' ? 400 : 500;
        const message = tokenError?.code === 'PGRST116' ? 'Google Calendar not connected.' : 'Database error fetching tokens.';
        return NextResponse.json({ error: message }, { status });
    }

    // --- Google Client Setup & Token Refresh --- 
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    
    let currentAccessToken = tokenData.access_token;
    const currentRefreshToken = tokenData.refresh_token;
    const expires_at_from_db = tokenData.expires_at;
    const scopes_from_db = tokenData.scopes; // Get scopes from DB
    
    console.log(`[API /add-focus-time] Parsed expires_at from DB: ${expires_at_from_db} (Type: ${typeof expires_at_from_db})`);
    console.log(`[API /add-focus-time] Parsed scopes from DB: ${scopes_from_db}`); // Log scopes

    const expiryBufferSeconds = 5 * 60; 
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Calculate expiresAtSeconds carefully, handling potential null/invalid date strings
    let expiresAtSeconds = 0;
    if (expires_at_from_db && typeof expires_at_from_db === 'string') {
        try {
            const expiryDate = new Date(expires_at_from_db);
            expiresAtSeconds = Math.floor(expiryDate.getTime() / 1000);
            if (isNaN(expiresAtSeconds)) { // Check if Date parsing failed
                console.warn(`[API /add-focus-time] Failed to parse expires_at date string: ${expires_at_from_db}. Treating as expired.`);
                expiresAtSeconds = 0;
            }
        } catch (dateError) {
            console.warn(`[API /add-focus-time] Error parsing expires_at date string: ${expires_at_from_db}. Treating as expired.`, dateError);
            expiresAtSeconds = 0;
        }
    } else {
        console.warn(`[API /add-focus-time] expires_at from DB is null, undefined, or not a string: ${expires_at_from_db}. Treating as expired.`);
    }
    
    // Log credentials BEFORE potentially setting/refreshing
    // Note: expires_at here is the calculated seconds or 0
    console.log("[API /add-focus-time] Credentials BEFORE refresh check:", JSON.stringify({ access_token: currentAccessToken, refresh_token: currentRefreshToken, expires_at: expiresAtSeconds, scopes: scopes_from_db }));

    // Set initial credentials, INCLUDING scopes
    oauth2Client.setCredentials({ 
        access_token: currentAccessToken, 
        refresh_token: currentRefreshToken,
        scope: scopes_from_db // Set the scope here
    });

    // Check if refresh is needed
    if (currentRefreshToken && expiresAtSeconds < (nowSeconds + expiryBufferSeconds)) {
      console.log('[API /add-focus-time] Refreshing token...');
      
      // Log credentials JUST BEFORE refresh call
      console.log("[API /add-focus-time] Credentials JUST BEFORE refreshAccessToken call:", JSON.stringify(oauth2Client.credentials));
      
      try {
        // Attempt token refresh
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Log the RAW credentials object received from refreshAccessToken
        console.log("--- [POST] RAW Credentials from refreshAccessToken:", JSON.stringify(credentials));
        
        // Extract details from the refreshed credentials
        const newAccessToken = credentials.access_token;
        const newExpiryDate = credentials.expiry_date;
        const newRefreshToken = credentials.refresh_token;
        const newScopes = credentials.scope; // Get scopes from refresh response

        // Update Supabase with the potentially new tokens
        const { error: updateError } = await supabase.from('google_tokens').update({
            access_token: newAccessToken, 
            expires_at: newExpiryDate ? new Date(newExpiryDate).toISOString() : null,
            refresh_token: newRefreshToken || currentRefreshToken, 
            scopes: newScopes || scopes_from_db // Update scopes if received, else keep old
        }).eq('user_id', userId); 
        
        if (updateError) {
            // Log error but proceed cautiously, maybe the client update is enough?
            console.error('[API /add-focus-time] Failed to update refreshed token in DB:', updateError);
        } else {
             console.log("[API /add-focus-time] Token refreshed and updated in DB.");
         }
         
         // CRITICAL: Update the oauth2Client instance with the NEW credentials
         // Use the values directly obtained from the refresh response
         oauth2Client.setCredentials({
             access_token: newAccessToken,
             refresh_token: newRefreshToken || currentRefreshToken,
             scope: newScopes || scopes_from_db // Ensure scope is set after refresh too
         });
         // Log credentials AFTER successful refresh and client update
         console.log("[API /add-focus-time] Credentials AFTER successful refresh and setCredentials:", JSON.stringify(oauth2Client.credentials));

      } catch (refreshError: any) {
        console.error('[API /add-focus-time] Failed to refresh token:', refreshError);
         await supabase.from('google_tokens').delete().eq('user_id', userId);
         return NextResponse.json({ error: `Failed to refresh token: ${refreshError.message || 'Unknown'}. Please reconnect.` }, { status: 401 });
      }
    } else {
        // Log credentials if no refresh was needed
        console.log("[API /add-focus-time] Token refresh not needed. Using existing credentials:", JSON.stringify(oauth2Client.credentials));
    }
    // --- End Google Client Setup & Token Refresh --- 

    // --- DEBUG LOGGING (IMMEDIATELY BEFORE google.calendar call) ---
    console.log("--- [POST] CREDS JUST BEFORE google.calendar call:", JSON.stringify(oauth2Client.credentials));
    // --- END DEBUG LOGGING ---

    // Create the calendar API client AFTER potentially refreshing and setting credentials
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // --- Determine Event Start/End Time --- 
    let eventStartISO: string = ""; // Initialize with empty string
    let eventEndISO: string = "";   // Initialize with empty string
    let userTimeZone = DEFAULT_TIMEZONE; // Use default for now

    if (startTimeISO) {
        // Use the provided start time
        console.log(`[API /add-focus-time] Using provided start time: ${startTimeISO}`);
        try {
            const startDate = parseISO(startTimeISO);
            const endDate = addMinutes(startDate, duration);
            eventStartISO = formatISO(startDate); 
            eventEndISO = formatISO(endDate);
            // Optionally try to determine user timezone if needed for event data,
            // but Google Calendar API handles ISO strings well.
        } catch (e) {
             console.error("[API /add-focus-time] Error calculating end time from provided start time. Falling back to auto-find.", e);
             // Fallback to auto-find if calculation fails for some reason
             startTimeISO = undefined; 
        }
    }
    
    // If no valid startTimeISO was provided or calculation failed, find next available slot
    if (!startTimeISO && !eventStartISO) { // Check if still unassigned
        console.log("[API /add-focus-time] No specific start time provided or fallback triggered. Finding next available slot...");
        // Get user timezone (optional enhancement)
        // const { data: profile } = await supabase.from('profiles').select('timezone').eq('id', userId).single();
        // userTimeZone = profile?.timezone || DEFAULT_TIMEZONE;
        
        try {
           const availableSlot = await findNextAvailableSlot(calendar, duration, userTimeZone, oauth2Client);
           if (!availableSlot) {
               // Throw an error instead of returning directly to be caught by the main try/catch
               throw new Error('Could not find an available time slot.');
           }
           eventStartISO = availableSlot.start;
           eventEndISO = availableSlot.end;
        } catch (findSlotError: any) {
             // Re-throw error to be caught by the main handler
             console.error("[API /add-focus-time] Error during findNextAvailableSlot:", findSlotError.message);
             throw findSlotError; 
        }
    }
    // --- END Determine Event Start/End Time ---

    // 5. Prepare event data
    const eventSummary = (sessionName && sessionName.trim() !== '') ? sessionName.trim() : 'Focus Time';
    const eventColorId = PRIORITY_COLOR_MAP[priority || 'default'];
    const eventDescription = `Scheduled via CalmHour. Duration: ${duration} minutes. Priority: ${priority || 'default'}.`;

    const event = {
        summary: eventSummary,
        description: eventDescription,
        start: {
            dateTime: eventStartISO,
            // timeZone: userTimeZone, // Can specify timezone, but ISO usually sufficient
        },
        end: {
            dateTime: eventEndISO,
            // timeZone: userTimeZone,
        },
        colorId: eventColorId, 
        // ** ADD extendedProperties to mark as CalmHour block **
        extendedProperties: {
          private: {
            "calmhourFocusBlock": "true"
          }
        },
        // Optional: Add reminders, etc.
        reminders: {
            useDefault: false,
            overrides: [
                // { method: 'popup', minutes: 10 }, // Example: 10-minute popup reminder
            ],
        },
    };

    // --- DEBUG LOGGING BEFORE INSERT ---
    console.log(`[API /add-focus-time] Attempting to insert event: ${JSON.stringify(event)}`);
    console.log("--- [API /add-focus-time] CREDS JUST BEFORE event INSERT:", JSON.stringify(oauth2Client.credentials));
    // --- END DEBUG LOGGING ---

    // 6. Insert event into Google Calendar
    const createdEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
    });

    console.log('[API /add-focus-time] Event created successfully:', createdEvent.data.id);

    // 7. Return success response
    return NextResponse.json({
        message: 'Focus time scheduled successfully!',
        event: {
            id: createdEvent.data.id,
            summary: createdEvent.data.summary,
            start: createdEvent.data.start?.dateTime || createdEvent.data.start?.date,
            end: createdEvent.data.end?.dateTime || createdEvent.data.end?.date,
            link: createdEvent.data.htmlLink,
        }
    });

  } catch (error: any) {
    console.error('[API /add-focus-time] Error:', error);
    // Try to provide more specific error messages
    let errorMessage = "An unexpected error occurred while scheduling focus time.";
    let statusCode = 500;
    if (error.message.includes('Google Calendar not connected')) {
         errorMessage = error.message;
         statusCode = 400;
    } else if (error.message.includes('Could not find an available time slot')) {
         errorMessage = error.message;
         statusCode = 409; 
    } else if (error.message.includes('Failed to query Google Calendar')) {
         errorMessage = error.message; // Pass detailed message from findNextAvailableSlot
         statusCode = 502; // Bad Gateway might fit if upstream Google API failed
    } else if (error.response?.data?.error?.message) {
        // Extract Google API specific errors if possible
        errorMessage = `Google API Error: ${error.response.data.error.message}`;
        statusCode = error.response.status || 500;
    } else if (error.message) {
        errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 