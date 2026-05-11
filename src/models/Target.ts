import mongoose, { Schema, Document } from 'mongoose';

export interface ITarget extends Document {
  assigneeId: mongoose.Types.ObjectId; // User (Employee/Vendor)
  campaignId: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;
  targets: {
    members: number;
    paidMembers: number;
    groups: number;
    meetings: number;
  };
  achieved: {
    members: number;
    paidMembers: number;
    groups: number;
    meetings: number;
  };
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const TargetSchema: Schema = new Schema(
  {
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    targets: {
      members: { type: Number, default: 0 },
      paidMembers: { type: Number, default: 0 },
      groups: { type: Number, default: 0 },
      meetings: { type: Number, default: 0 },
    },
    achieved: {
      members: { type: Number, default: 0 },
      paidMembers: { type: Number, default: 0 },
      groups: { type: Number, default: 0 },
      meetings: { type: Number, default: 0 },
    },
    status: { 
      type: String, 
      enum: ['active', 'completed', 'failed'], 
      default: 'active' 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Target || mongoose.model<ITarget>('Target', TargetSchema);
