import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyFieldReport extends Document {
  employeeId: mongoose.Types.ObjectId;
  reportDate: Date;
  state?: string;
  district?: string;
  block?: string;
  village: string;
  meetingCount: number;
  groupsFormed: number;
  membersAdded: number;
  photos?: string[];
  remarks?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DailyFieldReportSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportDate: { type: Date, required: true },
    state: { type: String },
    district: { type: String },
    block: { type: String },
    village: { type: String, required: true }, // Village Name
    meetingCount: { type: Number, default: 0 },
    groupsFormed: { type: Number, default: 0 },
    membersAdded: { type: Number, default: 0 },
    photos: { type: [String], default: [] },
    remarks: { type: String },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Prevent recompilation issues in development
if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.DailyFieldReport) {
  delete (mongoose.models as any).DailyFieldReport;
}

export default mongoose.models.DailyFieldReport || mongoose.model<IDailyFieldReport>('DailyFieldReport', DailyFieldReportSchema);
