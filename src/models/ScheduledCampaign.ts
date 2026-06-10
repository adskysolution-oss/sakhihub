import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduledCampaign extends Document {
  campaignId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledCampaignSchema: Schema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'EmailCampaign', required: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      required: true
    },
    error: { type: String }
  },
  { timestamps: true }
);

ScheduledCampaignSchema.index({ status: 1, scheduledAt: 1 });
ScheduledCampaignSchema.index({ campaignId: 1 });

export default mongoose.models.ScheduledCampaign || mongoose.model<IScheduledCampaign>('ScheduledCampaign', ScheduledCampaignSchema);
