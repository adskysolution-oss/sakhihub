import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId;
  role?: string;
  type: 'ngo_reg' | 'pan' | 'aadhaar' | 'bank_passbook' | 'security_receipt' | 'other';
  title: string;
  fileUrl: string; // The generated or base file
  uploadedDocumentUrl?: string; // The signed/uploaded file from vendor
  status: 'pending' | 'pending_upload' | 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'reupload_required' | 'unlocked' | 'exception_requested' | 'exception_approved' | 'on_hold' | 'exception_responded';
  isLocked?: boolean;
  isApproved?: boolean;
  adminRemarks?: string;
  category?: string;
  documentType?: string;
  vendorId?: mongoose.Types.ObjectId;
  agreementId?: string;
  visibleToVendor?: boolean;
  visibleToEmployee?: boolean;
  publicId?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  uploadStatus?: string;
  verificationStatus?: string;
  uploadedAt?: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    type: { 
      type: String, 
      enum: ['ngo_reg', 'pan', 'aadhaar', 'bank_passbook', 'security_receipt', 'other'], 
      required: true 
    },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedDocumentUrl: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'pending_upload', 'uploaded', 'under_review', 'approved', 'rejected', 'reupload_required', 'unlocked', 'exception_requested', 'exception_approved', 'on_hold', 'exception_responded'], 
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
    visibleToEmployee: { type: Boolean, default: true },
    publicId: { type: String },
    fileName: { type: String },
    fileSize: { type: String },
    mimeType: { type: String },
    uploadStatus: { type: String },
    verificationStatus: { type: String },
    uploadedAt: { type: Date },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
