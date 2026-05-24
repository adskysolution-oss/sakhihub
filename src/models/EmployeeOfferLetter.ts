import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeOfferLetter extends Document {
  employeeId: mongoose.Types.ObjectId;
  offerLetterId: string;
  joiningDate: Date;
  salary: string;
  generatedDate: Date;
  status: 'generated' | 'accepted' | 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'reupload_required';
  digitalAcceptanceStatus: boolean;
  pdfUrl?: string;
  uploadedDocumentUrl?: string; // Signed copy uploaded by the employee
  isLocked: boolean;            // Locked by admin after verification
  adminRemarks?: string;        // Reason for rejection/reupload
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeOfferLetterSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    offerLetterId: { type: String, required: true, unique: true },
    joiningDate: { type: Date, required: true },
    salary: { type: String, required: true },
    generatedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['generated', 'accepted', 'uploaded', 'under_review', 'approved', 'rejected', 'reupload_required'], default: 'generated' },
    digitalAcceptanceStatus: { type: Boolean, default: false },
    pdfUrl: { type: String },
    uploadedDocumentUrl: { type: String },
    isLocked: { type: Boolean, default: false },
    adminRemarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.EmployeeOfferLetter || mongoose.model<IEmployeeOfferLetter>('EmployeeOfferLetter', EmployeeOfferLetterSchema);
