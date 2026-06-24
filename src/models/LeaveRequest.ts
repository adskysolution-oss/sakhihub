import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Emergency Leave' | 'Unpaid Leave';
  fromDate: Date;
  toDate: Date;
  reason: string;
  attachment?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: {
      type: String,
      enum: ['Casual Leave', 'Sick Leave', 'Emergency Leave', 'Unpaid Leave'],
      required: true
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    attachment: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      required: true
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String }
  },
  { timestamps: true }
);

// Prevent recompilation issues in development
if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.LeaveRequest) {
  delete (mongoose.models as any).LeaveRequest;
}

export default mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
