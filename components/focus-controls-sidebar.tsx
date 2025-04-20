'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Helper function to format minutes to hours/minutes
function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let result = '';
  if (hours > 0) {
    result += `${hours}h`;
  }
  if (mins > 0) {
    result += `${hours > 0 ? ' ' : ''}${mins}m`;
  }
  return result || '0m';
}

export function FocusControlsSidebar() {
  // State for interactive elements
  const [duration, setDuration] = useState(60);
  const [customDuration, setCustomDuration] = useState([60]);
  const [isUsingCustomDuration, setIsUsingCustomDuration] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = useState(true);
  const [priority, setPriority] = useState("high");
  const [sessionName, setSessionName] = useState("");

  // State for API calls
  const [isAddingFocusTime, setIsAddingFocusTime] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Fetch initial settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetchingSettings(true);
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) {
           const errorData = await response.json().catch(() => ({})); // Try to get error details
           throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAutoSchedule(data.auto_schedule_enabled ?? false); // Set initial state from API
      } catch (error: any) {
        console.error("Failed to fetch initial settings:", error);
        toast.error("Failed to load settings", { description: error.message });
        // Keep default state (false) if fetch fails
      } finally {
        setIsFetchingSettings(false);
      }
    };
    fetchSettings();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleDurationButtonClick = (value: number) => {
    setDuration(value);
    setCustomDuration([value]);
    setIsUsingCustomDuration(false);
  };

  const handleSliderChange = (value: number[]) => {
      setCustomDuration(value);
      setDuration(value[0]);
      setIsUsingCustomDuration(true);
  };

  const handleAddFocusTime = async () => {
    setIsAddingFocusTime(true);
    const effectiveDuration = duration;
    const currentPriority = priority as 'high' | 'medium' | 'low';

    console.log(`Attempting to add focus time: ${effectiveDuration} minutes, Priority: ${currentPriority}, Name: ${sessionName || '(Default)'}`);

    try {
      const response = await fetch('/api/calendar/add-focus-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration: effectiveDuration,
          sessionName: sessionName || undefined,
          priority: currentPriority,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      toast.success(result.message || 'Focus time scheduled successfully!', {
          description: `Created event: ${result.event?.summary} (${new Date(result.event?.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${new Date(result.event?.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })})`,
          action: result.event?.link ? { label: "View Event", onClick: () => window.open(result.event.link, '_blank') } : undefined,
      });

    } catch (error: any) {
      console.error("Failed to add focus time:", error);
      toast.error("Failed to schedule focus time", {
          description: error.message || "An unknown error occurred.",
      });
    } finally {
      setIsAddingFocusTime(false);
    }
  };

  const handleAutoScheduleChange = async (checked: boolean) => {
      const previousValue = autoSchedule;
      setAutoSchedule(checked);
      setIsUpdatingSettings(true);

      try {
          const response = await fetch('/api/user/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ auto_schedule_enabled: checked }),
          });

          const result = await response.json();

          if (!response.ok) {
              throw new Error(result.error || `HTTP error! status: ${response.status}`);
          }

          console.log("Auto-schedule setting updated successfully to:", result.auto_schedule_enabled);
          setAutoSchedule(result.auto_schedule_enabled);
          
      } catch (error: any) {
          console.error("Failed to update auto-schedule setting:", error);
          toast.error("Failed to update setting", { description: error.message });
          setAutoSchedule(previousValue);
      } finally {
          setIsUpdatingSettings(false);
      }
  };

  return (
    <Card className="h-full w-full lg:w-80 xl:w-96 flex flex-col">
      <CardHeader>
        <CardTitle>Focus Block Controls</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-6 overflow-y-auto p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={handleAddFocusTime} 
          disabled={isAddingFocusTime || isFetchingSettings}
        >
          {isAddingFocusTime ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {isAddingFocusTime ? 'Scheduling...' : 'Add Focus Time Manually'}
        </Button>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Duration</h3>
          <div className="flex space-x-2 mb-4">
            <Button variant={!isUsingCustomDuration && duration === 30 ? "default" : "outline"} onClick={() => handleDurationButtonClick(30)} className="flex-1">30m</Button>
            <Button variant={!isUsingCustomDuration && duration === 60 ? "default" : "outline"} onClick={() => handleDurationButtonClick(60)} className="flex-1">1h</Button>
            <Button variant={!isUsingCustomDuration && duration === 120 ? "default" : "outline"} onClick={() => handleDurationButtonClick(120)} className="flex-1">2h</Button>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="custom-duration" className="text-xs text-muted-foreground">Custom Duration</Label>
              <span className="text-xs font-medium">{formatMinutes(customDuration[0])}</span>
            </div>
            <Slider
              id="custom-duration"
              min={15}
              max={240}
              step={15}
              value={customDuration}
              onValueChange={handleSliderChange}
              aria-label="Custom Duration Slider"
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Parameters</h3>
          <div className="flex justify-between items-center mb-4">
            <Label htmlFor="auto-schedule" className="text-sm flex items-center gap-1">
               Auto-schedule 
               {(isFetchingSettings || isUpdatingSettings) && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground"/>}
               {!isFetchingSettings && !isUpdatingSettings && <Info className="h-3 w-3 text-muted-foreground" />}
            </Label>
            <Switch
              id="auto-schedule"
              checked={autoSchedule}
              onCheckedChange={handleAutoScheduleChange}
              disabled={isFetchingSettings || isUpdatingSettings}
              aria-label="Toggle auto-scheduling"
            />
          </div>

          <div className="mb-4">
            <Label className="text-sm block mb-2">Priority Level</Label>
            <RadioGroup value={priority} onValueChange={setPriority} className="space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="p-high" />
                <Label htmlFor="p-high" className="text-sm font-normal">High - Must do today</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="p-medium" />
                <Label htmlFor="p-medium" className="text-sm font-normal">Medium - Should do soon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="p-low" />
                <Label htmlFor="p-low" className="text-sm font-normal">Low - When possible</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="session-name" className="text-sm mb-1 block">Focus Session Name</Label>
            <Input 
              id="session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Deep Work, Project X"
            />
          </div>
        </div>

        <Separator />

        <div>
           <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-1">
              Smart Suggestions <Info className="h-3 w-3 text-muted-foreground" />
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground italic">
                (Smart suggestions will appear here in a future update)
              </p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
} 