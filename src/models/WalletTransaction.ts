import mongoose, { Schema, Document } from 'mongoose';

export type WalletTxnType = 'credit' | 'debit';
export type WalletTxnCategory = 
  | 'commission_subscription' 
  | 'commission_deposit' 
  | 'commission_member' 
  | 'withdrawal' 
  | 'refund' 
  | 'adjustment';

export type WalletTxnStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface IWalletTransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: WalletTxnType;
  category: WalletTxnCategory;
  amount: number;
  status: WalletTxnStatus;
  description: string;
  sourceUserId?: mongoose.Types.ObjectId; // The user whose payment generated this commission
  sourceUserRole?: string;
  sourceUserFullName?: string;
  sourceAmount?: number; // Original transaction value (e.g. 5000 subscription, 100 membership)
  referenceId?: string; // Reference to external order ID or membership ID
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName?: string;
    remarks?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema: Schema = new Schema(
  {
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    category: { 
      type: String, 
      enum: [
        'commission_subscription', 
        'commission_deposit', 
        'commission_member', 
        'withdrawal', 
        'refund', 
        'adjustment'
      ], 
      required: true 
    },
    amount: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'cancelled'], 
      default: 'pending', 
      required: true 
    },
    description: { type: String, required: true },
    sourceUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    sourceUserRole: { type: String },
    sourceUserFullName: { type: String },
    sourceAmount: { type: Number },
    referenceId: { type: String },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      remarks: { type: String }
    }
  },
  { timestamps: true }
);

// Indexes for fast administrative audit reporting and filters
WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
WalletTransactionSchema.index({ status: 1 });
WalletTransactionSchema.index({ category: 1 });

export default mongoose.models.WalletTransaction || mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
