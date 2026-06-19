import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthorizationLetter extends Document {
  userId: mongoose.Types.ObjectId;
  authorizationNumber: string;
  authorizationType: 'district_coordinator' | 'block_coordinator';
  state: string;
  district: string;
  block?: string;
  issueDate: Date;
  validUntil: Date;
  generatedBy: mongoose.Types.ObjectId;
  pdfUrl: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const AuthorizationLetterSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorizationNumber: { type: String, required: true, unique: true },
    authorizationType: {
      type: String,
      enum: ['district_coordinator', 'block_coordinator'],
      required: true
    },
    state: { type: String, required: true },
    district: { type: String, required: true },
    block: { type: String },
    issueDate: { type: Date, required: true, default: Date.now },
    validUntil: { type: Date, required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pdfUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'revoked', 'expired'],
      default: 'active',
      required: true
    }
  },
  { timestamps: true }
);

// Prevent recompilation in development while preserving schema updates
if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.AuthorizationLetter) {
  delete (mongoose.models as any).AuthorizationLetter;
}

export default mongoose.models.AuthorizationLetter || mongoose.model<IAuthorizationLetter>('AuthorizationLetter', AuthorizationLetterSchema);
