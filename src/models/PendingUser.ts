import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingUser extends Document {
  fullName: string;
  mobile: string;
  email: string;
  password?: string;
  role: string;
  designation?: string;
  qualification?: string;
  experience?: string;
  state?: string;
  district?: string;
  block?: string;
  area?: string;
  pincode?: string;
  address?: string;
  aadhaarNumber?: string;
  otp: string;
  otpExpires: Date;
  otpAttempts: number;
  // Hierarchy/Assignment fields
  parentVendorId?: mongoose.Types.ObjectId;
  parentVendorCode?: string;
  parentSubVendorCode?: string;
  parentEmployeeCode?: string;
  campaignId?: mongoose.Types.ObjectId;
  campaignCode?: string;
  // Extra member fields
  age?: number;
  maritalStatus?: string;
  occupation?: string;
  interests?: string[];
  assignedEmployeeId?: string;
  vendorType?: 'individual' | 'company' | 'ngo_trust';
  membershipType?: 'paid' | 'free';
  createdAt: Date;
}

const PendingUserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: { type: String, required: true },
    vendorType: { type: String, enum: ['individual', 'company', 'ngo_trust'] },
    designation: { type: String },
    qualification: { type: String },
    experience: { type: String },
    state: { type: String },
    district: { type: String },
    block: { type: String },
    area: { type: String },
    pincode: { type: String },
    address: { type: String },
    aadhaarNumber: { type: String },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    otpAttempts: { type: Number, default: 0 },
    parentVendorId: { type: Schema.Types.ObjectId, ref: 'User' },
    parentVendorCode: { type: String },
    parentSubVendorCode: { type: String },
    parentEmployeeCode: { type: String },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    campaignCode: { type: String },
    age: { type: Number },
    maritalStatus: { type: String },
    occupation: { type: String },
    interests: [{ type: String }],
    assignedEmployeeId: { type: String },
    membershipType: { type: String, enum: ['paid', 'free'], default: 'free' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index to automatically delete expired pending registrations after 24 hours
PendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.models.PendingUser || mongoose.model<IPendingUser>('PendingUser', PendingUserSchema);
