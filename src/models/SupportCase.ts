import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportCase extends Document {
  caseId: string; // Unique sequential ID, e.g. SUP-000001
  user: mongoose.Types.ObjectId; // The user calling support
  category: string; // e.g. Payment, Onboarding, Campaign
  subCategory?: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  attachment?: string; // Optional S3 URL
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolutionType?: 'Resolved' | 'Rejected' | 'Duplicate' | 'Not Applicable';
  resolutionRemarks?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  assignedTo?: mongoose.Types.ObjectId; // Super Admin / Admin assignee
  createdBy: mongoose.Types.ObjectId; // Support Executive (Staff/Ops Admin)
  createdAt: Date;
  updatedAt: Date;
}

const SupportCaseSchema: Schema = new Schema(
  {
    caseId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', required: true },
    attachment: { type: String },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open', required: true },
    resolutionType: { type: String, enum: ['Resolved', 'Rejected', 'Duplicate', 'Not Applicable'] },
    resolutionRemarks: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.SupportCase) {
  delete (mongoose.models as any).SupportCase;
}

export default mongoose.models.SupportCase || mongoose.model<ISupportCase>('SupportCase', SupportCaseSchema);
