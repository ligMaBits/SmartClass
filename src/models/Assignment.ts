import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  content: string;
  attachments: Array<{
    filename: string;
    originalname: string;
    path: string;
    size: number;
  }>;
  submittedAt: Date;
  status: 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  gradedAt?: Date;
}

export interface IAssignment extends Document {
  title: string;
  description: string;
  dueDate: Date;
  classId: mongoose.Types.ObjectId;
  status: 'active' | 'archived';
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  points: number;
  submissions: ISubmission[];
  totalSubmissions: number;
  gradedSubmissions: number;
  averageGrade?: number;
}

const submissionSchema = new Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [{
    filename: String,
    originalname: String,
    path: String,
    size: Number
  }],
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  grade: { type: Number },
  feedback: { type: String },
  gradedAt: { type: Date }
});

const assignmentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true, default: 100 },
  submissions: [submissionSchema],
  totalSubmissions: { type: Number, default: 0 },
  gradedSubmissions: { type: Number, default: 0 },
  averageGrade: { type: Number }
});

// Update statistics before saving
assignmentSchema.pre('save', function(next) {
  this.totalSubmissions = this.submissions.length;
  this.gradedSubmissions = this.submissions.filter(sub => sub.status === 'graded').length;
  
  // Calculate average grade if there are graded submissions
  if (this.gradedSubmissions > 0) {
    const totalGrade = this.submissions
      .filter(sub => sub.status === 'graded' && sub.grade !== undefined)
      .reduce((sum, sub) => sum + (sub.grade || 0), 0);
    this.averageGrade = totalGrade / this.gradedSubmissions;
  }
  
  next();
});

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema); 