Console Error


Error: Failed to query Google Calendar free/busy information. Google Error: Request had insufficient authentication scopes.

components\focus-controls-sidebar.tsx (101:15) @ handleAddFocusTime


   99 |
  100 |       if (!response.ok) {
> 101 |         throw new Error(result.error || `HTTP error! status: ${response.status}`);
      |               ^
  102 |       }
  103 |
  104 |       toast.success(result.message || 'Focus time scheduled successfully!', {
Call Stack
1

handleAddFocusTime
components\focus-controls-sidebar.tsx (101:15)