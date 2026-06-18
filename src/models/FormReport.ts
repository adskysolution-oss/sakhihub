import mongoose, { Schema, Document } from 'mongoose';

export interface IFormReport extends Document {
  formId: mongoose.Types.ObjectId;
  formVersion: number;
  reportType: 'csv' | 'excel' | 'pdf';
  generatedBy: mongoose.Types.ObjectId;
  fileUrl: string;
  createdAt: Date;
}

const FormReportSchema = new Schema<IFormReport>({
  formId: { type: Schema.Types.ObjectId, ref: 'DynamicForm', required: true },
  formVersion: { type: Number, required: true },
  reportType: { type: String, enum: ['csv', 'excel', 'pdf'], required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Prevent model recompilation in development while ensuring schema updates are picked up
if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.FormReport) {
  delete (mongoose.models as any).FormReport;
}

export default mongoose.models.FormReport || mongoose.model<IFormReport>('FormReport', FormReportSchema);
