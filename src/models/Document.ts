import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  type: 'ngo_reg' | 'pan' | 'aadhaar' | 'bank_passbook' | 'agreement' | 'security_receipt' | 'auth_letter' | 'other';
  title: string;
  fileUrl: string; // The generated or base file
  uploadedDocumentUrl?: string; // The signed/uploaded file from vendor
  status: 'pending' | 'pending_upload' | 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'reupload_required' | 'unlocked';
  isLocked?: boolean;
  isApproved?: boolean;
  adminRemarks?: string;
  category?: string;
  documentType?: string;
  vendorId?: mongoose.Types.ObjectId;
  agreementId?: string;
  visibleToVendor?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['ngo_reg', 'pan', 'aadhaar', 'bank_passbook', 'agreement', 'security_receipt', 'auth_letter', 'other'], 
      required: true 
    },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedDocumentUrl: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'pending_upload', 'uploaded', 'under_review', 'approved', 'rejected', 'reupload_required', 'unlocked'], 
      default: 'pending' 
    },
    isLocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    adminRemarks: { type: String },
    category: { type: String },
    documentType: { type: String },
    vendorId: { type: Schema.Types.ObjectId, ref: 'User' },
    agreementId: { type: String },
    visibleToVendor: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
