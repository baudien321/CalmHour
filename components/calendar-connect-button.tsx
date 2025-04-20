'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";

// TODO: Add logic to check if calendar is already connected

export default function CalendarConnectButton({ isConnected = false }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleConnect = async () => {
        setIsLoading(true);
        // Redirect the user to our backend route that starts the Google OAuth flow
        window.location.href = '/api/auth/google/calendar/connect';
        // No need to setIsLoading(false) because the page will redirect
    };

    // Implement handleDisconnect logic
    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/google/calendar/disconnect', {
                method: 'DELETE',
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            toast.success("Google Calendar disconnected successfully!");
            // Refresh the page to reflect the disconnected state
            router.refresh(); 
            // We don't set isLoading to false here because the page will reload

        } catch (error: any) {
            console.error("Failed to disconnect calendar:", error);
            toast.error("Failed to disconnect calendar", { description: error.message });
            setIsLoading(false); // Set loading false only on error
        }
    };

    if (isConnected) {
        return (
            <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Disconnecting..." : "Disconnect Calendar"}
            </Button>
        );
    }

    return (
        <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Redirecting..." : "Connect Google Calendar"}
        </Button>
    );
} 