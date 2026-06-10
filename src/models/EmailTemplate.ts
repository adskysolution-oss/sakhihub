import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
  name: string;
  subject: string;
  content: string; // HTML body
  description?: string;
  isSystem: boolean; // Protect system templates (welcome, registration, etc.) from deletion
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    description: { type: String },
    isSystem: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

EmailTemplateSchema.index({ name: 1 });
EmailTemplateSchema.index({ isSystem: 1 });

export default mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
