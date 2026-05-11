import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  groupName: string;
  village: string;
  panchayatWard: string;
  block: string;
  district: string;
  leaderName: string;
  leaderMobile: string;
  totalMembers: number;
  meetingDate: Date;
  campaignId: mongoose.Types.ObjectId;
  vendorCode?: string;
  subVendorCode?: string;
  remarks?: string;
  photo?: string;
  gpsLocation?: {
    lat: number;
    lng: number;
  };
  createdBy: mongoose.Types.ObjectId; // Employee ID
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
  {
    groupName: { type: String, required: true },
    village: { type: String, required: true },
    panchayatWard: { type: String, required: true },
    block: { type: String, required: true },
    district: { type: String, required: true },
    leaderName: { type: String, required: true },
    leaderMobile: { type: String, required: true },
    totalMembers: { type: Number, default: 0 },
    meetingDate: { type: Date, required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: false },
    vendorCode: { type: String },
    subVendorCode: { type: String },
    remarks: { type: String },
    photo: { type: String },
    gpsLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);


const Group = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
export default Group;
