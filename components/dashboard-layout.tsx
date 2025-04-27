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

interface EventDetailsForEdit {
  id: string;
  title: string;
  start: Date | null;
  end: Date | null;
}

// ** NEW Interface for selected event details including focus status **
interface SelectedEventDetails extends EventDetailsForEdit {
  isFocusBlock: boolean;
}

export function DashboardLayout({ isCalendarConnected, userEmail }: DashboardLayoutProps) {
  const [calendarKey, setCalendarKey] = useState(0);
  // ** Update state to use the new interface **
  const [selectedEvent, setSelectedEvent] = useState<SelectedEventDetails | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  // Keep editingEventDetails using the simpler interface for now
  const [editingEventDetails, setEditingEventDetails] = useState<EventDetailsForEdit | null>(null);

  const triggerCalendarRefresh = useCallback(() => {
    console.log('[DashboardLayout] Triggering calendar refresh...');
    setCalendarKey(prevKey => prevKey + 1);
    setSelectedEvent(null);
    setEditingEventDetails(null);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    setEditingEventDetails(null); // Clear edit mode if active

    // Determine if it's a focus block (check isFocusBlock from extendedProps)
    const isFocus = !!clickInfo.event.extendedProps.isFocusBlock;
    
    console.log(`[DashboardLayout] Event clicked (isFocus: ${isFocus}):`, clickInfo.event.title);

    // ** Always set the selected event, including the focus status **
    setSelectedEvent({
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        id: clickInfo.event.id,
        isFocusBlock: isFocus 
    });

  }, []);

  const handleCloseDetails = useCallback(() => {
      setSelectedEvent(null);
  }, []);

  const handleEditEvent = useCallback(() => {
    // ** Only allow editing if the selected event is a focus block **
    if (selectedEvent && selectedEvent.isFocusBlock) {
      console.log('[DashboardLayout] Switching to edit mode for event:', selectedEvent.id);
      // Pass only the necessary details for editing
      setEditingEventDetails({
         id: selectedEvent.id,
         title: selectedEvent.title,
         start: selectedEvent.start,
         end: selectedEvent.end,
      });
      setSelectedEvent(null); // Close the details view
    } else {
      console.warn('[DashboardLayout] Attempted to edit a non-focus block or no event selected.');
    }
  }, [selectedEvent]);

  const handleCancelEdit = useCallback(() => {
    console.log('[DashboardLayout] Cancelling edit mode.');
    setEditingEventDetails(null);
  }, []);

  const handleUpdateEvent = useCallback(async (formData: any) => {
    if (!editingEventDetails) return;

    setIsUpdatingEvent(true);
    const eventId = editingEventDetails.id;
    console.log(`[DashboardLayout] Attempting to update event: ${eventId} with data:`, formData);
    const toastId = toast.loading("Updating focus block...");

    try {
      const payload = {
        eventId: eventId,
        startTime: formData.dateTime.toISOString(),
        duration: formData.duration,
        sessionName: formData.sessionName,
        priority: formData.priority,
      };

      const response = await fetch('/api/calendar/update-focus-time', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("Focus block updated successfully!", { id: toastId });
      triggerCalendarRefresh();

    } catch (error: any) {
        console.error("[DashboardLayout] Failed to update event:", error);
        toast.error("Failed to update focus block", { 
            id: toastId,
            description: error.message || "An unknown error occurred.",
        });
    } finally {
        setIsUpdatingEvent(false);
    }
  }, [editingEventDetails, triggerCalendarRefresh]);

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
           {editingEventDetails ? (
              <FocusControlsSidebar 
                 key={`edit-${editingEventDetails.id}`}
                 isEditing={true} 
                 initialEventData={editingEventDetails}
                 onUpdate={handleUpdateEvent}
                 onCancelEdit={handleCancelEdit}
                 isLoading={isUpdatingEvent}
              />
            ) : selectedEvent ? (
              <FocusEventDetailsSidebar 
                eventDetails={selectedEvent} 
                onClose={handleCloseDetails} 
                onDelete={handleDeleteEvent}
                onEdit={handleEditEvent}
                // ** Pass the isFocusBlock status **
                isFocusBlock={selectedEvent.isFocusBlock}
              />
            ) : (
              <FocusControlsSidebar 
                 onEventAdded={triggerCalendarRefresh} 
             /> 
           )}
        </aside>
      </div>
  );
} 