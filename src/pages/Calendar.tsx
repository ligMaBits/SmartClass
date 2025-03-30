import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Clock, MapPin, Plus } from 'lucide-react';
import { useGoogleCalendar } from '@/lib/googleCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const CalendarPage = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour from now
    allDay: false
  });
  
  const { events, loading, error, fetchEvents, addEvent } = useGoogleCalendar();

  // Memoize the date range calculation
  const getDateRange = useCallback((selectedDate: Date) => {
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    return { startOfMonth, endOfMonth };
  }, []);
  
  useEffect(() => {
    if (date) {
      const { startOfMonth, endOfMonth } = getDateRange(date);
      fetchEvents(startOfMonth, endOfMonth);
    }
  }, [date, fetchEvents, getDateRange]);
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };
  
  const handleAddEvent = async () => {
    try {
      await addEvent(newEvent);
      setIsAddingEvent(false);
      setNewEvent({
        title: '',
        description: '',
        location: '',
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000),
        allDay: false
      });
    } catch (err) {
      console.error('Failed to add event:', err);
    }
  };
  
  const eventsForSelectedDate = date 
    ? events.filter(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const selectedDate = new Date(date);
        
        // Set time to midnight for date comparison
        selectedDate.setHours(0, 0, 0, 0);
        eventStart.setHours(0, 0, 0, 0);
        eventEnd.setHours(0, 0, 0, 0);
        
        // Event overlaps with selected date if:
        // 1. Event starts on selected date
        // 2. Event ends on selected date
        // 3. Event spans across selected date
        return (
          eventStart.getTime() === selectedDate.getTime() ||
          eventEnd.getTime() === selectedDate.getTime() ||
          (eventStart.getTime() <= selectedDate.getTime() && eventEnd.getTime() >= selectedDate.getTime())
        );
      })
    : [];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          Manage your schedule and view upcoming events
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
            
            <div className="mt-4">
              <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                      Fill in the details for your new event
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Start Time</Label>
                      <Input
                        type="datetime-local"
                        value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>End Time</Label>
                      <Input
                        type="datetime-local"
                        value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allDay"
                        checked={newEvent.allDay}
                        onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                      />
                      <Label htmlFor="allDay">All Day Event</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Events for {date ? format(date, 'MMMM d, yyyy') : 'Selected Date'}
            </CardTitle>
            <CardDescription>
              View and manage your events for the selected date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading events...</div>
            ) : error ? (
              <div className="text-red-500">Error: {error.message}</div>
            ) : eventsForSelectedDate.length === 0 ? (
              <div className="text-muted-foreground">No events scheduled for this date</div>
            ) : (
              <div className="space-y-4">
                {eventsForSelectedDate.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{event.title}</p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {format(event.start, 'MMM d, yyyy')} -{' '}
                          {format(event.end, 'MMM d, yyyy')}
                        </span>
                        {!event.allDay && (
                          <>
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(event.start, 'h:mm a')} -{' '}
                              {format(event.end, 'h:mm a')}
                            </span>
                          </>
                        )}
                        {event.location && (
                          <>
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
