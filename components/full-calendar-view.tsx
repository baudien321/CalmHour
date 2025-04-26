'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { EventClickArg } from '@fullcalendar/core';
import { getHours, formatISO, parseISO, startOfWeek, endOfWeek, isSameDay, isWithinInterval, isSameMonth, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, addDays, subWeeks, addWeeks, subMonths, addMonths, format } from 'date-fns';
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronLeft, ChevronRight, Users, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Event type matching backend API response
interface ApiCalendarEvent {
  id: string;
  summary?: string | null;
  start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
  colorId?: string | null; // Add colorId here
}

// FullCalendar event format
interface FullCalendarEvent {
  id: string;
  title?: string;
  start: string;
  end: string;
  allDay: boolean;
  extendedProps: {
    isFocusTime?: boolean; // Flag to identify focus time events
    colorId?: string | null; // Add colorId here as well
  };
}

// Helper Type for intermediate mapping
type MappedEvent = Omit<FullCalendarEvent, 'start' | 'end' | 'extendedProps'> & { 
    start: string | null | undefined; 
    end: string | null | undefined; 
    extendedProps: {
        isFocusTime?: boolean;
        colorId?: string | null; // Add colorId here
    };
};

// --- Add Props interface --- 
interface FullCalendarViewProps {
  onEventClick?: (clickInfo: EventClickArg) => void; // Optional callback prop
}
// --- END Add Props interface ---

