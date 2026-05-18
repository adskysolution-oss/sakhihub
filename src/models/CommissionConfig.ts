import mongoose, { Schema, Document } from 'mongoose';

export interface ICommissionConfig extends Document {
  key: string;
  subscriptionCommission: {
    vendorPct: number; // e.g. 10 (%)
    subVendorPct: number; // e.g. 5 (%)
    employeePct: number; // e.g. 0 (%)
  };
  depositCommission: {
    vendorPct: number; // e.g. 10 (%)
    subVendorPct: number; // e.g. 5 (%)
    employeePct: number; // e.g. 0 (%)
  };
  memberCommission: {
    employeeRecruiter: number; // e.g. 20 (INR)
    subVendorRecruiter: number; // e.g. 20 (INR)
    vendorRecruiter: number; // e.g. 25 (INR)
    subVendorParent: number; // e.g. 10 (INR)
    vendorParentDirect: number; // e.g. 10 (INR) (if parent is direct vendor recruiter parent)
    vendorGrandparent: number; // e.g. 5 (INR) (if parent is sub-vendor)
  };
  payoutRules: {
    minWithdrawalAmount: number; // e.g. 500
    allowAutoSettle: boolean;
  };
  membershipFee: number; // e.g. 100
  membershipPaymentEnabled: boolean; // true/false
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionConfigSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    subscriptionCommission: {
      vendorPct: { type: Number, default: 10 },
      subVendorPct: { type: Number, default: 5 },
      employeePct: { type: Number, default: 0 }
    },
    depositCommission: {
      vendorPct: { type: Number, default: 10 },
      subVendorPct: { type: Number, default: 5 },
      employeePct: { type: Number, default: 0 }
    },
    memberCommission: {
      employeeRecruiter: { type: Number, default: 20 },
      subVendorRecruiter: { type: Number, default: 20 },
      vendorRecruiter: { type: Number, default: 25 },
      subVendorParent: { type: Number, default: 10 },
      vendorParentDirect: { type: Number, default: 10 },
      vendorGrandparent: { type: Number, default: 5 }
    },
    payoutRules: {
      minWithdrawalAmount: { type: Number, default: 500 },
      allowAutoSettle: { type: Boolean, default: false }
    },
    membershipFee: { type: Number, default: 100 },
    membershipPaymentEnabled: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.models.CommissionConfig || mongoose.model<ICommissionConfig>('CommissionConfig', CommissionConfigSchema);
