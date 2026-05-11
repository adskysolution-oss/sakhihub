import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  targetAudience?: string;
  rules?: string[];
  securityDeposit?: {
    amount: number;
    description?: string;
    isRefundable: boolean;
    refundAfterMonths?: number;
  };
  salaryStructure?: string;
  targetDetails?: string;
  formLink?: string;
  referralLink?: string;
  assignedVendors?: mongoose.Types.ObjectId[]; // Link to User models with role 'vendor'
  trainingMaterial?: string; // URL to PDF
  posterFiles?: string[]; // URLs
  bannerImage?: string; // URL
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'hold' | 'closed' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAudience: { type: String },
    rules: [{ type: String }],
    securityDeposit: {
      amount: { type: Number, default: 0 },
      description: { type: String },
      isRefundable: { type: Boolean, default: false },
      refundAfterMonths: { type: Number }
    },
    salaryStructure: { type: String },
    targetDetails: { type: String },
    formLink: { type: String },
    referralLink: { type: String },
    assignedVendors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trainingMaterial: { type: String },
    posterFiles: [{ type: String }],
    bannerImage: { type: String },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { 
      type: String, 
      enum: ['active', 'hold', 'closed', 'inactive'], 
      default: 'active' 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
