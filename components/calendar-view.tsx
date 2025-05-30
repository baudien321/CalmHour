'use client';

import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from 'react';
import { cn } from "@/lib/utils";
import {
  format, startOfWeek, endOfWeek, addDays, isToday, getHours, getMinutes,
  formatISO, parseISO, differenceInMinutes, isSameDay, getDay,
  subWeeks, addWeeks, subDays,
  startOfDay, endOfDay, eachDayOfInterval, subMonths, addMonths, startOfMonth, endOfMonth,
  isSameMonth, isWithinInterval, getMonth, getDate, eachWeekOfInterval,
} from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';

// Event type matching backend API response structure
interface CalendarEvent {
  id: string;
  summary?: string | null;
  start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
}

// Define a type for processed event layout
interface ProcessedEventLayout {
  event: CalendarEvent;
  layout: {
    top: number;
    height: number;
    left: string; // e.g., '0%', '50%'
    width: string; // e.g., '100%', '50%'
    zIndex: number;
  };
}

// Constants for the grid
const START_HOUR = 0; // Restore 0
const END_HOUR = 24; // Restore 24
const TIME_SLOT_INTERVAL_MINS = 30; // minutes
const ROW_HEIGHT_REM = 3; // h-12 (3rem) represents 30 minutes - NOTE: This is for LABEL spacing, not grid lines!
const GRID_ROW_HEIGHT_REM = 1.5; // h-6 (1.5rem) is the actual height of a 30-min grid slot
const ROOT_FONT_SIZE_PX = 16; // Assumption for rem to px conversion
const SLOT_HEIGHT_PX = GRID_ROW_HEIGHT_REM * ROOT_FONT_SIZE_PX; // e.g., 1.5 * 16 = 24px

// Helper function to calculate event position and height
function calculateEventPosition(event: CalendarEvent, dayStartDate: Date): { top: number; height: number } | null {
  const eventStartStr = event.start?.dateTime || event.start?.date;
  const eventEndStr = event.end?.dateTime || event.end?.date;

  // Ignore if start or end is missing, or if it's an all-day event (for now)
  if (!eventStartStr || !eventEndStr || !event.start?.dateTime) {
    return null;
  }

  try {
    const eventStartDate = parseISO(eventStartStr);
    const eventEndDate = parseISO(eventEndStr);

    // Calculate minutes from the start of the view (START_HOUR on the event's day)
    const viewStartOfDay = new Date(eventStartDate);
    viewStartOfDay.setHours(START_HOUR, 0, 0, 0);

    const startMinutesOffset = differenceInMinutes(eventStartDate, viewStartOfDay);
    const durationMinutes = differenceInMinutes(eventEndDate, eventStartDate);

    // Ignore if event starts before view or has negative duration
    if (startMinutesOffset < 0 || durationMinutes <= 0) {
        return null;
    }

    // Calculate position and height in REM units
    // Each ROW_HEIGHT_REM represents TIME_SLOT_INTERVAL_MINS
    const top = (startMinutesOffset / TIME_SLOT_INTERVAL_MINS) * ROW_HEIGHT_REM;
    const height = (durationMinutes / TIME_SLOT_INTERVAL_MINS) * ROW_HEIGHT_REM;

    // Clamp height to prevent tiny events if needed, ensure minimum height?
    const minHeight = 0.5; // Minimum height in rem, e.g., half a slot
    const finalHeight = Math.max(height, minHeight);

    return { top, height: finalHeight };

  } catch (e) {
      console.error("Error parsing event dates:", event, e);
      return null;
  }
}

