import mongoose, { Schema, Document } from 'mongoose';

export interface IMembership extends Document {
  membershipId: string; // Auto-generated
  receiptNumber: string; // Auto-generated
  memberId: mongoose.Types.ObjectId; // WomenMember ID
  groupId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId; // Added by
  amount: number; // Always 100 in v1
  paymentMode: 'Cash' | 'UPI' | 'Online';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  paymentDate: Date;
  verifiedBy?: mongoose.Types.ObjectId; // Admin ID
  verifiedAt?: Date;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema: Schema = new Schema(
  {
    membershipId: { type: String, unique: true, required: true },
    receiptNumber: { type: String, unique: true, required: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'WomenMember', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, default: 100 },
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Online'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Paid' },
    paymentDate: { type: Date, default: Date.now },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);
