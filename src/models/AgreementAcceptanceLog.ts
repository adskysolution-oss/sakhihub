import mongoose, { Schema, Document } from 'mongoose';

export interface IAgreementAcceptanceLog extends Document {
  agreementId: string;
  vendorId: mongoose.Types.ObjectId;
  acceptedAt: Date;
  ipAddress?: string;
  deviceInfo?: string;
  otpVerified: boolean;
  digitalSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgreementAcceptanceLogSchema: Schema = new Schema(
  {
    agreementId: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    acceptedAt: { type: Date, default: Date.now },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    otpVerified: { type: Boolean, default: false },
    digitalSignature: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.AgreementAcceptanceLog || mongoose.model<IAgreementAcceptanceLog>('AgreementAcceptanceLog', AgreementAcceptanceLogSchema);