export function CalendarView() {
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [_, setTick] = useState(0);

  const calculateCurrentTimePositionRem = (): number | null => {
      const now = new Date();
      const currentHour = getHours(now);
      const currentMinute = getMinutes(now);

      if (currentHour >= START_HOUR && currentHour < END_HOUR) {
        const minutesPastStartHour = (currentHour - START_HOUR) * 60 + currentMinute;
        const remPerMinute = GRID_ROW_HEIGHT_REM / TIME_SLOT_INTERVAL_MINS;
        return minutesPastStartHour * remPerMinute;
      } 
      return null;
  };
  
  const currentTimePositionRem = calculateCurrentTimePositionRem();

  // Calculate view interval based on activeView and currentDate
  const viewInterval = useMemo(() => {
    let start: Date;
    let end: Date;
    switch (activeView) {
      case 'day':
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
        break;
      case 'month':
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
      case 'week':
      default:
        start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
        end = endOfWeek(currentDate, { weekStartsOn: 0 });
        break;
    }
    return { start, end };
  }, [currentDate, activeView]);

  // Dates to display in the header/grid based on the view
  const displayDates = useMemo(() => {
    if (activeView === 'day') {
      return [viewInterval.start];
    } else if (activeView === 'week') {
       // Always show 7 days for week view
       const startOfTargetWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
       return Array.from({ length: 7 }).map((_, i) => addDays(startOfTargetWeek, i));
    } else if (activeView === 'month') {
      // Get all days within the weeks that contain the start and end of the month
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDateForGrid = startOfWeek(monthStart, { weekStartsOn: 0 });
      const endDateForGrid = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: startDateForGrid, end: endDateForGrid });
    }
    return []; 
  }, [currentDate, activeView, viewInterval]);

  // Generate time labels
  const timeLabels: string[] = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    const baseDate = new Date();
    baseDate.setHours(hour, 0, 0, 0);
    timeLabels.push(format(baseDate, 'h a')); // Show hour only
  }

  // Generate day of week labels for Month view
  const dayOfWeekLabels = useMemo(() => {
      const start = startOfWeek(new Date(), { weekStartsOn: 0 });
      return Array.from({ length: 7 }).map((_, i) => format(addDays(start, i), 'EEE')); // Mon, Tue, etc.
  }, []);

  // Group events by date string for Month view
  const eventsByDateMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    if (activeView !== 'month') return map;

    events.forEach(event => {
      const startStr = event.start?.dateTime || event.start?.date;
      if (startStr) {
        try {
            const startDate = parseISO(startStr);
            const dateKey = format(startDate, 'yyyy-MM-dd');
            if (!map.has(dateKey)) {
              map.set(dateKey, []);
            }
            map.get(dateKey)?.push(event);
        } catch (e) {
            console.error("Error parsing event start date for map:", event, e);
      }
      }
    });
    return map;
  }, [events, activeView]);

  // Memoize the processed event layouts - Now considers displayDates
  const processedEventsByDayIndex = useMemo(() => {
    console.time('[useMemo] processedEventsByDayIndex'); // Start timer
    const groupedLayouts: Record<number, ProcessedEventLayout[]> = {};
    if (displayDates.length === 0 || activeView === 'month') { // Skip month for now
        console.timeEnd('[useMemo] processedEventsByDayIndex'); // End timer early if skipping
        return groupedLayouts; 
    }

    for (let dayIndex = 0; dayIndex < displayDates.length; dayIndex++) {
      const day = displayDates[dayIndex];
      // Filter events for the current day *first*
      const dayEventsRaw = events.filter(event => {
         try {
             const eventStartStr = event.start?.dateTime || event.start?.date;
             // Only include events that *start* on this specific day for day/week view
             return eventStartStr && isSameDay(parseISO(eventStartStr), day);
         } catch { return false; }
      });

      // Calculate positions for events of that day
      const dayEventsWithPos = dayEventsRaw
        .map(event => {
          const position = calculateEventPosition(event, day);
          return position ? { event, position } : null; // Keep only events with valid positions
        })
        .filter((item): item is { event: CalendarEvent; position: { top: number; height: number } } => item !== null) // Type guard
        .sort((a, b) => a.position.top - b.position.top || (b.position.height - a.position.height)); // Sort by start time, then duration desc

      if (dayEventsWithPos.length === 0) {
        groupedLayouts[dayIndex] = [];
        continue;
      }

      // --- Basic Overlap Calculation (unchanged logic, applied to dayEventsWithPos) ---
      let columns: { event: CalendarEvent; position: { top: number; height: number }; column: number }[] = [];
      let activeColumns: { end: number; column: number }[] = [];

      dayEventsWithPos.forEach(item => {
        let assignedColumn = 0;
        activeColumns = activeColumns.filter(c => c.end > item.position.top);
        while (activeColumns.some(c => c.column === assignedColumn)) {
          assignedColumn++;
        }
        activeColumns.push({ end: item.position.top + item.position.height, column: assignedColumn });
        columns.push({ ...item, column: assignedColumn });
      });

      // Determine max overlap for each event
      const finalLayouts: ProcessedEventLayout[] = columns.map((currentItem) => {
        let maxOverlap = 1; // Start with 1 (the event itself)
        const currentStart = currentItem.position.top;
        const currentEnd = currentStart + currentItem.position.height;

        // Count how many other columns *at the same overlap level* overlap with this one
        const overlappingColumns = columns.filter(otherItem => {
            if (currentItem.event.id === otherItem.event.id) return false;
            const otherStart = otherItem.position.top;
            const otherEnd = otherStart + otherItem.position.height;
            // Simple overlap check
            return currentStart < otherEnd && currentEnd > otherStart;
        });
        
        // Find the maximum number of simultaneously overlapping events *at any point* during this event's duration
        let maxConcurrent = 1; 
        for(let t = currentStart; t < currentEnd; t += 0.1) { // Check time points within the event
            let concurrentAtT = 0;
            columns.forEach(c => {
                 const cs = c.position.top;
                 const ce = cs + c.position.height;
                 if(cs <= t && ce > t) { // Check if event c is active at time t
                     concurrentAtT++;
                 }
            });
            maxConcurrent = Math.max(maxConcurrent, concurrentAtT);
        }
        maxOverlap = maxConcurrent;


        const totalColumnsAvailable = maxOverlap; // Max concurrent events determines width division
        const widthPercent = 100 / totalColumnsAvailable;
        // Ensure left is calculated based on the assigned column index *within the overlapping group*
        // This naive `currentItem.column` might not be correct if columns are reused across non-overlapping intervals.
        // A more robust approach involves grouping overlapping events first.
        // For now, using the initially assigned column, which works for basic cases.
        const leftPercent = currentItem.column * widthPercent; 

        return {
          event: currentItem.event,
          layout: {
            top: currentItem.position.top,
            height: currentItem.position.height,
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
            zIndex: currentItem.column + 1, // Basic z-index based on column
          }
        };
      });


      groupedLayouts[dayIndex] = finalLayouts;
      // --- End Overlap Calculation ---\
    }
    console.timeEnd('[useMemo] processedEventsByDayIndex'); // End timer after loop completes
    return groupedLayouts;
  }, [events, displayDates, activeView]); 

  // --- Virtualizer Setup ---
  const numTimeSlots = (END_HOUR - START_HOUR) * (60 / TIME_SLOT_INTERVAL_MINS); // Total number of slots (e.g., 48)

  const rowVirtualizer = useVirtualizer({
    count: numTimeSlots,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: useCallback(() => SLOT_HEIGHT_PX, []),
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize(); // Total virtual height in pixels

  // --- Refactored Effects --- 

  // Effect 0: Log mount/unmount
  useEffect(() => {
    console.log('[CalendarView Lifecycle] Component Mounted');
    return () => {
      console.log('[CalendarView Lifecycle] Component Unmounted');
    };
  }, []);

  // Effect 1: Set up and clear interval to trigger re-renders for time updates
  useEffect(() => {
    console.log('[Effect 1: Interval Setup] Setting up timer.');
    intervalRef.current = setInterval(() => {
       console.log('[Effect 1: Interval Tick] Forcing re-render.');
      setTick(prev => prev + 1); // Update state to trigger re-render
    }, 60000); // Update every minute

    return () => {
      console.log('[Effect 1: Interval Cleanup] Clearing timer.');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Run only once on mount

  // Effect 2: Initial scroll using virtualizer (CHANGED to useLayoutEffect)
  useLayoutEffect(() => {
    console.log("[Effect 2 - useLayoutEffect] HOOK ENTRY"); 
    const effectStartTime = Date.now();
    let timerId: NodeJS.Timeout | null = null; // Keep timeout logic for now

    if (!initialScrollDone) {
      console.log(`[Effect 2 @ ${effectStartTime}] Initial Scroll Check. Done: false, Ref Attached: ${!!scrollContainerRef.current}`);
      
      if (scrollContainerRef.current) {
          timerId = setTimeout(() => {
              const timeoutStartTime = Date.now();
              console.log(`[Effect 2 @ ${timeoutStartTime}] setTimeout triggered. Attempting scroll.`);
              console.log(`[Effect 2 @ ${timeoutStartTime}] Checking condition: !initialScrollDone = ${!initialScrollDone}`);
              if (!initialScrollDone) { 
                  // Calculate target index (same logic)
                  const now = new Date();
                  const currentHour = getHours(now);
                  let targetIndex = 0;
                  if (currentHour >= START_HOUR && currentHour < END_HOUR) {
                      const targetHourForScroll = Math.max(START_HOUR, currentHour - 1);
                      targetIndex = (targetHourForScroll - START_HOUR) * (60 / TIME_SLOT_INTERVAL_MINS);
                  } else { targetIndex = 0; }
                  targetIndex = Math.max(0, Math.min(targetIndex, numTimeSlots - 1));

                  // Log virtualizer measurements before scrolling
                  const currentTotalSize = rowVirtualizer.getTotalSize();
                  const targetVirtualItem = rowVirtualizer.getVirtualItems().find(item => item.index === targetIndex);
                  console.log(`[Effect 2 @ ${Date.now()}] Target index: ${targetIndex}. Size: ${currentTotalSize}, Item:`, targetVirtualItem);
                  console.log(`[Effect 2 @ ${Date.now()}] Calling scrollToIndex...`);
                  try {
                      rowVirtualizer.scrollToIndex(targetIndex, { align: 'start', behavior: 'auto' });
                      console.log(`[Effect 2 @ ${Date.now()}] scrollToIndex called successfully.`);
                      console.log(`[Effect 2 @ ${Date.now()}] *** About to set initialScrollDone = true ***`);
                      setInitialScrollDone(true); 
                  } catch (scrollError) {
                      console.error(`[Effect 2 @ ${Date.now()}] Error calling scrollToIndex:`, scrollError);
                  }
              } else {
                  console.log(`[Effect 2 @ ${Date.now()}] setTimeout triggered, but scroll already done.`);
              }
          }, 50); 
      } else {
          console.log(`[Effect 2 @ ${effectStartTime}] Ref not attached yet.`);
      }
    } else {
        console.log(`[Effect 2 @ ${effectStartTime}] Skipping scroll check, already done.`);
    }

    return () => {
        if (timerId) {
            console.log(`[Effect 2 @ ${Date.now()}] Cleaning up pending setTimeout.`);
            clearTimeout(timerId);
        }
    };

  }, [rowVirtualizer, initialScrollDone]); 

  // Effect 3: Reset initial scroll flag when view or date changes
  useEffect(() => {
      console.log(`[Effect 3: Reset Scroll Flag] View: ${activeView}, Date: ${currentDate.toISOString()}, Resetting.`);
      setInitialScrollDone(false);
  }, [activeView, currentDate]);

  // Updated Effect for fetching events based on viewInterval
  useEffect(() => {
    const fetchEvents = async () => {
      console.log(`[Effect: Fetch Events] Starting fetch for interval: ${formatISO(viewInterval.start)} - ${formatISO(viewInterval.end)}`);
      console.time('[Effect: Fetch Events] Fetch Duration'); // Start timer
      setIsLoading(true);
      setError(null);
      const startDate = formatISO(viewInterval.start);
      const endDate = formatISO(viewInterval.end);
      // console.log(`[CalendarView - ${activeView}] Fetching events from ${startDate} to ${endDate}`); // Already logged above

      try {
        const response = await fetch(`/api/calendar/events?startDate=${startDate}&endDate=${endDate}`);
        console.timeLog('[Effect: Fetch Events] Fetch Duration', '- fetch responded'); // Log time when fetch returns
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.timeLog('[Effect: Fetch Events] Fetch Duration', '- response parsed'); // Log time when JSON parsed
        // console.log(`[CalendarView - ${activeView}] Fetched events data:`, data); // Can be noisy
        setEvents(data.events || []);
      } catch (err) {
        console.error("[Effect: Fetch Events] Failed:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setEvents([]);
      } finally {
        setIsLoading(false);
        console.timeEnd('[Effect: Fetch Events] Fetch Duration'); // End timer and log total duration
      }
    };

    fetchEvents();
  }, [viewInterval, activeView]); 

  // --- Navigation Handlers --- 
  const goToPrevious = () => {
    setCurrentDate(prevDate => {
      switch (activeView) {
        case 'day': return subDays(prevDate, 1);
        case 'month': return subMonths(prevDate, 1);
        case 'week': default: return subWeeks(prevDate, 1);
      }
    });
  };
  const goToNext = () => {
    setCurrentDate(prevDate => {
      switch (activeView) {
        case 'day': return addDays(prevDate, 1);
        case 'month': return addMonths(prevDate, 1);
        case 'week': default: return addWeeks(prevDate, 1);
      }
    });
  };
  const goToToday = () => {
    const today = new Date();
    let shouldUpdate = false;
    switch (activeView) {
          case 'day': shouldUpdate = !isSameDay(currentDate, today); break;
          case 'week': const weekCheckInterval = { start: startOfWeek(currentDate, {weekStartsOn: 0}), end: endOfWeek(currentDate, {weekStartsOn: 0})}; shouldUpdate = !isWithinInterval(today, weekCheckInterval); break;
          case 'month': shouldUpdate = !isSameMonth(currentDate, today); break;
    }
      if (shouldUpdate) { setCurrentDate(today); }
  };
  const handleViewChange = (value: string) => {
      if (value && (value === 'day' || value === 'week' || value === 'month')) {
          setActiveView(value as 'day' | 'week' | 'month');
      }
  };
  const headerTitle = useMemo(() => {
      switch (activeView) {
          case 'day': return format(currentDate, 'EEEE, MMMM d, yyyy');
          case 'week': const start = startOfWeek(currentDate, { weekStartsOn: 0 }); const end = endOfWeek(currentDate, { weekStartsOn: 0 }); return isSameMonth(start, end) ? `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}` : `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
          case 'month': return format(currentDate, 'MMMM yyyy');
          default: return '';
      }
  }, [currentDate, activeView]);

  // --- Render Logic ---
  return (
    <div className="flex flex-col h-[75vh] bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      {/* Header: Navigation and View Switcher */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevious} aria-label="Previous Period">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={goToNext} aria-label="Next Period">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold ml-4">{headerTitle}</h2>
        </div>
        <ToggleGroup type="single" defaultValue="week" value={activeView} onValueChange={handleViewChange} aria-label="Calendar View">
           <ToggleGroupItem value="day" aria-label="Day view">Day</ToggleGroupItem>
           <ToggleGroupItem value="week" aria-label="Week view">Week</ToggleGroupItem>
           <ToggleGroupItem value="month" aria-label="Month view">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Error Display */}
      {error && (
         <div className="p-4 text-red-600 dark:text-red-400 flex items-center gap-2">
             <AlertCircle className="h-5 w-5" /> <span>{error}</span>
         </div>
      )}

      {/* Loading Overlay (covers entire area below header) */}
      {isLoading && (
        <div className="flex-grow flex items-center justify-center">
          {/* Replace with a more centered spinner/skeleton if desired */}
          <p className="text-gray-500">Loading calendar...</p> 
        </div>
      )}

      {/* Calendar Grid Area (Only render if not loading) */} 
      {!isLoading && (
          <> 
           {/* Month View Rendering */} 
           {activeView === 'month' && (
              <div className="flex-grow flex flex-col overflow-hidden">
                  {/* Day of Week Header */}
                  <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    {dayOfWeekLabels.map(label => (
                      <div key={label} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {label}
                    </div>
                ))}
            </div>
                  {/* Month Grid */}
                  <div className="grid grid-cols-7 grid-rows-6 flex-grow overflow-y-auto">
                     {displayDates.map((day, index) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const eventsOnDay = eventsByDateMap.get(dateKey) || [];
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isCurrentDay = isToday(day);
                        
                        return (
                          <div 
                            key={index} 
                            className={cn(
                              "relative p-1 border-r border-b border-gray-100 dark:border-gray-800",
                              !isCurrentMonth && "bg-gray-50 dark:bg-gray-950 text-gray-400", // Dim days outside current month
                              isCurrentMonth && "text-gray-900 dark:text-gray-100",
                              (index + 1) % 7 === 0 && "border-r-0", // No right border on last column
                              index >= displayDates.length - 7 && "border-b-0" // No bottom border on last row
                              )}>
                             <time 
                                dateTime={formatISO(day)} 
                                className={cn(
                                  "text-xs font-semibold",
                                  isCurrentDay && "flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white", // Highlight today
                                  !isCurrentDay && "block" 
                                )}>
                               {format(day, 'd')}
                             </time>
                             {/* Event Indicators */} 
                             {isCurrentMonth && eventsOnDay.length > 0 && (
                               <div className="mt-1 flex flex-col items-start gap-0.5 overflow-hidden">
                                  {/* Simple dot indicator for now */}
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                   {/* Or display event count: */}
                                   {/* <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded">{eventsOnDay.length} event{eventsOnDay.length > 1 ? 's' : ''}</span> */} 
                               </div>
                             )}
                          </div>
                        );
                     })}
                  </div>
              </div>
           )} 
            
           {/* Day/Week View Rendering */} 
           {(activeView === 'day' || activeView === 'week') && (
            // Add the ref to THIS div
            <div ref={scrollContainerRef} className="flex-grow relative overflow-y-auto"> 
                {/* Time Column (Restore absolute positioning) */}
                <div className="absolute left-0 top-0 z-20 w-16 text-xs text-center border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
                    {/* Header Spacer (Restore sticky) */}
                    <div className="h-16 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 bg-inherit"></div>
                    {/* Time Labels Loop */}
                    {timeLabels.map((label, index) => (
                        <div key={index} className="h-12 flex items-center justify-center ...">
                            <span>{label}</span>
                  </div>
                ))}
              </div>

                {/* Day(s) Columns Area (Restore pl-16) */}
                <div className="pl-16 relative">
                    {/* Header Row (Restore sticky) */}
              <div className={cn(
                        "sticky top-0 z-10 grid bg-white dark:bg-gray-900 border-b ...",
                  activeView === 'week' ? "grid-cols-7" : "grid-cols-1"
              )}>
                       {/* ... day headers ... */}
                      </div>

                    {/* Virtualizer Content Wrapper (remains the same) */}
                    <div style={{ height: `${totalSize}px`, width: '100%', position: 'relative' }}>

                        {/* Background Grid & Event Layer */}
                        <div className={cn( "absolute top-0 left-0 grid", activeView === 'week' ? "grid-cols-7" : "grid-cols-1", "w-full h-full" )}>

                            {/* Vertical Lines */}
                            {activeView === 'week' && displayDates.slice(0, -1).map((_, dayIndex) => (
                                 <div key={dayIndex} className={`col-start-${dayIndex + 1} row-start-1 border-l border-gray-200 dark:border-gray-700 -ml-px`} style={{height: `${totalSize}px`}}></div>
                            ))}

                            {/* VIRTUALIZED Horizontal Grid Lines */}
                            {virtualItems.map((virtualRow: VirtualItem) => (
                                <div
                                    key={virtualRow.index}
                                    className={cn( "absolute top-0 left-0 w-full border-t border-gray-100 dark:border-gray-800", "col-span-full" )}
                                    style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                                />
                            ))}

                            {/* Current Time Indicator (Pixel position) */}
                            {currentTimePositionRem !== null && (
                                <div className="absolute left-0 right-0 border-t-2 border-red-500 z-30 col-span-full" style={{ top: `${currentTimePositionRem * ROOT_FONT_SIZE_PX}px` }}>
                                   <div className="absolute left-0 -top-1 h-2 w-2 bg-red-500 rounded-full"></div>
                                </div>
                            )}

                            {/* Event Rendering Placeholder (TEMP) */}
                             {/* === TEMP: Comment out event rendering === */}
                                {/* {Object.entries(processedEventsByDayIndex).map(([dayIndexStr, dayLayouts]) => {
                                    const dayIndex = parseInt(dayIndexStr, 10);
                                    return (
                                        <div key={dayIndex} className={cn("relative", activeView === 'week' ? `col-start-${dayIndex + 1}` : 'col-start-1')}>
                                            {dayLayouts.map(({ event, layout }) => (
                                                <div key={event.id} className="absolute ..." style={{ top: `${layout.top}px`, height: `${layout.height}px`, left: layout.left, width: layout.width, zIndex: layout.zIndex + 20 }}>
                                                    // ... Event content ...
                     </div>
                 ))}
              </div>
                                    )
                                })} */}
                            {/* === END TEMP === */}

            </div>
                    </div> {/* End Virtualizer Content Wrapper */}
                </div> {/* End Day(s) Columns Area */}
            </div> /* End Single Scrollable Container */
           )}
          </> 
      )}
    </div> // Ensure this closing div is correct
  ); // Ensure this closing parenthesis is correct
} // Ensure this closing brace is correct