import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar as CalendarIcon, Trash2 } from "lucide-react"; // Using CalendarIcon alias
import { format } from 'date-fns';

// Define a basic structure for event details we expect
interface EventDetails {
  id: string; // Add event ID
  title: string;
  start: Date | null;
  end: Date | null;
  // Add other relevant details if needed, e.g., id, description, priority
}

interface FocusEventDetailsSidebarProps {
  eventDetails: EventDetails;
  onClose: () => void; // Function to call when closing the details view
  onDelete: (eventId: string, calendarId: string) => void; // Expect calendarId too
}

// Helper to format date/time range
const formatDateTimeRange = (start: Date | null, end: Date | null): string => {
  if (!start) return "No start time";
  const startDate = format(start, 'PPP'); // e.g., Jun 20, 2024
  const startTime = format(start, 'p'); // e.g., 10:00 AM
  const endTime = end ? format(end, 'p') : 'No end time'; // e.g., 11:00 AM
  return `${startDate}, ${startTime} - ${endTime}`;
};

// Helper to calculate duration
const calculateDuration = (start: Date | null, end: Date | null): string => {
    if (!start || !end) return 'N/A';
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    let durationStr = '';
    if (hours > 0) {
        durationStr += `${hours}h`;
    }
    if (minutes > 0) {
        durationStr += `${hours > 0 ? ' ' : ''}${minutes}m`;
    }
    return durationStr || '0m';
}

export function FocusEventDetailsSidebar({ eventDetails, onClose, onDelete }: FocusEventDetailsSidebarProps) {
  const { id, title, start, end } = eventDetails; // Destructure id

  const formattedDateTime = formatDateTimeRange(start, end);
  const duration = calculateDuration(start, end);

  const handleDeleteClick = () => {
    // Pass the event ID and the calendar ID ('primary')
    onDelete(id, 'primary'); 
  };

  return (
    <Card className="h-full w-full lg:w-80 xl:w-96 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Back to controls">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <CardTitle className="text-lg flex-1 text-center mr-8">Focus Block Details</CardTitle> {/* Added mr-8 to compensate for button */}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto p-4 pt-2">
        <h2 className="text-xl font-semibold">{title || 'Focus Block'}</h2>

        <div className="space-y-3 text-sm text-muted-foreground">
           <div className="flex items-center gap-2">
             <CalendarIcon className="h-4 w-4"/>
             <span>{formattedDateTime}</span>
           </div>
           <div className="flex items-center gap-2">
             <Clock className="h-4 w-4" />
             <span>Duration: {duration}</span>
           </div>
           {/* Add more details here as needed, e.g., Priority, Description */}
           {/* 
           <div className="flex items-center gap-2">
             <Flag className="h-4 w-4" /> 
             <span>Priority: High</span> 
           </div> 
           */}
        </div>

        {/* Placeholder for future actions */}
        <div className="mt-auto pt-4 space-y-2">
           {/* 
           <Button variant="outline" className="w-full">Edit Block</Button>
           <Button variant="destructive" className="w-full">Delete Block</Button> 
           */}
           <Button variant="destructive" className="w-full" onClick={handleDeleteClick}> 
             <Trash2 className="mr-2 h-4 w-4" />
             Delete Block
           </Button> 
           <Button variant="outline" className="w-full" onClick={onClose}>Close Details</Button>
        </div>

      </CardContent>
    </Card>
  );
} 