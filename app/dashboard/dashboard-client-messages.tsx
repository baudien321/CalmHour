'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function DashboardClientMessages() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const successMessage = searchParams.get('calendar_connected');
    const errorMessage = searchParams.get('calendar_error');

    if (successMessage) {
      toast.success('Google Calendar connected successfully!');
      // Optional: Clear the search param to avoid showing toast on refresh
      // Note: This requires Next.js router, which might be overkill here.
      // Consider if this behavior is needed.
    }

    if (errorMessage) {
      toast.error(`Calendar Connection Error: ${decodeURIComponent(errorMessage)}`);
      // Optional: Clear the search param
    }

    // Run only once when the component mounts and searchParams change
  }, [searchParams]);

  // This component doesn't render anything itself
  return null;
} 