import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  classes: mongoose.Types.ObjectId[];
  totalStudents: number;
  totalAssignments: number;
  pendingGrades: number;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  totalStudents: { type: Number, default: 0 },
  totalAssignments: { type: Number, default: 0 },
  pendingGrades: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
teacherSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema); 