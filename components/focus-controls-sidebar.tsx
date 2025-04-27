'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfDay, getHours, getMinutes, addHours, set } from "date-fns"; // Added date-fns helpers
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
import { Plus, Info, Loader2, Save, X } from "lucide-react"; // Add Save, X icons
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
interface EventDetailsForEdit {
  id: string;
  title: string;
  start: Date | null;
  end: Date | null;
}

interface FocusControlsSidebarProps {
  onEventAdded?: () => void; // Make optional, only used in add mode
  // --- Props for Edit Mode ---
  isEditing?: boolean;
  initialEventData?: EventDetailsForEdit | null;
  onUpdate?: (formData: any) => Promise<void>; // Function to call on update
  onCancelEdit?: () => void; // Function to call on cancel
  isLoading?: boolean; // Loading state from parent (for update/add)
}
// --- END Define props ---

// Helper Function to get default time parts
const getDefaultTimeParts = () => {
  const now = new Date();
  // Use addHours for simplicity, then set minutes/seconds
  const nextHourDate = set(addHours(now, 1), { minutes: 0, seconds: 0, milliseconds: 0 });
  const hour24 = getHours(nextHourDate);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  hour12 = hour12 === 0 ? 12 : hour12; // Handle midnight/noon
  return {
    hour: hour12.toString(),
    minute: '00',
    period,
  };
};

