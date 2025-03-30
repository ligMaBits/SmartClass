import { Request, Response } from 'express';
import { Calendar } from '../models/Calendar';
import { ObjectId } from 'mongodb';

export class CalendarController {
  // Create a new calendar event
  async createEvent(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        classId,
        type,
        color,
        isAllDay
      } = req.body;

      const userId = req.user?._id; // Assuming user ID is added by auth middleware

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const event = new Calendar({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        classId: new ObjectId(classId),
        createdBy: userId,
        type,
        color,
        isAllDay
      });

      await event.save();
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      res.status(500).json({ message: 'Failed to create calendar event' });
    }
  }

  // Get all events for a class
  async getClassEvents(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const events = await Calendar.find({ classId: new ObjectId(classId) })
        .populate('createdBy', 'name email')
        .sort({ startDate: 1 });
      res.json(events);
    } catch (error) {
      console.error('Error fetching class events:', error);
      res.status(500).json({ message: 'Failed to fetch calendar events' });
    }
  }

  // Get all events for a user
  async getUserEvents(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const events = await Calendar.find({ createdBy: userId })
        .populate('classId', 'name')
        .sort({ startDate: 1 });
      res.json(events);
    } catch (error) {
      console.error('Error fetching user events:', error);
      res.status(500).json({ message: 'Failed to fetch calendar events' });
    }
  }

  // Update a calendar event
  async updateEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const updates = req.body;

      const event = await Calendar.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is authorized to update this event
      if (event.createdBy.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }

      // Update only allowed fields
      const allowedUpdates = ['title', 'description', 'startDate', 'endDate', 'type', 'color', 'isAllDay'];
      allowedUpdates.forEach(update => {
        if (updates[update] !== undefined) {
          event[update] = updates[update];
        }
      });

      await event.save();
      res.json(event);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      res.status(500).json({ message: 'Failed to update calendar event' });
    }
  }

  // Delete a calendar event
  async deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const event = await Calendar.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user is authorized to delete this event
      if (event.createdBy.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
      }

      await event.deleteOne();
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      res.status(500).json({ message: 'Failed to delete calendar event' });
    }
  }
} 