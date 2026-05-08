import mongoose, { Schema, Document } from 'mongoose';

export interface IWomenMember extends Document {
  name: string;
  mobile: string;
  age: number;
  village: string;
  district: string;
  block: string;
  maritalStatus: 'Married' | 'Unmarried';
  occupation: string;
  interests: string[]; // Health Awareness, Sakhi Care Pads, Employment, etc.
  groupId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; // Employee ID
  membershipStatus: 'pending' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

const WomenMemberSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    age: { type: Number, required: true },
    village: { type: String, required: true },
    district: { type: String, required: true },
    block: { type: String, required: true },
    maritalStatus: { type: String, enum: ['Married', 'Unmarried'], required: true },
    occupation: { type: String, required: true },
    interests: [{ type: String }],
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    membershipStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.models.WomenMember || mongoose.model<IWomenMember>('WomenMember', WomenMemberSchema);
