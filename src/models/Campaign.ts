import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  targetAudience?: string;
  trainingMaterial?: string; // URL to PDF
  posterFiles?: string[]; // URLs
  bannerImage?: string; // URL
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAudience: { type: String },
    trainingMaterial: { type: String },
    posterFiles: [{ type: String }],
    bannerImage: { type: String },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
