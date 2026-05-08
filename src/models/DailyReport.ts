import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyReport extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  villagesVisited: string[];
  groupsCreated: number;
  membersAdded: number;
  membershipCollected: number;
  padsInquiry: number;
  padsSold?: number;
  meetingPhotos: string[]; // URLs
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
    date: { type: Date, required: true },
    villagesVisited: [{ type: String }],
    groupsCreated: { type: Number, default: 0 },
    membersAdded: { type: Number, default: 0 },
    membershipCollected: { type: Number, default: 0 },
    padsInquiry: { type: Number, default: 0 },
    padsSold: { type: Number, default: 0 },
    meetingPhotos: [{ type: String }],
    issuesFaced: { type: String },
    remarks: { type: String },
    status: { type: String, enum: ['submitted', 'verified'], default: 'submitted' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.DailyReport || mongoose.model<IDailyReport>('DailyReport', DailyReportSchema);
