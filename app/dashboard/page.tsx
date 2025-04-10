import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import CalendarConnectButton from "@/components/calendar-connect-button";

// We need a client component to handle searchParams for toasts
import DashboardClientMessages from "./dashboard-client-messages";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Although middleware handles redirection, double-checking here
  // can be useful, especially if middleware logic changes.
  if (!user) {
    redirect('/'); // Redirect to homepage if somehow accessed without user
  }

  // Fetch calendar connection status from `google_tokens` table
  const { data: tokenData, error: tokenError } = await supabase
    .from('google_tokens')
    .select('user_id') // Select any column just to check if a row exists
    .eq('user_id', user.id)
    .maybeSingle(); // Use maybeSingle() to return null if no row found

  if (tokenError) {
    console.error("Error fetching google_tokens:", tokenError);
    // Decide how to handle this - show error, disable button?
    // For now, assume not connected on error
  }

  const isCalendarConnected = !!tokenData; // True if a row exists for the user

  return (
    <main className="container mx-auto py-10 px-4">
      {/* Client component to handle messages based on searchParams */}
      <DashboardClientMessages />

      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">Welcome, {user.email}!</p>
      <p className="mb-6">This is your protected dashboard area.</p>

      {/* Add the Calendar Connection Button */}
      <div className="mt-6 border-t pt-6">
          <h2 className="text-xl font-semibold mb-3">Calendar Integration</h2>
          <CalendarConnectButton isConnected={isCalendarConnected} />
          {/* Optionally display status text */}
          <p className="text-sm mt-2 text-gray-500">
              Status: {isCalendarConnected ? 'Connected' : 'Not Connected'}
          </p>
      </div>
    </main>
  );
} 