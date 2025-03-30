import { Request, Response } from 'express';
import { Discussion } from '../models/Discussion';
import mongoose from 'mongoose';

export class DiscussionController {
  async getClassDiscussions(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      
      // Convert string ID to ObjectId
      const classObjectId = new mongoose.Types.ObjectId(classId);
      
      const discussions = await Discussion.find({ classId: classObjectId })
        .sort({ createdAt: -1 })
        .limit(50);
      
      console.log('Found discussions:', discussions);
      res.json(discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      res.status(500).json({ error: 'Failed to fetch discussions' });
    }
  }

  async createDiscussion(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { message } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { userId, email: userEmail } = req.user;
      const userName = req.user.name || 'Anonymous';

      // Convert string IDs to ObjectIds
      const classObjectId = new mongoose.Types.ObjectId(classId);
      const userObjectId = new mongoose.Types.ObjectId(userId);

      console.log('Creating discussion:', {
        classId: classObjectId,
        userId: userObjectId,
        userName,
        userEmail,
        message
      });

      const discussion = new Discussion({
        classId: classObjectId,
        userId: userObjectId,
        userName,
        userEmail,
        message
      });

      await discussion.save();
      console.log('Discussion saved:', discussion);
      res.status(201).json(discussion);
    } catch (error) {
      console.error('Error creating discussion:', error);
      res.status(500).json({ error: 'Failed to create discussion' });
    }
  }
} 