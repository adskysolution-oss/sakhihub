import mongoose, { Schema, Document } from 'mongoose';

export type VacancyStatus = 'Open' | 'Closed' | 'Coming Soon';

export interface IVacancy extends Document {
  title: string;
  slug: string;
  department: string;
  location: string;
  workType: string;
  salaryRange: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  eligibility: string;
  experience: string;
  benefits: string[];
  lastDate?: Date;
  status: VacancyStatus;
  isFeatured: boolean;
  requireAadhaar: boolean;
  requirePan: boolean;
  requirePhoto: boolean;
  posterUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VacancySchema = new Schema<IVacancy>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  workType: { type: String, required: true },
  salaryRange: { type: String, required: true },
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  requirements: [{ type: String }],
  eligibility: { type: String },
  experience: { type: String },
  benefits: [{ type: String }],
  lastDate: { type: Date },
  status: { type: String, enum: ['Open', 'Closed', 'Coming Soon'], default: 'Open' },
  isFeatured: { type: Boolean, default: false },
  requireAadhaar: { type: Boolean, default: false },
  requirePan: { type: Boolean, default: false },
  requirePhoto: { type: Boolean, default: false },
  posterUrl: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Vacancy || mongoose.model<IVacancy>('Vacancy', VacancySchema);
