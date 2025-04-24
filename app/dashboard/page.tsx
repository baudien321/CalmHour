import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import CalendarConnectButton from "@/components/calendar-connect-button";
import DashboardClientMessages from "./dashboard-client-messages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, XCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardActionCardContent } from "@/components/dashboard-action-card-content";
import { FocusControlsSidebar } from "@/components/focus-controls-sidebar";
import { FullCalendarView } from "@/components/full-calendar-view";

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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:gap-8 md:p-8">
        <main className="flex-1 flex flex-col gap-4 md:gap-8">
          <DashboardClientMessages />
          <div className="grid gap-4 md:gap-8 lg:grid-cols-1 xl:grid-cols-3">
            <Card className="xl:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle>Welcome, {user.email?.split('@')[0]}!</CardTitle> 
                <CardDescription>
                  Manage your calendar connection and focus time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Calendar Status:</span>
                  {isCalendarConnected ? (
                    <Badge variant="success"> <CheckCircle className="mr-1 h-3 w-3" /> Connected</Badge>
                  ) : (
                    <Badge variant="destructive"> <XCircle className="mr-1 h-3 w-3" /> Not Connected</Badge>
                  )}
                </div>
                <CalendarConnectButton isConnected={isCalendarConnected} />
                
                 {!isCalendarConnected && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect your Google Calendar to get started.
                    </p>
                  )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Find & Block Focus Time</CardTitle>
                <CardDescription>
                   Automatically analyze your primary Google Calendar for the next 7 days 
                   (Mon-Fri, 9am-5pm UTC) and schedule up to 3 available 1-hour focus blocks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardActionCardContent isCalendarConnected={isCalendarConnected} />
              </CardContent>
            </Card>
          </div>
          <div className="flex-1 rounded-lg border shadow-sm">
            <FullCalendarView />
          </div>
        </main>
        
        <aside className="w-full shrink-0 md:w-80 lg:w-96">
          <FocusControlsSidebar />
        </aside>
      </div>
    </div>
  );
} 