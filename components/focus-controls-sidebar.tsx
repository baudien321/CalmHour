'use client';

import { useState, useEffect } from 'react';
import { format } from "date-fns"; // Import format for date picker
import { Calendar as CalendarIcon } from "lucide-react"; // Import Calendar icon

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover
import { Calendar } from "@/components/ui/calendar"; // Import Calendar
import { cn } from "@/lib/utils"; // Import cn utility
import { Plus, Info, Loader2, Clock } from "lucide-react"; // Add Clock icon
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

// --- Define props for the component --- 
interface FocusControlsSidebarProps {
  onEventAdded: () => void; // Callback function when an event is added
}
// --- END Define props ---

export function FocusControlsSidebar({ onEventAdded }: FocusControlsSidebarProps) {
  // State for interactive elements
  const [duration, setDuration] = useState(60);
  const [customDuration, setCustomDuration] = useState([60]);
  const [isUsingCustomDuration, setIsUsingCustomDuration] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = useState(true);
  const [priority, setPriority] = useState("high");
  const [sessionName, setSessionName] = useState("");

  // --- NEW State for Date/Time Selection ---
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("09:00"); // Default time, e.g., 9 AM
  // --- END NEW State ---

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

    // --- Combine Date and Time --- 
    let startDateTimeISO: string | undefined = undefined;
    if (selectedDate) {
      try {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const combinedDate = new Date(selectedDate); // Create a new Date object to avoid modifying the state directly
          combinedDate.setHours(hours, minutes, 0, 0); // Set hours and minutes
          startDateTimeISO = combinedDate.toISOString();
          console.log(`Combined startTime: ${startDateTimeISO}`);
        } else {
           throw new Error('Invalid time format. Please use HH:MM.');
        }
      } catch (e: any) {
         toast.error("Invalid Start Time", { description: e.message });
         setIsAddingFocusTime(false);
         return; // Stop execution if time is invalid
      }
    } else {
       toast.error("Please select a date.");
       setIsAddingFocusTime(false);
       return; // Stop execution if date is not selected
    }
    // --- END Combine Date and Time ---

    console.log(`Attempting to add focus time: ${effectiveDuration} minutes, Priority: ${currentPriority}, Name: ${sessionName || '(Default)'}, Start: ${startDateTimeISO}`);

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
          startTime: startDateTimeISO, // <-- Add the specific start time
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      toast.success(result.message || 'Focus time scheduled successfully!', {
          description: result.event?.start ? `Created event: ${result.event?.summary} (${new Date(result.event.start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })})` : 'Scheduling details unavailable.', // Improved description
          action: result.event?.link ? { label: "View Event", onClick: () => window.open(result.event.link, '_blank') } : undefined,
      });

      // --- Call the callback function --- 
      onEventAdded(); 
      // --- END Call callback ---

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

        {/* --- NEW Date/Time Selection UI --- */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="focus-date" className="text-xs text-muted-foreground mb-1 block">Start Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="focus-date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                            )}
                            disabled={isAddingFocusTime}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div>
                 <Label htmlFor="focus-time" className="text-xs text-muted-foreground mb-1 block">Start Time (HH:MM)</Label>
                 <div className="relative">
                     <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input 
                         id="focus-time"
                         type="time" // Use type="time" for better browser support/native pickers
                         value={selectedTime}
                         onChange={(e) => setSelectedTime(e.target.value)} 
                         className="pl-10" // Add padding for the icon
                         disabled={isAddingFocusTime}
                         // Consider adding pattern="[0-9]{2}:[0-9]{2}" for basic format guidance
                     />
                 </div>
            </div>
        </div>
        {/* --- END NEW Date/Time Selection UI --- */}

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