export function FocusControlsSidebar({
  onEventAdded,
  isEditing = false, // Default to false (add mode)
  initialEventData = null,
  onUpdate,
  onCancelEdit,
  isLoading = false, // Default loading state
}: FocusControlsSidebarProps) {
  // State for interactive elements
  const [duration, setDuration] = useState(60);
  const [customDuration, setCustomDuration] = useState([60]);
  const [isUsingCustomDuration, setIsUsingCustomDuration] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = useState(true);
  const [priority, setPriority] = useState("medium");
  const [sessionName, setSessionName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // ** NEW State for Custom Time Picker **
  const [selectedHour, setSelectedHour] = useState<string>(() => getDefaultTimeParts().hour);
  const [selectedMinute, setSelectedMinute] = useState<string>(() => getDefaultTimeParts().minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(() => getDefaultTimeParts().period as 'AM' | 'PM');

  // ** Internal state for 24-hour time (HH:MM), derived from custom picker **
  const [selectedTime, setSelectedTime] = useState<string>(""); 

  // No longer needed here, parent controls this via isLoading prop
  // const [isAddingFocusTime, setIsAddingFocusTime] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // ** NEW Effect to sync custom time picker parts to internal selectedTime (HH:MM) **
  useEffect(() => {
    const hourNum = parseInt(selectedHour, 10);
    const minuteNum = parseInt(selectedMinute, 10);

    if (isNaN(hourNum) || isNaN(minuteNum)) {
      // Handle potential parsing errors if needed
      return;
    }

    let hour24 = hourNum;
    if (selectedPeriod === 'PM' && hourNum !== 12) {
      hour24 += 12;
    } else if (selectedPeriod === 'AM' && hourNum === 12) { // Handle 12 AM (midnight)
      hour24 = 0;
    }

    const formattedHour = hour24.toString().padStart(2, '0');
    const formattedMinute = selectedMinute.padStart(2, '0'); // Keep minutes as is ('00', '15'...)
    
    setSelectedTime(`${formattedHour}:${formattedMinute}`);
    console.log(`[Time Sync] Hour: ${selectedHour}, Min: ${selectedMinute}, Period: ${selectedPeriod} => 24H Time: ${formattedHour}:${formattedMinute}`);

  }, [selectedHour, selectedMinute, selectedPeriod]);

  // Effect for pre-filling/resetting form
  useEffect(() => {
    if (isEditing && initialEventData && initialEventData.start && initialEventData.end) {
      console.log("[FocusControlsSidebar] Pre-filling form for edit:", initialEventData);
      const start = initialEventData.start;
      const end = initialEventData.end;
      
      // Set Date
      setSelectedDate(startOfDay(start));
      
      // ** NEW: Set Time Parts from initialEventData **
      const startHour24 = getHours(start);
      const startMinute = getMinutes(start);
      const startPeriod = startHour24 >= 12 ? 'PM' : 'AM';
      let startHour12 = startHour24 % 12;
      startHour12 = startHour12 === 0 ? 12 : startHour12; // Handle midnight/noon
      
      setSelectedHour(startHour12.toString());
      // Format minute for select options ('00', '15', '30', '45')
      // Find the closest 15-minute interval or keep exact if needed
      const minuteOptions = ['00', '15', '30', '45'];
      const closestMinute = minuteOptions.reduce((prev, curr) => 
         Math.abs(parseInt(curr) - startMinute) < Math.abs(parseInt(prev) - startMinute) ? curr : prev
       );
      setSelectedMinute(closestMinute); 
      // setSelectedMinute(startMinute.toString().padStart(2, '0')); // Or keep exact minute if Select allows
      setSelectedPeriod(startPeriod);
      // No need to set selectedTime here, the sync effect will handle it
      
      // Set Duration
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      setDuration(diffMins);
      setCustomDuration([diffMins]);
      setIsUsingCustomDuration(![30, 60, 90, 120].includes(diffMins)); 

      // Set Session Name
      setSessionName(initialEventData.title || "");
      
      // Set Priority (Skipped for now)
      setPriority('medium'); 

    } else if (!isEditing) {
       // Reset form when switching back to add mode
       setDuration(60);
       setCustomDuration([60]);
       setIsUsingCustomDuration(false);
       setPriority("medium");
       setSessionName("");
       setSelectedDate(new Date());
       
       // ** NEW: Reset Time Parts using default **
       const defaultParts = getDefaultTimeParts();
       setSelectedHour(defaultParts.hour);
       setSelectedMinute(defaultParts.minute);
       setSelectedPeriod(defaultParts.period as 'AM' | 'PM');
       // No need to set selectedTime here, the sync effect will handle it
    }
    // Dependency array includes new time parts state
  }, [isEditing, initialEventData]); 

  // Fetch initial settings (only auto-schedule for now)
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

  // Form submission handler (uses the derived selectedTime state)
  const handleFormSubmit = async () => {
    const effectiveDuration = duration;
    const currentPriority = priority as 'high' | 'medium' | 'low';
    let startDateTime: Date | undefined = undefined;

    // --- Combine Date and Time --- 
    if (selectedDate && selectedTime) { // Check selectedTime is available
      try {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          startDateTime = new Date(selectedDate);
          // Use set directly for clarity
          startDateTime = set(startDateTime, { hours: hours, minutes: minutes, seconds: 0, milliseconds: 0 });
          console.log(`Combined startTime Date object:`, startDateTime);
        } else {
           throw new Error('Invalid time format derived. Please check time selection.');
        }
      } catch (e: any) {
         toast.error("Invalid Start Time", { description: e.message });
         return; // Stop execution if time is invalid
      }
    } else if (!selectedDate) {
       toast.error("Please select a date.");
       return; 
    } else {
        toast.error("Please select a time."); // Add check for time
        return;
    }
    // --- END Combine Date and Time ---

    const formData = {
        duration: effectiveDuration,
        sessionName: sessionName || undefined, 
        priority: currentPriority,
        dateTime: startDateTime, 
    };

    if (isEditing) {
      if (onUpdate) {
        console.log("[FocusControlsSidebar] Submitting update:", formData);
        await onUpdate(formData); 
      } else {
        console.error("onUpdate handler is missing in edit mode!");
      }
    } else {
      if (onEventAdded) {
        console.log("[FocusControlsSidebar] Submitting add:", formData);
        try {
            const response = await fetch('/api/calendar/add-focus-time', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                ...formData, 
                // Ensure dateTime exists before calling toISOString()
                startTime: formData.dateTime?.toISOString() 
              }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `HTTP error! status: ${response.status}`);
            // Check if dateTime was defined before showing success
            if(formData.dateTime) {
              toast.success(result.message || 'Focus time scheduled successfully!');
              onEventAdded(); 
            } else {
              // This case should ideally not happen due to checks above
              toast.error("Could not schedule: Time data missing.");
            }
        } catch (error: any) {
            console.error("Failed to add focus time:", error);
            toast.error("Failed to schedule focus time", { description: error.message });
        }
      } else {
         console.error("onEventAdded handler is missing in add mode!");
      }
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

  // Generate options for selects
  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minuteOptions = ['00', '15', '30', '45']; // Example minute options

  return (
    <Card className="h-full w-full lg:w-80 xl:w-96 flex flex-col">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Focus Block' : 'Focus Block Controls'}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-6 overflow-y-auto p-4 pt-0">
        {/* Main Action Button (Add or Update) */}
        <Button 
          className="w-full" 
          onClick={handleFormSubmit} 
          disabled={isLoading || isFetchingSettings}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEditing ? (
            <Save className="mr-2 h-4 w-4" />
          ) : (
          <Plus className="mr-2 h-4 w-4" />
          )}
          {isLoading ? (isEditing ? 'Updating...' : 'Scheduling...') : (isEditing ? 'Update Block' : 'Add Focus Time Manually')}
        </Button>

        {/* Cancel Button (Only in Edit Mode) */}
        {isEditing && onCancelEdit && (
           <Button 
             variant="outline"
             className="w-full"
             onClick={onCancelEdit}
             disabled={isLoading}
           >
              <X className="mr-2 h-4 w-4" />
              Cancel Edit
            </Button>
        )}

        {/* Form Elements (Date, Time, Duration, Priority, Name) */}
        {/* --- NEW Date/Time Selection UI --- */}
        <div className="grid grid-cols-1 gap-4">
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
                            disabled={isLoading} // Disable while loading
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
                            disabled={isLoading}
                        />
                    </PopoverContent>
                </Popover>
          </div>
          <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Start Time</Label>
                <div className="grid grid-cols-3 gap-2 items-center">
                    {/* Hour Select */}
                    <Select value={selectedHour} onValueChange={setSelectedHour} disabled={isLoading}>
                        <SelectTrigger id="focus-hour">
                            <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                            {hourOptions.map(hour => (
                                <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {/* Minute Select */}
                    <Select value={selectedMinute} onValueChange={setSelectedMinute} disabled={isLoading}>
                        <SelectTrigger id="focus-minute">
                            <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                            {minuteOptions.map(minute => (
                                <SelectItem key={minute} value={minute}>:{minute}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* AM/PM Radio Group */}
                    <RadioGroup 
                        value={selectedPeriod} 
                        onValueChange={(value) => setSelectedPeriod(value as 'AM' | 'PM')} 
                        className="flex space-x-1 bg-muted p-1 rounded-md"
                        disabled={isLoading}
                    >
                        <RadioGroupItem value="AM" id="time-am" className="sr-only" />
                        <Label 
                          htmlFor="time-am" 
                          className={cn(
                            "flex-1 text-center text-xs font-medium p-1 rounded-sm cursor-pointer",
                            selectedPeriod === 'AM' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          AM
                        </Label>
                        <RadioGroupItem value="PM" id="time-pm" className="sr-only" />
                        <Label 
                          htmlFor="time-pm" 
                          className={cn(
                            "flex-1 text-center text-xs font-medium p-1 rounded-sm cursor-pointer",
                            selectedPeriod === 'PM' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          PM
                        </Label>
                    </RadioGroup>
                </div>
            </div>
        </div>
        {/* --- END NEW Date/Time Selection UI --- */}

        {/* Duration Controls */}
         <div>
          <Label className="text-xs text-muted-foreground">Duration</Label>
          <div className="grid grid-cols-4 gap-2 my-2">
              {[30, 60, 90, 120].map((val) => (
                  <Button 
                      key={val} 
                      variant={duration === val && !isUsingCustomDuration ? "default" : "outline"}
                      onClick={() => handleDurationButtonClick(val)}
                      size="sm"
                      disabled={isLoading}
                  >
                      {formatMinutes(val)}
                  </Button>
              ))}
            </div>
            <Slider
            value={customDuration}
            onValueChange={handleSliderChange}
            max={180} 
              step={15}
            className={cn("w-full", isUsingCustomDuration && "mt-3")}
            disabled={isLoading}
            />
          <p className="text-sm text-center text-muted-foreground mt-2">{formatMinutes(duration)}</p>
        </div>

        {/* Priority Controls */}
        <div>
          <Label className="text-xs text-muted-foreground">Priority</Label>
          <RadioGroup 
             value={priority}
             onValueChange={setPriority}
             className="flex space-x-2 mt-1"
             disabled={isLoading} // Disable group while loading
          >
             <div className="flex items-center space-x-1">
                <RadioGroupItem value="high" id="p-high" disabled={isLoading} />
                <Label htmlFor="p-high" className="text-sm font-normal cursor-pointer">High</Label>
          </div>
            <div className="flex items-center space-x-1">
                <RadioGroupItem value="medium" id="p-medium" disabled={isLoading} />
                <Label htmlFor="p-medium" className="text-sm font-normal cursor-pointer">Medium</Label>
              </div>
            <div className="flex items-center space-x-1">
                <RadioGroupItem value="low" id="p-low" disabled={isLoading} />
                <Label htmlFor="p-low" className="text-sm font-normal cursor-pointer">Low</Label>
              </div>
            </RadioGroup>
          </div>

        {/* Session Name */}
          <div>
          <Label htmlFor="session-name" className="text-xs text-muted-foreground">Session Name (Optional)</Label>
            <Input 
              id="session-name"
             placeholder="e.g., Work on report" 
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
             className="mt-1"
             disabled={isLoading}
            />
        </div>

        {/* Auto-schedule Toggle (Kept separate) */}
        <Separator />
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="auto-schedule" className="flex flex-col space-y-1">
            <span className="font-medium">Auto-Schedule</span>
            <span className="font-normal text-xs leading-snug text-muted-foreground">
              Allow CalmHour to automatically find & book focus blocks.
            </span>
          </Label>
          <Switch 
            id="auto-schedule" 
            checked={autoSchedule}
            onCheckedChange={handleAutoScheduleChange}
            disabled={isUpdatingSettings || isFetchingSettings}
          />
        </div>

      </CardContent>
    </Card>
  );
} 