import mongoose, { Schema, Document } from 'mongoose';

export interface ICoreTeamMember extends Document {
  name: string;
  photo?: string;
  role: string; // e.g., 'founder', 'project_leader', 'trainer', or custom text
  designation?: string;
  bio?: string;
  priority: number; // e.g., 1, 2, 3... for ordering
  district?: string;
  state?: string;
  joiningDate?: Date;
  isPublicVisible: boolean;
  message?: string; // Founder message or quote
  employeeId?: string; // Optional custom/masked ID
  createdAt: Date;
  updatedAt: Date;
}

const CoreTeamMemberSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    photo: { type: String },
    role: { type: String, required: true },
    designation: { type: String },
    bio: { type: String },
    priority: { type: Number, default: 0 },
    district: { type: String },
    state: { type: String },
    joiningDate: { type: Date },
    isPublicVisible: { type: Boolean, default: true },
    message: { type: String },
    employeeId: { type: String }
  },
  { timestamps: true }
);

// Prevent model recompilation in development
if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.CoreTeamMember) {
  delete (mongoose.models as any).CoreTeamMember;
}

export default mongoose.models.CoreTeamMember || mongoose.model<ICoreTeamMember>('CoreTeamMember', CoreTeamMemberSchema);
