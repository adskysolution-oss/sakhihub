import mongoose, { Schema, Document } from 'mongoose';

export interface IFileRecord extends Document {
  url: string;
  provider: 'cloudinary' | 's3';
  key: string;
  folder: string;
  uploadedBy?: mongoose.Types.ObjectId;
  uploadedFor?: string; // Additional context if needed
  fileType?: string;
  fileSize?: number;
  originalName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FileRecordSchema: Schema = new Schema(
  {
    url: { type: String, required: true },
    provider: { 
      type: String, 
      enum: ['cloudinary', 's3'], 
      required: true,
      default: 's3'
    },
    key: { type: String, required: true }, // s3 object key or cloudinary public_id
    folder: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedFor: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    originalName: { type: String }
  },
  { timestamps: true }
);

// Prevent model recompilation in development
export default mongoose.models.FileRecord || mongoose.model<IFileRecord>('FileRecord', FileRecordSchema);
