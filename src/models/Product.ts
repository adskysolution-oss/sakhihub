import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  shortDescription: string;
  mrp: number;
  offerPrice: number;
  highlights: string[];
  benefits: string[];
  features: string[];
  bestFor: string[];
  posterImage?: string;
  status: 'active' | 'inactive';
  isVisible: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    mrp: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    highlights: [{ type: String }],
    benefits: [{ type: String }],
    features: [{ type: String }],
    bestFor: [{ type: String }],
    posterImage: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isVisible: { type: Boolean, default: true },
    slug: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

// Slugify title before saving
ProductSchema.pre('validate', function (this: any) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
