import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface UserSettings {
  auto_schedule_enabled: boolean;
}

// GET handler to fetch current settings
export async function GET(request: NextRequest) {
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the setting from the users table (assuming column exists)
    const { data, error } = await supabase
      .from('users')
      .select('auto_schedule_enabled')
      .eq('id', user.id)
      .single();

    if (error) {
       // Handle case where user might not have an entry in users table yet or column doesn't exist
      if (error.code === 'PGRST116') { // PostgREST error code for no rows found
        console.warn(`[API /user/settings GET] No user record found for ${user.id}, returning default settings.`);
        return NextResponse.json({ auto_schedule_enabled: false }); // Return default false
      } else if (error.message.includes('column "auto_schedule_enabled" does not exist')) {
         console.error(`[API /user/settings GET] Column 'auto_schedule_enabled' does not exist in 'users' table.`);
          return NextResponse.json({ error: "Server configuration error: Auto-schedule setting not available."}, { status: 500 });
      }
      console.error('[API /user/settings GET] Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Return the fetched setting (or default if null/undefined)
    return NextResponse.json({ 
        auto_schedule_enabled: data?.auto_schedule_enabled ?? false 
    });

  } catch (error: any) {
    console.error('[API /user/settings GET] General Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST handler to update settings
export async function POST(request: NextRequest) {
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    let settingsToUpdate: Partial<UserSettings>;
    try {
        const body = await request.json();
        // Basic validation: ensure auto_schedule_enabled is a boolean if provided
        if (body && typeof body.auto_schedule_enabled === 'boolean') {
            settingsToUpdate = { auto_schedule_enabled: body.auto_schedule_enabled };
        } else {
             throw new Error('Invalid settings format. Provide { "auto_schedule_enabled": boolean }.');
        }
    } catch (parseError) {
         return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    
    // Update the setting in the users table
    const { data, error } = await supabase
      .from('users')
      .update(settingsToUpdate)
      .eq('id', user.id)
      .select('auto_schedule_enabled') // Select the updated value to return
      .single(); // Use single() to ensure only one row is updated and returned

     if (error) {
       // Handle specific errors like column not existing
        if (error.message.includes('column "auto_schedule_enabled" does not exist')) {
           console.error(`[API /user/settings POST] Column 'auto_schedule_enabled' does not exist in 'users' table.`);
            return NextResponse.json({ error: "Server configuration error: Auto-schedule setting cannot be updated."}, { status: 500 });
        }
        console.error('[API /user/settings POST] Error updating settings:', error);
         // Check if the error code indicates no rows were updated (e.g., user ID not found in users table, unlikely if auth worked)
         if (error.code === 'PGRST116') { 
             console.warn(`[API /user/settings POST] User record not found for update: ${user.id}`);
             return NextResponse.json({ error: 'User settings not found.'}, { status: 404 });
         }
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
    
    if (!data) {
        // This case might happen if the update affected 0 rows but didn't error
        console.warn(`[API /user/settings POST] Update completed but no data returned for user ${user.id}`);
         return NextResponse.json({ error: 'Failed to confirm settings update.'}, { status: 500 });
    }

    console.log(`[API /user/settings POST] User ${user.id} updated auto_schedule_enabled to ${data.auto_schedule_enabled}`);
    // Return the updated setting
    return NextResponse.json({ auto_schedule_enabled: data.auto_schedule_enabled });

  } catch (error: any) {
    console.error('[API /user/settings POST] General Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 