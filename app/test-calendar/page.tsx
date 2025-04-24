'use client';

import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { getHours } from 'date-fns';

// Minimal page to test FullCalendar in isolation
export default function TestCalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  // Initial scroll effect
  useEffect(() => {
    console.log("[TestPage Effect] Running scroll check.");
    if (!initialScrollDone && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const now = new Date();
      const currentHour = getHours(now);
      // Scroll to one hour before current time (e.g., 09:00:00 if it's 10:xx)
      // Ensure hour is zero-padded
      const targetHour = Math.max(0, currentHour - 1);
      const targetTimeString = `${String(targetHour).padStart(2, '0')}:00:00`;

      console.log(`[TestPage Effect] Conditions met. Target time: ${targetTimeString}. Attempting scrollToTime.`);

      try {
        // Use timeout to ensure calendar API is ready after initial render
        const timerId = setTimeout(() => {
           console.log(`[TestPage Effect @ ${Date.now()}] setTimeout triggered. Calling scrollToTime(${targetTimeString})`);
           if(!initialScrollDone && calendarRef.current) { // Re-check done flag
              calendarRef.current.getApi().scrollToTime(targetTimeString);
              console.log("[TestPage Effect] scrollToTime called. Setting Done=true.");
              setInitialScrollDone(true);
           } else {
              console.log("[TestPage Effect] setTimeout - scroll already done or ref lost.");
           }
        }, 50); // Small delay 
        
        // Basic cleanup (won't handle rapid state changes perfectly, but okay for this test)
        return () => clearTimeout(timerId);

      } catch (error) {
        console.error("[TestPage Effect] Error calling scrollToTime:", error);
      }
    } else {
         console.log(`[TestPage Effect] Skipping scroll. Done: ${initialScrollDone}, Ref Exists: ${!!calendarRef.current}`);
    }
  // Depend on the ref potentially becoming available, and the done flag
  }, [initialScrollDone]); 

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl font-bold mb-4">FullCalendar Test Page</h1>
      <div className="h-[75vh]"> {/* Apply height constraint */} 
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          height="100%" // Fill the container height
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          nowIndicator={true}
          // No events property for now
        />
      </div>
    </div>
  );
} 