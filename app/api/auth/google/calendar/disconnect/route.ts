import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
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

    // 2. Delete the token from the database
    console.log(`[API /calendar/disconnect] Attempting to delete tokens for user: ${userId}`);
    const { error: deleteError } = await supabase
      .from('google_tokens')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error(`[API /calendar/disconnect] Error deleting tokens for user ${userId}:`, deleteError);
      return NextResponse.json({ error: 'Failed to disconnect calendar.' }, { status: 500 });
    }

    // 3. Return success response
    console.log(`[API /calendar/disconnect] Successfully deleted tokens for user: ${userId}`);
    return NextResponse.json({ message: 'Google Calendar disconnected successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('[API /calendar/disconnect] General Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 