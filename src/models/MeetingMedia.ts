import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingMedia extends Document {
  meetingId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  size?: number;
  duration?: number;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  latitude?: number;
  longitude?: number;
  capturedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingMediaSchema = new Schema<IMeetingMedia>({
  meetingId: { type: Schema.Types.ObjectId, ref: 'GroupMeeting', required: true, index: true },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  type: { type: String, enum: ['photo', 'video'], required: true },
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  size: { type: Number },
  duration: { type: Number },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
  latitude: { type: Number },
  longitude: { type: Number },
  capturedAt: { type: Date }
}, {
  timestamps: true
});

if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.MeetingMedia) {
  delete (mongoose.models as any).MeetingMedia;
}

export default mongoose.models.MeetingMedia || mongoose.model<IMeetingMedia>('MeetingMedia', MeetingMediaSchema);
