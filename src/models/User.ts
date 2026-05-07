import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'member' | 'employee' | 'delivery_partner';

export interface IUser extends Document {
  fullName: string;
  mobile: string;
  email?: string;
  password?: string;
  role: UserRole;
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  state?: string;
  district?: string;
  address?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, sparse: true, unique: true },
    password: { type: String },
    role: { 
      type: String, 
      enum: ['admin', 'member', 'employee', 'delivery_partner'], 
      default: 'member' 
    },
    status: { 
      type: String, 
      enum: ['pending', 'active', 'inactive', 'rejected'], 
      default: 'pending' 
    },
    state: { type: String },
    district: { type: String },
    address: { type: String },
    profileImage: { type: String },
  },
  { timestamps: true }
);

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
