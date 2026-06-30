import mongoose, { Schema, Document } from 'mongoose';

export interface IMemberRequest extends Document {
  memberId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'accepted' | 'cancelled' | 'expired';
  pincode: string;
  message?: string;
  requestedBy: 'member' | 'employee';
  createdAt: Date;
  updatedAt: Date;
}

const MemberRequestSchema: Schema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'accepted', 'cancelled', 'expired'], 
      default: 'pending' 
    },
    pincode: { type: String, required: true },
    message: { type: String },
    requestedBy: { type: String, enum: ['member', 'employee'], default: 'member' }
  },
  { timestamps: true }
);

// Add compound indexes for efficient indexed lookups
MemberRequestSchema.index({ memberId: 1, status: 1 });
MemberRequestSchema.index({ employeeId: 1, status: 1 });

export default mongoose.models.MemberRequest || mongoose.model<IMemberRequest>('MemberRequest', MemberRequestSchema);
