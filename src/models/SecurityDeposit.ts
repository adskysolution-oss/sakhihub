import mongoose, { Schema, Document } from 'mongoose';

export interface ISecurityDeposit extends Document {
  vendorId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  amount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentDate?: Date;
  transactionId?: string;
  receiptUrl?: string;
  refundStatus: 'not_eligible' | 'eligible' | 'processed';
  refundDate?: Date;
  adminRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SecurityDepositSchema: Schema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'partial', 'paid'], 
      default: 'pending' 
    },
    paymentDate: { type: Date },
    transactionId: { type: String },
    receiptUrl: { type: String },
    refundStatus: { 
      type: String, 
      enum: ['not_eligible', 'eligible', 'processed'], 
      default: 'not_eligible' 
    },
    refundDate: { type: Date },
    adminRemarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SecurityDeposit || mongoose.model<ISecurityDeposit>('SecurityDeposit', SecurityDepositSchema);
