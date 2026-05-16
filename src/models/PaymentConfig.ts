import mongoose, { Schema, Document } from 'mongoose';

export interface IRoleAmounts {
  vendor: number;
  sub_vendor: number;
  employee: number;
}

export interface IRoleToggles {
  vendor: boolean;
  sub_vendor: boolean;
  employee: boolean;
}

export interface IPaymentConfig extends Document {
  key: string;
  subscriptionAmount: IRoleAmounts;
  depositAmount: IRoleAmounts;
  paymentRequired: IRoleToggles;
  subscriptionRequired: IRoleToggles;
  depositRequired: IRoleToggles;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoleAmountsSchema = {
  vendor: { type: Number, default: 0 },
  sub_vendor: { type: Number, default: 0 },
  employee: { type: Number, default: 0 },
};

const RoleTogglesSchema = {
  vendor: { type: Boolean, default: true },
  sub_vendor: { type: Boolean, default: true },
  employee: { type: Boolean, default: true },
};

const PaymentConfigSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    subscriptionAmount: RoleAmountsSchema,
    depositAmount: RoleAmountsSchema,
    paymentRequired: RoleTogglesSchema,
    subscriptionRequired: RoleTogglesSchema,
    depositRequired: RoleTogglesSchema,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentConfig || mongoose.model<IPaymentConfig>('PaymentConfig', PaymentConfigSchema);
