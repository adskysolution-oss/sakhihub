import mongoose, { Schema, Document } from 'mongoose';

export interface IAgreementTemplate extends Document {
  version: string;
  templateHtml: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AgreementTemplateSchema: Schema = new Schema(
  {
    version: { type: String, required: true, unique: true },
    templateHtml: { type: String, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.AgreementTemplate || mongoose.model<IAgreementTemplate>('AgreementTemplate', AgreementTemplateSchema);
