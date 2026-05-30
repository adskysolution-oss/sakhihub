import mongoose, { Schema, Document } from 'mongoose';

export type PaymentType = 'subscription' | 'deposit';
export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'refunded';

export interface IPaymentTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: PaymentType;
  role: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  paymentSessionId?: string;
  paymentMethod?: string;
  provider?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewayReferenceId?: string;
  webhookReceived?: boolean;
  verifiedAt?: Date;
  gatewayResponse?: any;
  failureReason?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['subscription', 'deposit'], required: true },
    role: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'pending', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    cashfreeOrderId: { type: String, unique: true, sparse: true },
    cashfreePaymentId: { type: String },
    paymentSessionId: { type: String },
    paymentMethod: { type: String },
    provider: { type: String, enum: ['cashfree', 'phonepe'] },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewayReferenceId: { type: String },
    webhookReceived: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    gatewayResponse: { type: Schema.Types.Mixed },
    failureReason: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for quick lookups: find latest transaction for a user+type
PaymentTransactionSchema.index({ userId: 1, type: 1, status: 1 });

export default mongoose.models.PaymentTransaction || mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);
