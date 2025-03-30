import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  enrolledClasses: mongoose.Types.ObjectId[];
  completedAssignments: number;
  submittedAssignments: number;
  totalAssignments: number;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  completedAssignments: { type: Number, default: 0 },
  submittedAssignments: { type: Number, default: 0 },
  totalAssignments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Student = mongoose.model<IStudent>('Student', studentSchema); 