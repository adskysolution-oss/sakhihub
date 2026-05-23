import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorAgreement extends Document {
  vendorId: mongoose.Types.ObjectId;
  agreementId: string;
  vendorCode?: string;
  partnerType?: string;
  joiningDate: Date;
  assignedTerritory?: string;
  incentiveStructure?: string;
  salaryStructure?: string;
  monthlyTargets?: string;
  operationalRole?: string;
  membershipCommission?: string;
  generatedDate: Date;
  status: 'generated' | 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'reupload_required';
  fileUrl?: string; // final signed PDF in Cloudinary or draft endpoint
  templateData?: any; // Stores the data to generate PDF dynamically
  uploadedDocumentUrl?: string; // signed copy
  isLocked: boolean;
  qrVerificationCode?: string;
  acceptanceTimestamp?: Date;
  adminRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorAgreementSchema: Schema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agreementId: { type: String, required: true, unique: true },
    vendorCode: { type: String },
    partnerType: { type: String },
    joiningDate: { type: Date, required: true },
    assignedTerritory: { type: String },
    incentiveStructure: { type: String },
    salaryStructure: { type: String },
    monthlyTargets: { type: String },
    operationalRole: { type: String },
    membershipCommission: { type: String },
    generatedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['generated', 'uploaded', 'under_review', 'approved', 'rejected', 'reupload_required'], default: 'generated' },
    fileUrl: { type: String },
    templateData: { type: Schema.Types.Mixed },
    uploadedDocumentUrl: { type: String },
    isLocked: { type: Boolean, default: false },
    qrVerificationCode: { type: String },
    acceptanceTimestamp: { type: Date },
    adminRemarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.VendorAgreement || mongoose.model<IVendorAgreement>('VendorAgreement', VendorAgreementSchema);
