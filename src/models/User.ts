import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'super_admin' | 'vendor' | 'sub_vendor' | 'employee' | 'member';
export type UserStatus = 'pending' | 'documents_uploaded' | 'under_review' | 'reupload_required' | 'approved' | 'active' | 'rejected' | 'suspended';
export type VendorDocumentStatus = 'uploaded' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'reupload_required' | 'exception_requested' | 'exception_responded' | 'exception_approved' | 'on_hold';

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
  exceptionReason?: string;
  exceptionAdminRemarks?: string;
  exceptionUserReply?: string;
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
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
  };
  vendorType?: 'individual' | 'company' | 'ngo_trust';
  documents?: {
    ngoCertificate?: IVendorDocumentEntry;
    panCard?: IVendorDocumentEntry;
    aadhaarCard?: IVendorDocumentEntry;
    aadhaarCardFront?: IVendorDocumentEntry;
    aadhaarCardBack?: IVendorDocumentEntry;
    bankPassbook?: IVendorDocumentEntry;
    passportPhoto?: IVendorDocumentEntry;
    companyRegCertificate?: IVendorDocumentEntry;
    gstCertificate?: IVendorDocumentEntry;
    companyPanCard?: IVendorDocumentEntry;
    directorAadhaarCard?: IVendorDocumentEntry;
    directorAadhaarCardFront?: IVendorDocumentEntry;
    directorAadhaarCardBack?: IVendorDocumentEntry;
    directorPanCard?: IVendorDocumentEntry;
    companyLogo?: IVendorDocumentEntry;
    ngoPanCard?: IVendorDocumentEntry;
    certificate12A?: IVendorDocumentEntry;
    certificate80G?: IVendorDocumentEntry;
    ngoLogo?: IVendorDocumentEntry;
    resume?: IVendorDocumentEntry;
    certificate12th?: IVendorDocumentEntry;
    graduationCertificate?: IVendorDocumentEntry;
    [key: string]: IVendorDocumentEntry | undefined;
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
  subscriptionPaid: boolean;
  depositPaid: boolean;
  paymentCompleted: boolean;
  parentVendorCode?: string; // Referral tracking
  parentSubVendorCode?: string; // Referral tracking
  parentEmployeeCode?: string; // Referral tracking
  campaignCode?: string; // Referral tracking
  membershipType?: 'paid' | 'free';
  accessStatus?: 'locked' | 'unlocked';
  paymentStatus?: 'pending' | 'completed';
  verificationStatus?: 'pending' | 'verified';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentEntrySchema = new Schema({
  url: { type: String },
  publicId: { type: String },
  fileName: { type: String },
  fileSize: { type: String },
  mimeType: { type: String },
  vendorId: { type: String },
  employeeId: { type: String },
  userId: { type: String },
  vendorEmail: { type: String },
  status: {
    type: String,
    enum: ['uploaded', 'pending', 'under_review', 'approved', 'rejected', 'reupload_required', 'exception_requested', 'exception_approved', 'on_hold', 'exception_responded'],
    default: 'uploaded'
  },
  remarks: { type: String },
  exceptionReason: { type: String },
  exceptionUserReply: { type: String },
  exceptionAdminRemarks: { type: String },
  uploadedAt: { type: Date },
  reviewedAt: { type: Date }
}, { _id: false });

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
    vendorType: {
      type: String,
      enum: ['individual', 'company', 'ngo_trust']
    },
    designation: { type: String },
    employeeId: { type: String, unique: true, sparse: true },
    vendorCode: { type: String, unique: true, sparse: true },
    subVendorCode: { type: String, unique: true, sparse: true },
    businessName: { type: String },
    panNumber: { type: String, unique: true, sparse: true },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String, unique: true, sparse: true },
      ifscCode: { type: String },
      bankName: { type: String },
      branchName: { type: String }
    },
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
    aadhaarNumber: { type: String, unique: true, sparse: true },
    profileImage: { type: String },
    documents: {
      ngoCertificate: { type: DocumentEntrySchema },
      panCard: { type: DocumentEntrySchema },
      aadhaarCard: { type: DocumentEntrySchema },
      aadhaarCardFront: { type: DocumentEntrySchema },
      aadhaarCardBack: { type: DocumentEntrySchema },
      bankPassbook: { type: DocumentEntrySchema },
      passportPhoto: { type: DocumentEntrySchema },
      companyRegCertificate: { type: DocumentEntrySchema },
      gstCertificate: { type: DocumentEntrySchema },
      companyPanCard: { type: DocumentEntrySchema },
      directorAadhaarCard: { type: DocumentEntrySchema },
      directorAadhaarCardFront: { type: DocumentEntrySchema },
      directorAadhaarCardBack: { type: DocumentEntrySchema },
      directorPanCard: { type: DocumentEntrySchema },
      companyLogo: { type: DocumentEntrySchema },
      ngoPanCard: { type: DocumentEntrySchema },
      certificate12A: { type: DocumentEntrySchema },
      certificate80G: { type: DocumentEntrySchema },
      ngoLogo: { type: DocumentEntrySchema },
      certificate12th: { type: DocumentEntrySchema },
      graduationCertificate: { type: DocumentEntrySchema },
      resume: { type: DocumentEntrySchema }
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
    subscriptionPaid: { type: Boolean, default: false },
    depositPaid: { type: Boolean, default: false },
    paymentCompleted: { type: Boolean, default: false },
    parentVendorCode: { type: String },
    parentSubVendorCode: { type: String },
    parentEmployeeCode: { type: String },
    campaignCode: { type: String },
    membershipType: { type: String, enum: ['paid', 'free'], default: 'free' },
    accessStatus: { type: String, enum: ['locked', 'unlocked'], default: 'locked' },
    paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    verificationStatus: { type: String, enum: ['pending', 'verified'], default: 'pending' },
  },
  { timestamps: true }
);

// Prevent model recompilation in development while ensuring schema updates are picked up
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
