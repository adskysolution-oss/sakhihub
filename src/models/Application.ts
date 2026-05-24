import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus = 'New' | 'Under Review' | 'Selected' | 'Rejected' | 'On Hold';

export interface IApplication extends Document {
  applicationId: string;
  vacancyId: mongoose.Types.ObjectId;
  fullName: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  gender: string;
  dob: Date;
  state: string;
  district: string;
  block: string;
  qualification: string;
  experience: string;
  applyingFor: string;
  resumeUrl: string;
  aadhaarUrl?: string;
  panUrl?: string;
  photoUrl?: string;
  declarationAccepted: boolean;
  status: ApplicationStatus;
  adminRemarks?: string;
  convertedUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  applicationId: { type: String, required: true, unique: true },
  vacancyId: { type: Schema.Types.ObjectId, ref: 'Vacancy', required: true },
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  block: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: String, required: true },
  applyingFor: { type: String, required: true },
  resumeUrl: { type: String, required: true },
  aadhaarUrl: { type: String, required: false },
  panUrl: { type: String, required: false },
  photoUrl: { type: String, required: false },
  declarationAccepted: { type: Boolean, required: true, default: false },
  status: { type: String, enum: ['New', 'Under Review', 'Selected', 'Rejected', 'On Hold'], default: 'New' },
  adminRemarks: { type: String },
  convertedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
