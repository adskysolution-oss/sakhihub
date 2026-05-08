import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
  key: string;
  en: string;
  hi: string;
  category: 'home' | 'about' | 'services' | 'footer' | 'general';
  updatedBy: mongoose.Types.ObjectId;
}

const ContentSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    en: { type: String, required: true },
    hi: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['home', 'about', 'services', 'footer', 'general'], 
      default: 'general' 
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);