export function FullCalendarView({ onEventClick }: FullCalendarViewProps) {
  // --- State --- 
  const [activeView, setActiveView] = useState<'timeGridWeek' | 'timeGridDay' | 'dayGridMonth'>('timeGridWeek');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<FullCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  // --- Calculate Date Range for Fetching --- 
  const viewInterval = useMemo(() => {
    const api = calendarRef.current?.getApi();
    if (api?.view.currentStart) { 
      // Use FullCalendar's view range if available
      // Add/subtract a buffer if needed, e.g., to fetch slightly outside the view
      return { start: api.view.currentStart, end: api.view.currentEnd };
    } else {
      // Fallback calculation if API not ready (similar to old logic)
      let start: Date, end: Date;
      switch (activeView) {
        case 'timeGridDay': start = startOfDay(currentDate); end = endOfDay(currentDate); break;
        case 'dayGridMonth': start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }); end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }); break;
        case 'timeGridWeek': default: start = startOfWeek(currentDate, { weekStartsOn: 0 }); end = endOfWeek(currentDate, { weekStartsOn: 0 }); break;
      }
      return { start, end };
    }
  }, [currentDate, activeView]);

  // --- Effects --- 

  // Effect 1: Fetch Events when view/date changes
  useEffect(() => {
    const fetchEvents = async () => {
      console.log(`[FullCalendarView Effect] Fetching events for interval: ${formatISO(viewInterval.start)} - ${formatISO(viewInterval.end)}`);
      console.time('[FullCalendarView Effect] Fetch Duration');
      setIsLoading(true);
      setError(null);
      const startDate = formatISO(viewInterval.start);
      const endDate = formatISO(viewInterval.end);

      try {
        const response = await fetch(`/api/calendar/events?startDate=${startDate}&endDate=${endDate}`);
        console.timeLog('[FullCalendarView Effect] Fetch Duration', '- fetch responded');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: { events?: ApiCalendarEvent[] } = await response.json();
        console.timeLog('[FullCalendarView Effect] Fetch Duration', '- response parsed');
        
        // Transform API events to FullCalendar format
        const potentiallyIncompleteEvents: MappedEvent[] = (data.events || []).map(apiEvent => {
            // Determine if it's focus time based on summary
            const isFocus = apiEvent.summary?.toLowerCase().includes('focus time') ?? false;
            return {
                id: apiEvent.id,
                title: apiEvent.summary || undefined,
                start: apiEvent.start?.dateTime || apiEvent.start?.date,
                end: apiEvent.end?.dateTime || apiEvent.end?.date,
                allDay: !!apiEvent.start?.date,
                extendedProps: { 
                    isFocusTime: isFocus,
                    colorId: apiEvent.colorId // Store colorId in extendedProps
                },
            };
        });

        // Filter out invalid events and assert type for the final array
        const formattedEvents: FullCalendarEvent[] = potentiallyIncompleteEvents
            .filter(event => typeof event.start === 'string' && typeof event.end === 'string')
            // We know start/end are strings here due to the filter, so we assert the type
            .map(event => event as FullCalendarEvent); 

        setEvents(formattedEvents);
      } catch (err) {
        console.error("[FullCalendarView Effect] Fetch Failed:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setEvents([]);
      } finally {
        setIsLoading(false);
        console.timeEnd('[FullCalendarView Effect] Fetch Duration');
      }
    };

    fetchEvents();
  }, [viewInterval]); // Depend only on the calculated viewInterval

  // Effect 2: Initial scroll 
  useEffect(() => {
    console.log("[FullCalendarView Effect] Running scroll check.");
    let timerId: NodeJS.Timeout | null = null;
    if (!initialScrollDone && calendarRef.current) {
        timerId = setTimeout(() => {
           console.log(`[FullCalendarView Effect @ ${Date.now()}] setTimeout triggered. Calling scrollToTime.`);
           if(!initialScrollDone && calendarRef.current) { // Re-check done flag
              try {
                const calendarApi = calendarRef.current.getApi();
                const now = new Date();
                const currentHour = getHours(now);
                const targetHour = Math.max(0, currentHour - 1);
                const targetTimeString = `${String(targetHour).padStart(2, '0')}:00:00`;
                calendarApi.scrollToTime(targetTimeString);
                console.log("[FullCalendarView Effect] scrollToTime called. Setting Done=true.");
                setInitialScrollDone(true);
              } catch(error) {
                 console.error("[FullCalendarView Effect] Error calling scrollToTime:", error);
              }
           } else {
              console.log("[FullCalendarView Effect] setTimeout - scroll already done or ref lost.");
           }
        }, 100); // Slightly longer delay for FC API readiness?
    } else {
         console.log(`[FullCalendarView Effect] Skipping scroll. Done: ${initialScrollDone}, Ref Exists: ${!!calendarRef.current}`);
    }
    // Cleanup timeout
    return () => { if(timerId) clearTimeout(timerId); };
  }, [initialScrollDone]); // Only depend on done flag

  // Effect 3: Reset initial scroll flag when view changes (not date)
  useEffect(() => {
      console.log(`[FullCalendarView Effect] View changed to ${activeView}. Resetting initialScrollDone.`);
      setInitialScrollDone(false);
  }, [activeView]); 

  // --- Handlers for FullCalendar API --- 
  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();
  const handleViewChange = (newView: string) => {
      // Mapping view names - adjust if necessary based on toolbar values
      if (newView === 'dayGridMonth' || newView === 'timeGridWeek' || newView === 'timeGridDay') {
          // Ensure the calendar API is available before changing the view
          if (calendarRef.current) {
             calendarRef.current.getApi().changeView(newView);
             setActiveView(newView); // Keep state in sync
          }
          // Update currentDate state to reflect FullCalendar's internal date - remove this part as datesSet handles it
          // const newDate = calendarRef.current?.getApi().getDate();
          // if (newDate) setCurrentDate(newDate);
      }
  };

  // Update currentDate state when FullCalendar navigates internally
  const handleDatesSet = (dateInfo: { start: Date; end: Date; view: any }) => {
      // Use the view's current date which is more reliable after navigation
      // Also update activeView state in case view changed via other means
      setActiveView(dateInfo.view.type as 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth'); 
      setCurrentDate(dateInfo.view.currentStart); 
  };
  
  // --- Header Title (for the new header structure) --- 
  const headerTitle = useMemo(() => {
      const api = calendarRef.current?.getApi();
      if (!api) {
          // Fallback if API not ready (should be rare)
          return format(currentDate, 'MMMM yyyy'); 
      }
      const view = api.view;
      const start = view.currentStart;
      const end = view.currentEnd; // Note: currentEnd is exclusive in FC

      switch (view.type) {
          case 'timeGridDay': 
            return format(start, 'EEEE, MMMM d, yyyy');
          case 'dayGridMonth': 
            return format(start, 'MMMM yyyy'); 
          case 'timeGridWeek': 
          default:
             // Adjust end date for display (inclusive)
            const inclusiveEnd = subDays(end, 1); 
            return isSameMonth(start, inclusiveEnd) 
                ? `${format(start, 'MMMM d')} - ${format(inclusiveEnd, 'd, yyyy')}` 
                : `${format(start, 'MMM d')} - ${format(inclusiveEnd, 'MMM d, yyyy')}`;
      }
  }, [currentDate, activeView]); // Depend on currentDate and activeView

  // --- Custom Rendering Functions ---

  // Render custom day header (Day Name + Date Number)
  const renderDayHeaderContent = (arg: { date: Date, text: string, view: any }) => {
      const dayName = format(arg.date, 'EEE'); // Short day name (e.g., 'Mon')
      const dayNumber = format(arg.date, 'd'); // Day number (e.g., '13')
      const isToday = isSameDay(arg.date, new Date());

      return (
          <div className="text-center py-1">
              <div className="text-xs text-gray-500 uppercase mb-1">{dayName}</div>
              <div className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                  isToday ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
              )}>
                  {dayNumber}
              </div>
          </div>
      );
  };

  // Render custom event content (Icon + Title)
  const renderEventContent = (eventInfo: any /* FullCalendar EventContentArg */) => {
    const isFocus = eventInfo.event.extendedProps.isFocusTime;
    const colorId = eventInfo.event.extendedProps.colorId;

    // --- Determine colors based on colorId (fallback to old logic if no colorId) ---
    let iconColor = "text-gray-800"; // Default
    let textColor = "text-gray-800"; // Default

    // Map colorId to Tailwind text colors (adjust these classes as needed)
    // Using Google's default color palette names for reference
    // https://developers.google.com/calendar/api/guides/colors
    switch (colorId) {
        case '1': iconColor = "text-blue-800"; textColor = "text-blue-800"; break; // Lavender -> Blue
        case '2': iconColor = "text-green-800"; textColor = "text-green-800"; break; // Sage -> Green
        case '3': iconColor = "text-purple-800"; textColor = "text-purple-800"; break; // Grape -> Purple
        case '4': iconColor = "text-red-800"; textColor = "text-red-800"; break; // Flamingo -> Red
        case '5': iconColor = "text-yellow-800"; textColor = "text-yellow-800"; break; // Banana -> Yellow
        case '6': iconColor = "text-orange-800"; textColor = "text-orange-800"; break; // Tangerine -> Orange
        case '7': iconColor = "text-cyan-800"; textColor = "text-cyan-800"; break; // Peacock -> Cyan
        case '8': iconColor = "text-gray-800"; textColor = "text-gray-800"; break; // Graphite -> Gray
        case '9': iconColor = "text-blue-800"; textColor = "text-blue-800"; break; // Blueberry -> Blue
        case '10': iconColor = "text-emerald-800"; textColor = "text-emerald-800"; break; // Basil -> Emerald
        case '11': iconColor = "text-red-800"; textColor = "text-red-800"; break; // Tomato -> Red
        default:
            // Fallback to old logic if no colorId or unknown colorId
            if (isFocus) {
                iconColor = "text-green-800"; 
                textColor = "text-green-800";
            } else {
                iconColor = "text-blue-800"; 
                textColor = "text-blue-800";
            }
            break;
    }

    const Icon = isFocus ? Target : Users; // Keep icon based on focus status

    return (
        <div className="flex items-center text-xs overflow-hidden h-full px-1">
            <div className={`w-4 h-4 flex items-center justify-center mr-1 flex-shrink-0 ${iconColor}`}>
                <Icon className="w-3 h-3" />
            </div>
            <span className={`font-medium truncate ${textColor}`}>{eventInfo.event.title}</span>
        </div>
    );
  };

  // Apply event class names for background/border styling
  const getEventClassNames = (arg: any /* FullCalendar EventClassNamesArg */) => {
      const isFocus = arg.event.extendedProps.isFocusTime;
      const colorId = arg.event.extendedProps.colorId;
      const baseClasses = "rounded shadow-sm border-l-4 p-0.5"; // Keep base classes

      // --- Map colorId to Tailwind background/border/hover classes --- 
      let colorClasses = "bg-gray-100 border-gray-500 hover:bg-gray-200"; // Default

      switch (colorId) {
          case '1': colorClasses = "bg-blue-100 border-blue-500 hover:bg-blue-200"; break; // Lavender
          case '2': colorClasses = "bg-green-100 border-green-500 hover:bg-green-200"; break; // Sage
          case '3': colorClasses = "bg-purple-100 border-purple-500 hover:bg-purple-200"; break; // Grape
          case '4': colorClasses = "bg-red-100 border-red-500 hover:bg-red-200"; break; // Flamingo
          case '5': colorClasses = "bg-yellow-100 border-yellow-500 hover:bg-yellow-200"; break; // Banana
          case '6': colorClasses = "bg-orange-100 border-orange-500 hover:bg-orange-200"; break; // Tangerine
          case '7': colorClasses = "bg-cyan-100 border-cyan-500 hover:bg-cyan-200"; break; // Peacock
          case '8': colorClasses = "bg-gray-100 border-gray-500 hover:bg-gray-200"; break; // Graphite
          case '9': colorClasses = "bg-blue-100 border-blue-500 hover:bg-blue-200"; break; // Blueberry
          case '10': colorClasses = "bg-emerald-100 border-emerald-500 hover:bg-emerald-200"; break; // Basil
          case '11': colorClasses = "bg-red-100 border-red-500 hover:bg-red-200"; break; // Tomato
          default:
              // Fallback to old focus/meeting logic if no colorId or unknown colorId
              colorClasses = isFocus 
                ? "bg-green-100 border-green-500 hover:bg-green-200" 
                : "bg-blue-100 border-blue-500 hover:bg-blue-200";
              break;
      }

      return [
          baseClasses,
          colorClasses // Use the determined color classes
      ].join(' ');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm overflow-hidden"> 
       {/* New Header */}
       <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="flex justify-between items-center">
                {/* Left side: Title + Navigation */}
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold text-gray-800">{headerTitle}</h2>
                    <div className="flex space-x-1">
                        <button onClick={handlePrev} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" aria-label="Previous Period">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={handleNext} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" aria-label="Next Period">
                             <ChevronRight className="w-5 h-5" />
                        </button>
                        <button onClick={handleToday} className="ml-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded !rounded-button">
                            Today
                        </button>
                    </div>
                </div>
                {/* Right side: View Switcher */}
                <div className="flex items-center bg-gray-100 rounded-full p-1">
                   {/* Use Buttons for styling consistency with example */}
                   <button 
                      onClick={() => handleViewChange('timeGridDay')}
                      className={cn(
                         "px-3 py-1.5 text-sm font-medium rounded-full !rounded-button whitespace-nowrap",
                         activeView === 'timeGridDay' ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-200" 
                      )}
                   >
                       Day
                   </button>
                   <button 
                      onClick={() => handleViewChange('timeGridWeek')}
                      className={cn(
                         "px-3 py-1.5 text-sm font-medium rounded-full !rounded-button whitespace-nowrap",
                         activeView === 'timeGridWeek' ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-200" 
                      )}
                   >
                       Week
                   </button>
                   <button 
                      onClick={() => handleViewChange('dayGridMonth')}
                      className={cn(
                         "px-3 py-1.5 text-sm font-medium rounded-full !rounded-button whitespace-nowrap",
                         activeView === 'dayGridMonth' ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-200" 
                      )}
                   >
                       Month
                   </button>
                </div>
            </div>
       </div>

        {/* Error Display */}
        {error && (
            <div className="p-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> <span>{error}</span>
            </div>
        )}

        {/* Calendar Area */} 
        <div className="flex-grow relative"> {/* Ensure flex-grow to take space */} 
            {/* Optional: Add a loading overlay */} 
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-40">
                    <p>Loading events...</p>
                </div>
            )}
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView={activeView}
              initialDate={currentDate}
              headerToolbar={false}
              events={events}
              height="100%"
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              slotDuration="00:30:00"
              slotLabelInterval="00:30:00"
              slotLabelFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  omitZeroMinute: false,
                  meridiem: 'short'
              }}
              nowIndicator={true}
              datesSet={handleDatesSet}
              allDaySlot={false}
              eventClick={onEventClick}
              eventContent={renderEventContent}
              eventClassNames={getEventClassNames}
              viewClassNames={['fc-custom-view']}
              slotLabelClassNames={[
                  'text-xs', 'text-gray-500', 'text-right', 'pr-2',
                  'relative', 'top-[-0.5em]'
              ]}
              dayHeaderClassNames={['border-b', 'border-gray-200']}
              dayCellClassNames={[]}
            />
        </div>
    </div>
  );
} 