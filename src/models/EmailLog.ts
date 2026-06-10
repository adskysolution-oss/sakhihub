import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailLog extends Document {
  recipient: string; // Recipient email address
  recipientUser?: mongoose.Types.ObjectId; // Link to user profile if available
  recipientName?: string; // Recipient's full name
  subject: string;
  type: string; // 'campaign', 'otp', 'notification', etc.
  campaignId?: mongoose.Types.ObjectId; // Link to the EmailCampaign if applicable
  status: 'success' | 'failed' | 'pending' | 'delivered' | 'opened' | 'clicked';
  error?: string;
  relatedId?: mongoose.Types.ObjectId; // Generic related object ID (e.g. membershipId)
  delivered: boolean;
  opened: boolean;
  clicked: boolean;
  failed: boolean;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  timestamp: Date; // Keep for backward compatibility with old logs
}

const EmailLogSchema: Schema = new Schema(
  {
    recipient: { type: String, required: true },
    recipientUser: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientName: { type: String },
    subject: { type: String, required: true },
    type: { type: String, required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'EmailCampaign' },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending', 'delivered', 'opened', 'clicked'],
      required: true,
      default: 'pending'
    },
    error: { type: String },
    relatedId: { type: Schema.Types.ObjectId },
    delivered: { type: Boolean, default: false },
    opened: { type: Boolean, default: false },
    clicked: { type: Boolean, default: false },
    failed: { type: Boolean, default: false },
    sentAt: { type: Date },
    openedAt: { type: Date },
    clickedAt: { type: Date },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for logging performance
EmailLogSchema.index({ campaignId: 1 });
EmailLogSchema.index({ recipient: 1 });
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ timestamp: -1 });
EmailLogSchema.index({ sentAt: -1 });

export default mongoose.models.EmailLog || mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
