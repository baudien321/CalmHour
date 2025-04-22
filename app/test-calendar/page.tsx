'use client';

import { CalendarView } from "@/components/calendar-view";

// Minimal page to test CalendarView in isolation
export default function TestCalendarPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl font-bold mb-4">CalendarView Test Page</h1>
      <CalendarView />
    </div>
  );
} 