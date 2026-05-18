import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  pendingBalance: number; // For pending commissions or active withdrawal requests
  lifetimeEarnings: number;
  totalWithdrawn: number;
  commissionEarned: number;
  commissionPending: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    lifetimeEarnings: { type: Number, default: 0, min: 0 },
    totalWithdrawn: { type: Number, default: 0, min: 0 },
    commissionEarned: { type: Number, default: 0, min: 0 },
    commissionPending: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Prevent compilation errors in Next.js hot-reloading
export default mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
