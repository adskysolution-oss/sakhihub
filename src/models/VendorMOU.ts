import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorMOU extends Document {
  vendorId: mongoose.Types.ObjectId;
  mouId: string;
  vendorCode?: string;
  generatedDate: Date;
  status: 'generated' | 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'reupload_required';
  fileUrl: string; // generated PDF
  uploadedDocumentUrl?: string; // signed copy
  isLocked: boolean;
  adminRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorMOUSchema: Schema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mouId: { type: String, required: true, unique: true },
    vendorCode: { type: String },
    generatedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['generated', 'uploaded', 'under_review', 'approved', 'rejected', 'reupload_required'], default: 'generated' },
    fileUrl: { type: String, required: true },
    uploadedDocumentUrl: { type: String },
    isLocked: { type: Boolean, default: false },
    adminRemarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.VendorMOU || mongoose.model<IVendorMOU>('VendorMOU', VendorMOUSchema);
