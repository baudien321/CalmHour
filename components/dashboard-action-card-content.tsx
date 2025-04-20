'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import CalendarConnectButton from "@/components/calendar-connect-button";
// We could import FindAndBlockButton, but let's integrate its logic here
// to manage the feedback state more easily.
// import FindAndBlockButton from "@/components/find-and-block-button"; 

interface DashboardActionCardContentProps {
  isCalendarConnected: boolean;
}

export function DashboardActionCardContent({ isCalendarConnected }: DashboardActionCardContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRunStatus, setLastRunStatus] = useState<string | null>(null);

  const handleFindAndBlock = async () => {
    setIsLoading(true);
    setLastRunStatus('Processing...'); // Set initial status
    toast.loading('Finding and blocking focus time...');

    try {
      const response = await fetch('/api/calendar/find-and-block', {
        method: 'POST',
      });

      const result = await response.json();
      toast.dismiss(); // Dismiss loading toast

      if (!response.ok) {
        console.error('API Error:', result);
        const errorMessage = result.error || 'Failed to find or block time.';
        toast.error(errorMessage);
        setLastRunStatus(`Error: ${errorMessage}`);
      } else {
        const successMessage = result.message || 'Operation completed.';
        toast.success(successMessage);
        setLastRunStatus(`Last run: ${successMessage} (${new Date().toLocaleTimeString()})`);
        // Log errors if any events failed
        if (result.errors && result.errors.length > 0) {
          console.error('Event Creation Errors:', result.errors);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.dismiss();
      const fetchErrorMessage = 'An unexpected error occurred.';
      toast.error(fetchErrorMessage);
      setLastRunStatus(`Error: ${fetchErrorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      {!isCalendarConnected && (
        <CalendarConnectButton isConnected={isCalendarConnected} />
      )}

      {isCalendarConnected && (
        <Button
          onClick={handleFindAndBlock}
          disabled={isLoading}
          aria-disabled={isLoading}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding Slots...</>
          ) : (
            'Find & Block Focus Time'
          )}
        </Button>
      )}

      {/* Display last run status */}
      {isCalendarConnected && lastRunStatus && (
        <p className="text-sm text-muted-foreground mt-2">
          {lastRunStatus}
        </p>
      )}
    </div>
  );
} 