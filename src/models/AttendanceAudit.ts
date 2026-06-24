import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceAudit extends Document {
  employeeId: mongoose.Types.ObjectId;
  attendanceId: mongoose.Types.ObjectId;
  oldStatus: string;
  newStatus: string;
  oldCheckInTime?: Date;
  newCheckInTime?: Date;
  oldCheckOutTime?: Date;
  newCheckOutTime?: Date;
  reason: string; // Admin justification
  modifiedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceAuditSchema = new Schema<IAttendanceAudit>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance', required: true },
    oldStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    oldCheckInTime: { type: Date },
    newCheckInTime: { type: Date },
    oldCheckOutTime: { type: Date },
    newCheckOutTime: { type: Date },
    reason: { type: String, required: true },
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.AttendanceAudit) {
  delete (mongoose.models as any).AttendanceAudit;
}

export default mongoose.models.AttendanceAudit || mongoose.model<IAttendanceAudit>('AttendanceAudit', AttendanceAuditSchema);
