import mongoose, { Schema, Document } from 'mongoose';

export interface IHrmsSettings extends Document {
  shiftStartTime: string;            // Format "HH:MM" e.g., "09:00"
  graceMinutes: number;              // default: 10
  shiftEndTime: string;              // Format "HH:MM" e.g., "18:30"
  earlyCheckoutThreshold: string;    // Format "HH:MM" e.g., "18:00"
  consecutiveLateThreshold: number;  // default: 3
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HrmsSettingsSchema = new Schema<IHrmsSettings>(
  {
    shiftStartTime: { type: String, default: '09:00', required: true },
    graceMinutes: { type: Number, default: 10, required: true },
    shiftEndTime: { type: String, default: '18:30', required: true },
    earlyCheckoutThreshold: { type: String, default: '18:00', required: true },
    consecutiveLateThreshold: { type: Number, default: 3, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.HrmsSettings) {
  delete (mongoose.models as any).HrmsSettings;
}

export default mongoose.models.HrmsSettings || mongoose.model<IHrmsSettings>('HrmsSettings', HrmsSettingsSchema);
