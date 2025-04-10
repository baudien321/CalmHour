'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";

// TODO: Add logic to check if calendar is already connected

export default function CalendarConnectButton({ isConnected = false }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        // Redirect the user to our backend route that starts the Google OAuth flow
        window.location.href = '/api/auth/google/calendar/connect';
        // No need to setIsLoading(false) because the page will redirect
    };

    // TODO: Add handleDisconnect logic
    const handleDisconnect = async () => {
        console.log("Disconnect logic not implemented yet.");
        // Needs backend API call to delete tokens and update UI
    };

    if (isConnected) {
        return (
            <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                {isLoading ? "Processing..." : "Disconnect Calendar"}
            </Button>
        );
    }

    return (
        <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? "Redirecting..." : "Connect Google Calendar"}
        </Button>
    );
} 