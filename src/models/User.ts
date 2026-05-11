import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'super_admin' | 'vendor' | 'sub_vendor' | 'employee' | 'member';

export interface IUser extends Document {
  fullName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  password?: string;
  role: UserRole;
  designation?: string; 
  employeeId?: string; 
  vendorCode?: string; // For Vendor/Sub-Vendor
  subVendorCode?: string; // For Sub-Vendor
  parentVendorId?: mongoose.Types.ObjectId; // Hierarchy link
  assignedCampaigns?: mongoose.Types.ObjectId[]; // For Vendors/Sub-Vendors
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  otp?: string;
  otpExpires?: Date;
  state?: string;
  district?: string;
  block?: string;
  area?: string;
  pincode?: string;
  address?: string;
  qualification?: string;
  experience?: string;
  aadhaarNumber?: string;
  profileImage?: string;
  documents?: {
    idProof?: string;
    photo?: string;
  };
  joiningDate?: Date;
  lastOtpSentAt?: Date;
  otpAttempts?: number;
  emailVerified: boolean;
  welcomeEmailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    whatsapp: { type: String },
    email: { type: String, sparse: true },
    password: { type: String },
    role: { 
      type: String, 
      enum: ['super_admin', 'vendor', 'sub_vendor', 'employee', 'member'], 
      default: 'member' 
    },
    designation: { type: String },
    employeeId: { type: String, unique: true, sparse: true },
    vendorCode: { type: String, unique: true, sparse: true },
    subVendorCode: { type: String, unique: true, sparse: true },
    parentVendorId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedCampaigns: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
    status: { 
      type: String, 
      enum: ['pending', 'active', 'inactive', 'rejected'], 
      default: 'pending' 
    },
    otp: { type: String },
    otpExpires: { type: Date },
    state: { type: String },
    district: { type: String },
    block: { type: String },
    area: { type: String },
    pincode: { type: String },
    address: { type: String },
    qualification: { type: String },
    experience: { type: String },
    aadhaarNumber: { type: String },
    profileImage: { type: String },
    documents: {
      idProof: { type: String },
      photo: { type: String },
    },
    lastOtpSentAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    welcomeEmailSent: { type: Boolean, default: false },
    joiningDate: { type: Date },
  },
  { timestamps: true }
);

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
