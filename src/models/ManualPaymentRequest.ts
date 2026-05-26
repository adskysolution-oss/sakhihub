import mongoose, { Schema, Document } from 'mongoose';

export type ManualPaymentStatus = 'pending' | 'approved' | 'rejected';

export interface IManualPaymentRequest extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'subscription' | 'deposit';
  /** Full name as provided by the user */
  name: string;
  /** Mobile number as provided by the user */
  mobile: string;
  /** Vendor or Sub-Vendor ID / Code as provided by the user */
  vendorOrSubVendorId: string;
  /** Payment amount (self-reported) */
  amount: number;
  /** Transaction ID / UTR from the payment provider */
  transactionId: string;
  /** Date on which the payment was made */
  paymentDate: Date;
  /** Optional remark from the user */
  remark?: string;
  /** Admin review status */
  status: ManualPaymentStatus;
  /** Admin who reviewed this request */
  reviewedBy?: mongoose.Types.ObjectId;
  /** Timestamp of admin review */
  reviewedAt?: Date;
  /** Admin remark on rejection/approval */
  adminRemark?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ManualPaymentRequestSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['subscription', 'deposit'], required: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    vendorOrSubVendorId: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    transactionId: { type: String, required: true, trim: true },
    paymentDate: { type: Date, required: true },
    remark: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    adminRemark: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Index for admin queue – pending requests first, newest first
ManualPaymentRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.ManualPaymentRequest ||
  mongoose.model<IManualPaymentRequest>('ManualPaymentRequest', ManualPaymentRequestSchema);
