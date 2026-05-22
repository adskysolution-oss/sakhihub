import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeOfferLetter extends Document {
  employeeId: mongoose.Types.ObjectId;
  offerLetterId: string;
  joiningDate: Date;
  salary: string;
  generatedDate: Date;
  status: 'generated' | 'accepted' | 'rejected';
  digitalAcceptanceStatus: boolean;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeOfferLetterSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    offerLetterId: { type: String, required: true, unique: true },
    joiningDate: { type: Date, required: true },
    salary: { type: String, required: true },
    generatedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['generated', 'accepted', 'rejected'], default: 'generated' },
    digitalAcceptanceStatus: { type: Boolean, default: false },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.EmployeeOfferLetter || mongoose.model<IEmployeeOfferLetter>('EmployeeOfferLetter', EmployeeOfferLetterSchema);
