import mongoose, { Schema, Document } from 'mongoose';

export interface IWomenMember extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  mobile: string;
  age?: number;
  village?: string;
  district?: string;
  block?: string;
  state?: string;
  pincode?: string;
  address?: string;
  email?: string;
  maritalStatus?: 'Married' | 'Unmarried';
  occupation?: string;
  interests?: string[]; // Health Awareness, Sakhi Care Pads, Employment, etc.
  groupId?: mongoose.Types.ObjectId;
  assignedEmployeeId?: mongoose.Types.ObjectId; // The employee managing this member
  createdBy: mongoose.Types.ObjectId; // User ID of who created this (Self or Employee)
  vendorCode?: string;
  subVendorCode?: string;
  campaignId?: mongoose.Types.ObjectId;
  
  // New Status System
  accountStatus: 'active' | 'inactive';
  connectionStatus: 'unassigned' | 'pending_request' | 'approved' | 'rejected';
  membershipStatus: 'free' | 'pending_paid' | 'paid';
  
  membershipReceiptEmailSent?: boolean;
  invitationEmailSent?: boolean;
  requestEmailSent?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const WomenMemberSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    age: { type: Number },
    village: { type: String },
    district: { type: String },
    block: { type: String },
    state: { type: String },
    pincode: { type: String },
    address: { type: String },
    maritalStatus: { type: String, enum: ['Married', 'Unmarried'] },
    occupation: { type: String },
    interests: [{ type: String }],
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    assignedEmployeeId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendorCode: { type: String },
    subVendorCode: { type: String },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    
    accountStatus: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
    connectionStatus: { 
      type: String, 
      enum: ['unassigned', 'pending_request', 'approved', 'rejected'], 
      default: 'unassigned' 
    },
    membershipStatus: { 
      type: String, 
      enum: ['free', 'pending_paid', 'paid'], 
      default: 'free' 
    },
    email: { type: String },
    membershipReceiptEmailSent: { type: Boolean, default: false },
    invitationEmailSent: { type: Boolean, default: false },
    requestEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add index for faster searching by pincode/district
WomenMemberSchema.index({ pincode: 1, district: 1, block: 1 });

export default mongoose.models.WomenMember || mongoose.model<IWomenMember>('WomenMember', WomenMemberSchema);
