import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  key: string; // unique permission identifier, e.g., 'documents.view'
  name: string; // human-readable label
  module: string; // module name for grouping
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    module: { type: String, required: true },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);
