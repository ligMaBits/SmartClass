import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  classId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  type: 'assignment' | 'class' | 'exam' | 'other';
  color?: string;
  isAllDay?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const calendarSchema = new Schema<ICalendarEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['assignment', 'class', 'exam', 'other'],
      default: 'other',
    },
    color: {
      type: String,
      default: '#3788d8',
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
calendarSchema.index({ classId: 1, startDate: 1, endDate: 1 });
calendarSchema.index({ createdBy: 1 });

export const Calendar = mongoose.model<ICalendarEvent>('Calendar', calendarSchema); 