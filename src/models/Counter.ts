import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
  },
  { timestamps: true }
);

if (mongoose.models.Counter) {
  delete (mongoose.models as any).Counter;
}

export default mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);
