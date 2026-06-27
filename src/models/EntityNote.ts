import mongoose, { Schema, Document } from 'mongoose';

export interface IEntityNote extends Document {
  entityType: string; // e.g. 'SupportCase'
  entityId: mongoose.Types.ObjectId;
  note: string;
  createdBy: mongoose.Types.ObjectId; // User ref
  createdAt: Date;
  updatedAt: Date;
}

const EntityNoteSchema = new Schema(
  {
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    note: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Add index for fast retrieval of an entity's notes sorted by date
EntityNoteSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.EntityNote) {
  delete (mongoose.models as any).EntityNote;
}

export default mongoose.models.EntityNote || mongoose.model<IEntityNote>('EntityNote', EntityNoteSchema);
