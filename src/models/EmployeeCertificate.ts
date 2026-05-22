import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeCertificate extends Document {
  employeeId: mongoose.Types.ObjectId;
  certificateType: 'id_card' | 'joining_letter' | 'other';
  title: string;
  fileUrl: string;
  generatedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeCertificateSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    certificateType: { type: String, enum: ['id_card', 'joining_letter', 'other'], required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    generatedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.EmployeeCertificate || mongoose.model<IEmployeeCertificate>('EmployeeCertificate', EmployeeCertificateSchema);
