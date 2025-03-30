import { useState, useEffect, useCallback } from 'react';

// Google Calendar API Configuration
const GOOGLE_CALENDAR_API_KEY = 'YOUR_API_KEY_HERE'; // This is a mock API key, replace with your actual key
const GOOGLE_SERVICE_ACCOUNT = 'smartclass@analar-surf-454907-p6.iam.gserviceaccount.com';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  allDay?: boolean;
}

export const useGoogleCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the fetchEvents function
  const fetchEvents = useCallback(async (startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call to your backend
      // which would use the Google Calendar API with the service account
      console.log(`Fetching events from ${startDate} to ${endDate} using ${GOOGLE_SERVICE_ACCOUNT}`);
      
      // Mock data for demonstration
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Advanced Mathematics',
          start: new Date(new Date().setHours(9, 0, 0, 0)),
          end: new Date(new Date().setHours(10, 30, 0, 0)),
          description: 'Chapter 5: Calculus Basics',
          location: 'Room 101'
        },
        {
          id: '2',
          title: 'Programming Assignment Due',
          start: new Date(new Date().setHours(23, 59, 0, 0)),
          end: new Date(new Date().setHours(23, 59, 0, 0)),
          description: 'Submit your code to GitHub',
          allDay: true
        },
        {
          id: '3',
          title: 'Computer Science',
          start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(13, 0, 0, 0)),
          end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 30, 0, 0)),
          description: 'Algorithms and Data Structures',
          location: 'Lab 3'
        }
      ];
      
      setEvents(mockEvents);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch calendar events'));
      setLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any external values

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    setLoading(true);
    try {
      // Mock implementation
      console.log('Adding event to calendar using service account:', GOOGLE_SERVICE_ACCOUNT);
      console.log('Event details:', event);
      
      // Generate a mock ID and add to events
      const newEvent: CalendarEvent = {
        ...event,
        id: Math.random().toString(36).substring(2, 11)
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      setLoading(false);
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add calendar event'));
      setLoading(false);
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    addEvent
  };
};
