import mongoose, { Schema, Document } from 'mongoose';

export interface IReportAuditLog extends Document {
  generatedBy: mongoose.Types.ObjectId;
  generatedAt: Date;
  reportType: string;
  filtersUsed: any;
  recordsIncluded: number;
  format: 'pdf' | 'excel' | 'csv';
  fileName: string;
}

const ReportAuditLogSchema: Schema = new Schema(
  {
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    generatedAt: { type: Date, default: Date.now, required: true },
    reportType: { type: String, required: true },
    filtersUsed: { type: Schema.Types.Mixed, default: {} },
    recordsIncluded: { type: Number, default: 0, required: true },
    format: { type: String, enum: ['pdf', 'excel', 'csv'], required: true },
    fileName: { type: String, required: true }
  },
  { timestamps: false }
);

// Indexes
ReportAuditLogSchema.index({ generatedAt: -1 });
ReportAuditLogSchema.index({ generatedBy: 1, generatedAt: -1 });

export default mongoose.models.ReportAuditLog || mongoose.model<IReportAuditLog>('ReportAuditLog', ReportAuditLogSchema);
