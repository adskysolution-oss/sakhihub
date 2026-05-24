import mongoose, { Schema, Document } from 'mongoose';

export interface IFormResponse extends Document {
  formId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  responses: Record<string, any>; // Key: fieldId, Value: Answer
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormResponseSchema = new Schema<IFormResponse>({
  formId: { type: Schema.Types.ObjectId, ref: 'DynamicForm', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  responses: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['Submitted', 'Reviewed', 'Rejected'], default: 'Submitted' }
}, { timestamps: true });

export default mongoose.models.FormResponse || mongoose.model<IFormResponse>('FormResponse', FormResponseSchema);
