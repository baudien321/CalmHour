import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { DashboardHeader } from "@/components/dashboard-header";
// Remove unused imports if they were only used in the layout part
// import CalendarConnectButton from "@/components/calendar-connect-button";
// import DashboardClientMessages from "./dashboard-client-messages";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Activity, CheckCircle, XCircle } from "lucide-react";
// import { DashboardActionCardContent } from "@/components/dashboard-action-card-content";
// import { FocusControlsSidebar } from "@/components/focus-controls-sidebar";
// import { FullCalendarView } from "@/components/full-calendar-view";

// Import the new layout component
import { DashboardLayout } from '@/components/dashboard-layout';

export default async function DashboardPage() {
  // Await the async createClient function
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch calendar connection status
  const { data: tokenData, error: tokenError } = await supabase
    .from('google_tokens')
    .select('user_id') 
    .eq('user_id', user.id)
    .maybeSingle(); 

  if (tokenError) {
    console.error("Error fetching google_tokens:", tokenError);
    // Handle error appropriately in UI if needed
  }

  const isCalendarConnected = !!tokenData;
  const userEmail = user.email; // Get user email for the layout

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      {/* Render the client layout component, passing necessary props */}
      <DashboardLayout 
        isCalendarConnected={isCalendarConnected} 
        userEmail={userEmail} 
      />
    </div>
  );
} 