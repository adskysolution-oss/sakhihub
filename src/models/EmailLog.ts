import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailLog extends Document {
  recipient: string;
  subject: string;
  type: string;
  status: 'success' | 'failed';
  error?: string;
  relatedId?: mongoose.Types.ObjectId;
  timestamp: Date;
}

const EmailLogSchema: Schema = new Schema({
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['success', 'failed'], required: true },
  error: { type: String },
  relatedId: { type: Schema.Types.ObjectId },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.EmailLog || mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
