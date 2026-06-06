import mongoose, { Schema, Document } from 'mongoose';

export interface IAbhaCard extends Document {
  userId: mongoose.Types.ObjectId;
  abhaNumber: string;
  abhaAddress: string;
  status: 'linked' | 'created';
  consentGiven: boolean;
  consentAt: Date;
  abhaCreatedAt: Date;
  abhaVerifiedAt: Date;
  transactionId?: string;
  profilePayload: {
    fullName: string;
    gender: string;
    dob: string;
    mobile: string;
    profilePhoto?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AbhaCardSchema = new Schema<IAbhaCard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    abhaNumber: { type: String, required: true },
    abhaAddress: { type: String, required: true },
    status: { type: String, enum: ['linked', 'created'], required: true },
    consentGiven: { type: Boolean, default: false },
    consentAt: { type: Date },
    abhaCreatedAt: { type: Date, default: Date.now },
    abhaVerifiedAt: { type: Date, default: Date.now },
    transactionId: { type: String },
    profilePayload: {
      fullName: { type: String, required: true },
      gender: { type: String, required: true },
      dob: { type: String, required: true },
      mobile: { type: String, required: true },
      profilePhoto: { type: String },
    },
  },
  { timestamps: true }
);

// Enforce unique index on userId to prevent duplicate records
export default mongoose.models.AbhaCard || mongoose.model<IAbhaCard>('AbhaCard', AbhaCardSchema);
