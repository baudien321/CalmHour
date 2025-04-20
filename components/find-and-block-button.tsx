'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FindAndBlockButtonProps {
  isConnected: boolean;
}

export default function FindAndBlockButton({ isConnected }: FindAndBlockButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFindAndBlock = async () => {
    setIsLoading(true);
    toast.loading('Finding and blocking focus time...');

    try {
      const response = await fetch('/api/calendar/find-and-block', {
        method: 'POST',
      });

      const result = await response.json();
      toast.dismiss(); // Dismiss loading toast

      if (!response.ok) {
        // Handle specific errors based on status code or message
        console.error('API Error:', result);
        toast.error(result.error || 'Failed to find or block time.');
      } else {
        // Handle success (including partial success)
        toast.success(result.message || 'Operation completed.');
        // Optional: display details from result.createdEventIds or result.errors
        if (result.errors && result.errors.length > 0) {
          console.error('Event Creation Errors:', result.errors);
          // Maybe show a more detailed error toast or log
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.dismiss();
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFindAndBlock}
      disabled={!isConnected || isLoading}
      aria-disabled={!isConnected || isLoading}
    >
      {isLoading ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</>
      ) : (
        'Find & Block Focus Time'
      )}
    </Button>
  );
} 