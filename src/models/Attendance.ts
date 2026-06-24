import mongoose, { Schema, Document } from 'mongoose';

export interface ILocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  locationTimestamp?: Date;
}

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInPhoto?: {
    url: string;
    uploadedAt: Date;
  };
  checkInLocation?: ILocationData;
  checkOutLocation?: ILocationData;
  workingHours?: number;
  attendanceStatus: 'Checked In' | 'Checked Out' | 'Present' | 'Late' | 'Half Day' | 'Absent' | 'Checkout Missing' | 'Penalty Pending';
  deviceInfo?: string;
  lateReason?: {
    category: 'Traffic' | 'Transit' | 'Medical' | 'Family Emergency' | 'Official Duty' | 'Weather' | 'Other';
    explanation: string;
    reviewStatus: 'Pending' | 'Approved' | 'Rejected';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    adminRemarks?: string;
  };
  earlyCheckOutReason?: string;
  isMajorEarlyCheckout: boolean;
  earlyCheckoutReviewStatus?: 'Pending' | 'Approved' | 'Rejected';
  attendanceScore: number;
  originalCheckInTime?: Date;
  originalCheckOutTime?: Date;
  originalStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  address: { type: String },
  locationTimestamp: { type: Date }
}, { _id: false });

const AttendanceSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    checkInPhoto: {
      url: { type: String },
      uploadedAt: { type: Date }
    },
    checkInLocation: { type: LocationSchema },
    checkOutLocation: { type: LocationSchema },
    workingHours: { type: Number },
    attendanceStatus: {
      type: String,
      enum: ['Checked In', 'Checked Out', 'Present', 'Late', 'Half Day', 'Absent', 'Checkout Missing', 'Penalty Pending'],
      default: 'Checked In',
      required: true
    },
    deviceInfo: { type: String },
    lateReason: {
      category: {
        type: String,
        enum: ['Traffic', 'Transit', 'Medical', 'Family Emergency', 'Official Duty', 'Weather', 'Other']
      },
      explanation: { type: String },
      reviewStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      },
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
      adminRemarks: { type: String }
    },
    earlyCheckOutReason: { type: String },
    isMajorEarlyCheckout: { type: Boolean, default: false },
    earlyCheckoutReviewStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected']
    },
    attendanceScore: { type: Number, default: 0 },
    originalCheckInTime: { type: Date },
    originalCheckOutTime: { type: Date },
    originalStatus: { type: String }
  },
  { timestamps: true }
);

// Prevent recompilation issues in hot-reload environment
if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.Attendance) {
  delete (mongoose.models as any).Attendance;
}

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
