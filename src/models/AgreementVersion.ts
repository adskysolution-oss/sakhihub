import mongoose, { Schema, Document } from 'mongoose';

export interface IAgreementVersion extends Document {
  vendorId: mongoose.Types.ObjectId;
  agreementId: string;
  versionNumber: number;
  fileUrl?: string; // The specific immutable PDF for this version (if signed)
  generatedDate: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const AgreementVersionSchema: Schema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agreementId: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    fileUrl: { type: String },
    generatedDate: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.AgreementVersion || mongoose.model<IAgreementVersion>('AgreementVersion', AgreementVersionSchema);
