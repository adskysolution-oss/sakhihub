import mongoose, { Schema, Document } from 'mongoose';

export interface IFormAnalyticsCache extends Document {
  formId: mongoose.Types.ObjectId;
  formVersion: number;
  scopeKey: string; // "all" or md5 hash of regionalUserIds
  analyticsStatus: 'idle' | 'building' | 'ready';
  totalResponses: number;
  statusBreakdown: {
    submitted: number;
    reviewed: number;
    rejected: number;
  };
  demographics: {
    gender: { male: number; female: number; unspecified: number };
    ageGroups: { under18: number; y18_25: number; y26_45: number; above45: number };
    userTypes: Record<string, number>;
  };
  locationStats: {
    states: Record<string, number>;
    districts: Record<string, number>;
    blocks: Record<string, number>;
  };
  fieldAnalytics: Record<string, any>;
  updatedAt: Date;
}

const FormAnalyticsCacheSchema = new Schema<IFormAnalyticsCache>({
  formId: { type: Schema.Types.ObjectId, ref: 'DynamicForm', required: true },
  formVersion: { type: Number, required: true },
  scopeKey: { type: String, required: true },
  analyticsStatus: { type: String, enum: ['idle', 'building', 'ready'], default: 'idle' },
  totalResponses: { type: Number, default: 0 },
  statusBreakdown: {
    submitted: { type: Number, default: 0 },
    reviewed: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 }
  },
  demographics: {
    gender: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      unspecified: { type: Number, default: 0 }
    },
    ageGroups: {
      under18: { type: Number, default: 0 },
      y18_25: { type: Number, default: 0 },
      y26_45: { type: Number, default: 0 },
      above45: { type: Number, default: 0 }
    },
    userTypes: { type: Map, of: Number, default: {} }
  },
  locationStats: {
    states: { type: Map, of: Number, default: {} },
    districts: { type: Map, of: Number, default: {} },
    blocks: { type: Map, of: Number, default: {} }
  },
  fieldAnalytics: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Compound index for cache hits
FormAnalyticsCacheSchema.index({ formId: 1, formVersion: 1, scopeKey: 1 }, { unique: true });

// Prevent model recompilation in development while ensuring schema updates are picked up
if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.FormAnalyticsCache) {
  delete (mongoose.models as any).FormAnalyticsCache;
}

export default mongoose.models.FormAnalyticsCache || mongoose.model<IFormAnalyticsCache>('FormAnalyticsCache', FormAnalyticsCacheSchema);
