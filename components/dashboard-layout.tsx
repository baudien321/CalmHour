'use client';

import React, { useState, useCallback } from 'react';
import { FocusControlsSidebar } from "@/components/focus-controls-sidebar";
import { FullCalendarView } from "@/components/full-calendar-view";
import { FocusEventDetailsSidebar } from "@/components/focus-event-details-sidebar";
import { DashboardActionCardContent } from "@/components/dashboard-action-card-content";
import DashboardClientMessages from "@/app/dashboard/dashboard-client-messages"; // Adjust path if necessary
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import CalendarConnectButton from "@/components/calendar-connect-button";
import type { EventClickArg } from '@fullcalendar/core';
import { toast } from "sonner";

interface DashboardLayoutProps {
  isCalendarConnected: boolean;
  userEmail: string | undefined; 
}

interface SelectedEventDetails {
  id: string;
  title: string;
  start: Date | null;
  end: Date | null;
}

export function DashboardLayout({ isCalendarConnected, userEmail }: DashboardLayoutProps) {
  const [calendarKey, setCalendarKey] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEventDetails | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  const triggerCalendarRefresh = useCallback(() => {
    console.log('[DashboardLayout] Triggering calendar refresh...');
    setCalendarKey(prevKey => prevKey + 1);
    setSelectedEvent(null);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (clickInfo.event.extendedProps.isFocusTime) {
        console.log('[DashboardLayout] Focus Time event clicked:', clickInfo.event);
        setSelectedEvent({
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            id: clickInfo.event.id,
        });
    } else {
        console.log('[DashboardLayout] Non-focus event clicked, ignoring for details view:', clickInfo.event.title);
    }
  }, []);

  const handleCloseDetails = useCallback(() => {
      setSelectedEvent(null);
  }, []);

  const handleDeleteEvent = useCallback(async (eventId: string, calendarId: string = 'primary') => {
      if (!window.confirm("Are you sure you want to delete this focus block?")) {
          return;
      }

      setIsDeletingEvent(true);
      console.log(`[DashboardLayout] Attempting to delete event: ${eventId} from calendar: ${calendarId}`);
      const toastId = toast.loading("Deleting focus block...");

      try {
          const response = await fetch('/api/calendar/delete-focus-time', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventId, calendarId }),
          });

          const result = await response.json();

          if (!response.ok) {
              throw new Error(result.error || `HTTP error! status: ${response.status}`);
          }

          toast.success("Focus block deleted successfully!", { id: toastId });
          triggerCalendarRefresh();

      } catch (error: any) {
          console.error("[DashboardLayout] Failed to delete event:", error);
          toast.error("Failed to delete focus block", { 
              id: toastId,
              description: error.message || "An unknown error occurred.",
          });
      } finally {
          setIsDeletingEvent(false);
      }
  }, [triggerCalendarRefresh]);

  const userName = userEmail?.split('@')[0];

  return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:gap-8 md:p-8">
        <main className="flex-1 flex flex-col gap-4 md:gap-8">
          <DashboardClientMessages /> 
          <div className="grid gap-4 md:gap-8 lg:grid-cols-1 xl:grid-cols-3">
            <Card className="xl:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle>Welcome, {userName || 'User'}!</CardTitle> 
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
            <FullCalendarView key={calendarKey} onEventClick={handleEventClick} />
          </div>
        </main>
        
        <aside className="w-full shrink-0 md:w-80 lg:w-96">
           {selectedEvent ? (
             <FocusEventDetailsSidebar 
               eventDetails={selectedEvent} 
               onClose={handleCloseDetails} 
               onDelete={handleDeleteEvent}
             />
           ) : (
             <FocusControlsSidebar onEventAdded={triggerCalendarRefresh} /> 
           )}
        </aside>
      </div>
  );
} 