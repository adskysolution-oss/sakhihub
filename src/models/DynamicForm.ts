import mongoose, { Schema, Document } from 'mongoose';

export interface IDynamicFormField {
  fieldId: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file' | 'toggle';
  placeholder?: string;
  required: boolean;
  options?: string[]; // Used for select, radio, checkbox
}

export interface IDynamicFormStep {
  stepId: string;
  title: string;
  description?: string;
  fields: IDynamicFormField[];
}

export interface IDynamicForm extends Document {
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  steps: IDynamicFormStep[];
  createdAt: Date;
  updatedAt: Date;
}

const DynamicFormFieldSchema = new Schema<IDynamicFormField>({
  fieldId: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'number', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'toggle'], 
    required: true 
  },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ type: String }]
}, { _id: false });

const DynamicFormStepSchema = new Schema<IDynamicFormStep>({
  stepId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  fields: [DynamicFormFieldSchema]
}, { _id: false });

const DynamicFormSchema = new Schema<IDynamicForm>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  steps: [DynamicFormStepSchema]
}, { timestamps: true });

export default mongoose.models.DynamicForm || mongoose.model<IDynamicForm>('DynamicForm', DynamicFormSchema);
