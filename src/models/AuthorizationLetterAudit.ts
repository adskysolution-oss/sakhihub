import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthorizationLetterAudit extends Document {
  authorizationLetterId: mongoose.Types.ObjectId;
  action: 'generate' | 'download' | 'revoke' | 'auto_revoke' | 'expire';
  performedBy?: mongoose.Types.ObjectId; // null or undefined for system actions (like auto-expiry)
  timestamp: Date;
  ipAddress: string;
  details?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorizationLetterAuditSchema: Schema = new Schema(
  {
    authorizationLetterId: { type: Schema.Types.ObjectId, ref: 'AuthorizationLetter', required: true },
    action: {
      type: String,
      enum: ['generate', 'download', 'revoke', 'auto_revoke', 'expire'],
      required: true
    },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, required: true, default: Date.now },
    ipAddress: { type: String, required: true },
    details: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.AuthorizationLetterAudit) {
  delete (mongoose.models as any).AuthorizationLetterAudit;
}

export default mongoose.models.AuthorizationLetterAudit || mongoose.model<IAuthorizationLetterAudit>('AuthorizationLetterAudit', AuthorizationLetterAuditSchema);
