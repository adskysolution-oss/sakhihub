import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'super_admin' | 'vendor' | 'sub_vendor' | 'employee' | 'member';
export type UserStatus = 'pending' | 'documents_uploaded' | 'under_review' | 'reupload_required' | 'approved' | 'active' | 'rejected' | 'suspended';
export type VendorDocumentStatus = 'uploaded' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'reupload_required';

export interface IVendorDocumentEntry {
  url: string;
  publicId?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  vendorId?: string;
  vendorEmail?: string;
  status: VendorDocumentStatus;
  remarks?: string;
  uploadedAt?: Date;
  reviewedAt?: Date;
}

export interface IUser extends Document {
  fullName: string;
  mobile: string;
  email?: string;
  password?: string;
  role: UserRole;
  designation?: string; 
  employeeId?: string; 
  vendorCode?: string; // For Vendor/Sub-Vendor
  subVendorCode?: string; // For Sub-Vendor
  parentVendorId?: mongoose.Types.ObjectId; // Hierarchy link
  campaignId?: mongoose.Types.ObjectId; // Hierarchical Campaign assignment
  assignedCampaigns?: mongoose.Types.ObjectId[]; // For Vendors/Sub-Vendors
  status: UserStatus;
  assignmentStatus: 'pending' | 'completed';
  referralSource: 'direct' | 'invite';
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
  businessName?: string;
  panNumber?: string;
  documents?: {
    ngoCertificate?: IVendorDocumentEntry;
    panCard?: IVendorDocumentEntry;
    aadhaarCard?: IVendorDocumentEntry;
    bankPassbook?: IVendorDocumentEntry;
  };
  joiningDate?: Date;
  lastOtpSentAt?: Date;
  otpAttempts?: number;
  emailVerified: boolean;
  welcomeEmailSent: boolean;
  isVerified: boolean;
  onboardingCompleted: boolean;
  documentsVerified: boolean;
  dashboardAccess: boolean;
  parentVendorCode?: string; // Referral tracking
  parentSubVendorCode?: string; // Referral tracking
  parentEmployeeCode?: string; // Referral tracking
  campaignCode?: string; // Referral tracking
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
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
    businessName: { type: String },
    panNumber: { type: String },
    parentVendorId: { type: Schema.Types.ObjectId, ref: 'User' },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    assignedCampaigns: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
    status: { 
      type: String, 
      enum: ['pending', 'documents_uploaded', 'under_review', 'reupload_required', 'approved', 'active', 'rejected', 'suspended'], 
      default: 'pending',
      required: true,
      trim: true,
      lowercase: true
    },
    assignmentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    referralSource: { type: String, enum: ['direct', 'invite'], default: 'direct' },
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
      ngoCertificate: {
        url: { type: String },
        publicId: { type: String },
        fileName: { type: String },
        fileSize: { type: String },
        mimeType: { type: String },
        vendorId: { type: String },
        vendorEmail: { type: String },
        status: { type: String, enum: ['uploaded', 'pending', 'under_review', 'approved', 'rejected', 'reupload_required'], default: 'uploaded' },
        remarks: { type: String },
        uploadedAt: { type: Date },
        reviewedAt: { type: Date }
      },
      panCard: {
        url: { type: String },
        publicId: { type: String },
        fileName: { type: String },
        fileSize: { type: String },
        mimeType: { type: String },
        vendorId: { type: String },
        vendorEmail: { type: String },
        status: { type: String, enum: ['uploaded', 'pending', 'under_review', 'approved', 'rejected', 'reupload_required'], default: 'uploaded' },
        remarks: { type: String },
        uploadedAt: { type: Date },
        reviewedAt: { type: Date }
      },
      aadhaarCard: {
        url: { type: String },
        publicId: { type: String },
        fileName: { type: String },
        fileSize: { type: String },
        mimeType: { type: String },
        vendorId: { type: String },
        vendorEmail: { type: String },
        status: { type: String, enum: ['uploaded', 'pending', 'under_review', 'approved', 'rejected', 'reupload_required'], default: 'uploaded' },
        remarks: { type: String },
        uploadedAt: { type: Date },
        reviewedAt: { type: Date }
      },
      bankPassbook: {
        url: { type: String },
        publicId: { type: String },
        fileName: { type: String },
        fileSize: { type: String },
        mimeType: { type: String },
        vendorId: { type: String },
        vendorEmail: { type: String },
        status: { type: String, enum: ['uploaded', 'pending', 'under_review', 'approved', 'rejected', 'reupload_required'], default: 'uploaded' },
        remarks: { type: String },
        uploadedAt: { type: Date },
        reviewedAt: { type: Date }
      }
    },
    lastOtpSentAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    welcomeEmailSent: { type: Boolean, default: false },
    joiningDate: { type: Date },
    isVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    documentsVerified: { type: Boolean, default: false },
    dashboardAccess: { type: Boolean, default: false },
    parentVendorCode: { type: String },
    parentSubVendorCode: { type: String },
    parentEmployeeCode: { type: String },
    campaignCode: { type: String },
  },
  { timestamps: true }
);

// Prevent model recompilation in development while ensuring schema updates are picked up
let UserModel;
try {
  UserModel = mongoose.model<IUser>('User');
} catch (e) {
  UserModel = mongoose.model<IUser>('User', UserSchema);
}

export default UserModel;
