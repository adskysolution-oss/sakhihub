import mongoose, { Schema, Document } from 'mongoose';

export interface IReportTemplate extends Document {
  name: string;
  entityType: 'vendors' | 'sub_vendors' | 'employees' | 'members' | 'payments' | 'memberships' | 'compliance';
  filters: {
    startDate?: Date;
    endDate?: Date;
    status?: string[];
    paymentStatus?: string[];
    location?: {
      state?: string;
      district?: string;
      block?: string;
    };
    designation?: string;
  };
  selectedFields: string[];
  format: 'pdf' | 'excel' | 'csv';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['vendors', 'sub_vendors', 'employees', 'members', 'payments', 'memberships', 'compliance'],
      required: true
    },
    filters: {
      startDate: { type: Date },
      endDate: { type: Date },
      status: [{ type: String }],
      paymentStatus: [{ type: String }],
      location: {
        state: { type: String },
        district: { type: String },
        block: { type: String }
      },
      designation: { type: String }
    },
    selectedFields: [{ type: String, required: true }],
    format: { type: String, enum: ['pdf', 'excel', 'csv'], default: 'pdf' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Indexes
ReportTemplateSchema.index({ name: 1 });
ReportTemplateSchema.index({ createdBy: 1 });

export default mongoose.models.ReportTemplate || mongoose.model<IReportTemplate>('ReportTemplate', ReportTemplateSchema);
