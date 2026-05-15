import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  shortDescription: string;
  tagline: string;
  highlights: string[];
  heroBanner: {
    heading: string;
    subHeading: string;
    highlights: string[];
    ctaText1: string;
    ctaText2: string;
  };
  posterImage?: string;
  secondaryImage?: string;
  status: 'active' | 'inactive';
  isVisible: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    tagline: { type: String, required: true },
    highlights: [{ type: String }],
    heroBanner: {
      heading: { type: String },
      subHeading: { type: String },
      highlights: [{ type: String }],
      ctaText1: { type: String, default: 'Join Program' },
      ctaText2: { type: String, default: 'Become Member' },
    },
    posterImage: { type: String },
    secondaryImage: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isVisible: { type: Boolean, default: true },
    slug: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

// Slugify title before saving
ProjectSchema.pre('validate', function (this: any) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
