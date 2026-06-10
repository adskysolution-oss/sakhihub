import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailCampaign extends Document {
  name: string;
  subject: string;
  content: string; // HTML body
  filters: any; // Audience selection filters structure
  recipientCount: number;
  deliveredCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled';
  scheduledAt?: Date;
  sentAt?: Date;
  completedAt?: Date;
  attachments?: {
    filename: string;
    url: string;
    size?: number;
  }[];
  createdBy: mongoose.Types.ObjectId;
  channel: 'email' | 'sms' | 'whatsapp';
  createdAt: Date;
  updatedAt: Date;
}

const EmailCampaignSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    filters: { type: Schema.Types.Mixed, default: {} },
    recipientCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
    clickedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'],
      default: 'draft',
      required: true
    },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    completedAt: { type: Date },
    attachments: [
      {
        filename: { type: String },
        url: { type: String },
        size: { type: Number }
      }
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channel: {
      type: String,
      enum: ['email', 'sms', 'whatsapp'],
      default: 'email',
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for query optimization
EmailCampaignSchema.index({ status: 1 });
EmailCampaignSchema.index({ createdBy: 1 });
EmailCampaignSchema.index({ createdAt: -1 });

export default mongoose.models.EmailCampaign || mongoose.model<IEmailCampaign>('EmailCampaign', EmailCampaignSchema);
