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
  assignedVendors?: mongoose.Types.ObjectId[]; // Direct admin assignments
  assignments?: {
    userId: mongoose.Types.ObjectId;
    status: 'requested' | 'assigned' | 'approved' | 'rejected' | 'active' | 'closed';
    assignedBy?: mongoose.Types.ObjectId; // The parent who approved/assigned
    requestedAt: Date;
    updatedAt: Date;
  }[];
  visibilityOptions?: {
    hideChargesFromSubVendors: boolean;
    hideTargetDetailsFromEmployees: boolean;
  };
  location?: string;
  charges?: number;
  trainingMaterial?: string; // URL to PDF
  posterFiles?: string[]; // URLs from Cloudinary
  bannerImage?: string; // URL from Cloudinary
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
    assignments: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      status: { type: String, enum: ['requested', 'assigned', 'approved', 'rejected', 'active', 'closed'], default: 'requested' },
      assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }],
    visibilityOptions: {
      hideChargesFromSubVendors: { type: Boolean, default: true },
      hideTargetDetailsFromEmployees: { type: Boolean, default: false }
    },
    location: { type: String },
    charges: { type: Number },
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
