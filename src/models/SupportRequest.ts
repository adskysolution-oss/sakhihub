import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportRequest extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  userRole?: string;
  submittedBy?: mongoose.Types.ObjectId;
  status: 'new' | 'in_progress' | 'resolved';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportRequestSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    userRole: { type: String },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['new', 'in_progress', 'resolved'], 
      default: 'new' 
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SupportRequest || mongoose.model<ISupportRequest>('SupportRequest', SupportRequestSchema);
