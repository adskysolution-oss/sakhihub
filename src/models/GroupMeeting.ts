import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMeeting extends Document {
  groupId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  conductedBy: mongoose.Types.ObjectId;
  meetingDate: Date;
  village: string;
  block: string;
  district: string;
  vendorCode?: string;
  subVendorCode?: string;
  remarks?: string;
  attendeesCount: number;
  attendees: mongoose.Types.ObjectId[];
  photoCount: number;
  videoCount: number;
  status: 'draft' | 'submitted' | 'verified' | 'rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMeetingSchema = new Schema<IGroupMeeting>({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  conductedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  meetingDate: { type: Date, required: true, index: true },
  village: { type: String, required: true },
  block: { type: String, required: true, index: true },
  district: { type: String, required: true, index: true },
  vendorCode: { type: String, index: true },
  subVendorCode: { type: String, index: true },
  remarks: { type: String },
  attendeesCount: { type: Number, default: 0 },
  attendees: [{ type: Schema.Types.ObjectId, ref: 'WomenMember' }],
  photoCount: { type: Number, default: 0 },
  videoCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'verified', 'rejected'], 
    default: 'draft' 
  },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  rejectionReason: { type: String }
}, {
  timestamps: true
});

if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.GroupMeeting) {
  delete (mongoose.models as any).GroupMeeting;
}

export default mongoose.models.GroupMeeting || mongoose.model<IGroupMeeting>('GroupMeeting', GroupMeetingSchema);
