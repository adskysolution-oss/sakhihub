import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorCertificate extends Document {
  vendorId: mongoose.Types.ObjectId;
  certificateType: 'vendor_code' | 'auth_letter' | 'other';
  title: string;
  fileUrl: string;
  generatedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VendorCertificateSchema: Schema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    certificateType: { type: String, enum: ['vendor_code', 'auth_letter', 'other'], required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    generatedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.VendorCertificate || mongoose.model<IVendorCertificate>('VendorCertificate', VendorCertificateSchema);
