'use client'; // Needed for onClick handlers and potentially hooks later

import Link from 'next/link'; // Import Link
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, Clock } from "lucide-react"; // Added Clock
import AuthButtonClient from "./auth-button-client"; // Reuse the profile dropdown

// Props might be needed later for sync status, last sync time etc.
interface DashboardHeaderProps {
  // Example: isCalendarConnected: boolean;
  // Example: lastSyncTime?: Date;
}

export function DashboardHeader({}: DashboardHeaderProps) {

  // Placeholder handlers - replace with actual logic later
  const handleSync = () => {
    alert('Sync not implemented yet');
    // TODO: Trigger calendar sync logic
  };

  const handleSettings = () => {
    alert('Settings not implemented yet');
    // TODO: Navigate to settings page or open modal
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      
      {/* Logo (similar to main Navbar) */}
      <Link href="/dashboard" className="flex items-center gap-2" prefetch={false}>
         <Clock className="h-6 w-6 text-primary" /> 
         <span className="hidden text-lg font-semibold md:block">CalmHour</span>
      </Link>
      
      {/* Right-side controls */}
      <div className="flex items-center gap-2 md:gap-4">
         {/* Optional: Add Sync Status/Time here like in the HTML example */}
         {/* <div className="text-sm text-muted-foreground hidden md:block">
            Last synced: [Time]
         </div> */}

        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          aria-label="Sync Calendar"
          onClick={handleSync}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          aria-label="Settings"
          onClick={handleSettings}
         >
          <Settings className="h-4 w-4" />
        </Button>
        
        {/* Profile Dropdown/Login Button */} 
        <AuthButtonClient /> 
      </div>
    </header>
  );
} 