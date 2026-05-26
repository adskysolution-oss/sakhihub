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

/** Per-role, per-type payment request URL structure */
export interface IRolePaymentRequestUrls {
  subscription: string;
  deposit: string;
}

export interface IPaymentRequestUrls {
  vendor: IRolePaymentRequestUrls;
  sub_vendor: IRolePaymentRequestUrls;
  employee: IRolePaymentRequestUrls;
}

export interface IPaymentConfig extends Document {
  key: string;
  subscriptionAmount: IRoleAmounts;
  depositAmount: IRoleAmounts;
  paymentRequired: IRoleToggles;
  subscriptionRequired: IRoleToggles;
  depositRequired: IRoleToggles;
  /**
   * Role-wise and type-wise payment request URLs shown to users when
   * the Cashfree gateway is OFF. Each role can have separate URLs for
   * subscription and security deposit.
   *
   * Example:
   *   paymentRequestUrls.vendor.deposit = "https://payments.cashfree.com/forms/vendor-deposit"
   *   paymentRequestUrls.sub_vendor.subscription = "https://payments.cashfree.com/forms/sv-sub"
   */
  paymentRequestUrls: IPaymentRequestUrls;
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

/** Nested schema: { subscription: '', deposit: '' } repeated per role */
const RoleUrlPairSchema = {
  subscription: { type: String, default: '' },
  deposit: { type: String, default: '' },
};

const PaymentConfigSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    subscriptionAmount: RoleAmountsSchema,
    depositAmount: RoleAmountsSchema,
    paymentRequired: RoleTogglesSchema,
    subscriptionRequired: RoleTogglesSchema,
    depositRequired: RoleTogglesSchema,
    paymentRequestUrls: {
      vendor: RoleUrlPairSchema,
      sub_vendor: RoleUrlPairSchema,
      employee: RoleUrlPairSchema,
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentConfig || mongoose.model<IPaymentConfig>('PaymentConfig', PaymentConfigSchema);
