import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyReport extends Document {
  employeeId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  vendorCode?: string;
  subVendorCode?: string;
  date: Date;
  villagesVisited: string[];
  groupsCreated: number;
  membersAdded: number;
  membershipCollected: number;
  meetingCount: number;
  padsInquiry: number;
  padsSold?: number;
  meetingPhotos: string[]; // URLs
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  issuesFaced?: string;
  remarks?: string;
  status: 'submitted' | 'verified';
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DailyReportSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    vendorCode: { type: String },
    subVendorCode: { type: String },
    date: { type: Date, required: true, default: Date.now },
    villagesVisited: [{ type: String }],
    groupsCreated: { type: Number, default: 0 },
    membersAdded: { type: Number, default: 0 },
    membershipCollected: { type: Number, default: 0 },
    meetingCount: { type: Number, default: 0 },
    padsInquiry: { type: Number, default: 0 },
    padsSold: { type: Number, default: 0 },
    meetingPhotos: [{ type: String }],
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
    },
    issuesFaced: { type: String },
    remarks: { type: String },
    status: { type: String, enum: ['submitted', 'verified'], default: 'submitted' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.DailyReport || mongoose.model<IDailyReport>('DailyReport', DailyReportSchema);
