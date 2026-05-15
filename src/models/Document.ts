import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'ngo_reg' | 'pan' | 'aadhaar' | 'bank_passbook' | 'agreement' | 'security_receipt' | 'auth_letter' | 'other';
  title: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  adminRemarks?: string;
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
    status: { 
      type: String, 
      enum: ['pending', 'uploaded', 'under_review', 'approved', 'rejected', 'reupload_required'], 
      default: 'pending' 
    },
    adminRemarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
