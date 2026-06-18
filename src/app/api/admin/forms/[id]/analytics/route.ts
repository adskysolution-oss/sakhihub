import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DynamicForm from '@/models/DynamicForm';
import FormResponse from '@/models/FormResponse';
import FormAnalyticsCache from '@/models/FormAnalyticsCache';
import User from '@/models/User';
import '@/models/Campaign';
import '@/models/Group';
import '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { getRegionalUserIds } from '@/utils/authHelpers';
import mongoose from 'mongoose';

// Dynamic background aggregator function
async function rebuildAnalyticsCache(
  formId: string,
  formVersion: number,
  scopeKey: string,
  regionalUserIds: any[] | null
) {
  try {
    await connectDB();

    // 1. Build Query
    const query: any = {
      formId: new mongoose.Types.ObjectId(formId)
    };

    if (formVersion === 1) {
      query.$or = [
        { formVersion: 1 },
        { formVersion: { $exists: false } },
        { formVersion: null }
      ];
    } else {
      query.formVersion = formVersion;
    }

    if (regionalUserIds !== null) {
      query.userId = { $in: regionalUserIds.map(id => new mongoose.Types.ObjectId(id.toString())) };
    }

    // 2. Fetch submissions
    const submissions = await FormResponse.find(query).lean();

    // 3. Fetch Form details to identify fields enabled for analytics
    const form = await DynamicForm.findById(formId).lean() as any;
    if (!form) {
      throw new Error('Form not found');
    }

    const enabledFields = new Map<string, any>();
    for (const step of form.steps || []) {
      for (const field of step.fields || []) {
        if (field.analyticsEnabled) {
          enabledFields.set(field.fieldId, field);
        }
      }
    }

    // 4. Initial analytics structure
    const totalResponses = submissions.length;
    const statusBreakdown = { submitted: 0, reviewed: 0, rejected: 0 };
    
    // Demographic distributions
    const genderStats = { male: 0, female: 0, unspecified: 0 };
    const ageStats = { under18: 0, y18_25: 0, y26_45: 0, above45: 0 };
    const userTypes: Record<string, number> = {};

    // Location distributions
    const states: Record<string, number> = {};
    const districts: Record<string, number> = {};
    const blocks: Record<string, number> = {};

    // Dynamic field analytics holder
    const fieldAnalytics: Record<string, any> = {};
    enabledFields.forEach((field, fieldId) => {
      if (['select', 'radio', 'checkbox'].includes(field.type)) {
        fieldAnalytics[fieldId] = { type: field.type, label: field.label, options: {} };
      } else if (field.type === 'toggle') {
        fieldAnalytics[fieldId] = { type: field.type, label: field.label, yes: 0, no: 0 };
      } else if (field.type === 'number') {
        fieldAnalytics[fieldId] = { type: field.type, label: field.label, min: null, max: null, avg: 0, values: [] };
      } else if (field.type === 'date') {
        fieldAnalytics[fieldId] = { type: field.type, label: field.label, dates: {} };
      } else {
        fieldAnalytics[fieldId] = { type: field.type, label: field.label, count: 0 };
      }
    });

    // Extract User IDs to fetch demographic data efficiently
    const userIds = submissions.map((s: any) => s.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).lean() as any[];
    const userMap = new Map<string, any>(users.map(u => [u._id.toString(), u]));

    // 5. Process responses in memory
    for (const sub of submissions) {
      // Status
      const status = (sub.status || 'Submitted').toLowerCase();
      if (status === 'submitted') statusBreakdown.submitted++;
      else if (status === 'reviewed') statusBreakdown.reviewed++;
      else if (status === 'rejected') statusBreakdown.rejected++;

      // User Demographics & Locations
      let currentGender = 'unspecified';
      let age = null;
      let role = 'anonymous';
      let state = null;
      let district = null;
      let block = null;

      if (sub.userId) {
        const user = userMap.get(sub.userId.toString());
        if (user) {
          currentGender = (user.gender || 'unspecified').toLowerCase();
          role = user.role || 'member';
          state = user.state || user.workState || null;
          district = user.district || user.workDistrict || null;
          block = user.block || user.workBlock || null;

          if (user.dob) {
            const birth = new Date(user.dob);
            const today = new Date();
            age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
          }
        }
      }

      // Demographic updates
      if (currentGender === 'male') genderStats.male++;
      else if (currentGender === 'female') genderStats.female++;
      else genderStats.unspecified++;

      if (age !== null) {
        if (age < 18) ageStats.under18++;
        else if (age <= 25) ageStats.y18_25++;
        else if (age <= 45) ageStats.y26_45++;
        else ageStats.above45++;
      }

      userTypes[role] = (userTypes[role] || 0) + 1;

      // Location stats
      if (state) states[state] = (states[state] || 0) + 1;
      if (district) districts[district] = (districts[district] || 0) + 1;
      if (block) blocks[block] = (blocks[block] || 0) + 1;

      // Field level answers
      const answers = sub.responses || {};
      enabledFields.forEach((field, fieldId) => {
        const val = answers[fieldId];
        if (val === undefined || val === null || val === '') return;

        const analysis = fieldAnalytics[fieldId];
        
        if (['select', 'radio'].includes(field.type)) {
          const optVal = String(val);
          analysis.options[optVal] = (analysis.options[optVal] || 0) + 1;
        } else if (field.type === 'checkbox') {
          const optionsSelected = Array.isArray(val) ? val : [val];
          for (const opt of optionsSelected) {
            const optVal = String(opt);
            analysis.options[optVal] = (analysis.options[optVal] || 0) + 1;
          }
        } else if (field.type === 'toggle') {
          const isYes = val === true || val === 'true' || val === 'Yes' || val === 1;
          if (isYes) analysis.yes++;
          else analysis.no++;
        } else if (field.type === 'number') {
          const num = Number(val);
          if (!isNaN(num)) {
            analysis.values.push(num);
            if (analysis.min === null || num < analysis.min) analysis.min = num;
            if (analysis.max === null || num > analysis.max) analysis.max = num;
          }
        } else if (field.type === 'date') {
          try {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
              const timelineKey = d.toISOString().substring(0, 7); // YYYY-MM format
              analysis.dates[timelineKey] = (analysis.dates[timelineKey] || 0) + 1;
            }
          } catch (e) {}
        } else {
          analysis.count++;
        }
      });
    }

    // Post-process numeric fields to calculate averages and remove array raw values
    enabledFields.forEach((field, fieldId) => {
      if (field.type === 'number') {
        const analysis = fieldAnalytics[fieldId];
        if (analysis.values.length > 0) {
          const sum = analysis.values.reduce((s: number, v: number) => s + v, 0);
          analysis.avg = Number((sum / analysis.values.length).toFixed(2));
        }
        delete analysis.values; // Remove raw values from final cached object
      }
    });

    // 6. Save update to Cache collection
    await FormAnalyticsCache.findOneAndUpdate(
      { formId: new mongoose.Types.ObjectId(formId), formVersion, scopeKey },
      {
        totalResponses,
        statusBreakdown,
        demographics: {
          gender: genderStats,
          ageGroups: ageStats,
          userTypes
        },
        locationStats: {
          states,
          districts,
          blocks
        },
        fieldAnalytics,
        analyticsStatus: 'ready',
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
  } catch (error: any) {
    console.error(`[ANALYTICS-REBUILD-ERROR] Form: ${formId}, Version: ${formVersion}:`, error.message);
    // Reset state to idle if building fails
    await FormAnalyticsCache.findOneAndUpdate(
      { formId: new mongoose.Types.ObjectId(formId), formVersion, scopeKey },
      { analyticsStatus: 'idle' }
    ).catch(() => {});
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession() as any;
    if (!session || (session.role !== 'super_admin' && !(session.role === 'staff' && session.permissions?.includes('forms.analytics')))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const form = await DynamicForm.findById(id).lean() as any;
    if (!form) {
      return NextResponse.json({ success: false, message: 'Form not found' }, { status: 404 });
    }

    // Check regional scoping boundaries
    const regionalUserIds = await getRegionalUserIds(session);
    let scopeKey = 'all';
    if (regionalUserIds !== null) {
      // Build sorted ID list to serve as unique cache key
      scopeKey = regionalUserIds.map(uid => uid.toString()).sort().join(',');
    }

    // Retrieve or initialize the cache record
    let cache = await FormAnalyticsCache.findOne({
      formId: form._id,
      formVersion: form.version || 1,
      scopeKey
    });

    if (!cache) {
      cache = new FormAnalyticsCache({
        formId: form._id,
        formVersion: form.version || 1,
        scopeKey,
        analyticsStatus: 'idle'
      });
      await cache.save();
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // TTL check (5 minutes = 300,000ms)
    const isStale = !cache.updatedAt || (Date.now() - new Date(cache.updatedAt).getTime() > 5 * 60 * 1000);
    const shouldRebuild = (isStale || cache.analyticsStatus === 'idle' || forceRefresh) && cache.analyticsStatus !== 'building';

    if (shouldRebuild) {
      // Set state to building
      cache.analyticsStatus = 'building';
      await cache.save();

      // Trigger background recalculation (non-blocking)
      rebuildAnalyticsCache(
        form._id.toString(),
        form.version || 1,
        scopeKey,
        regionalUserIds
      ).catch(err => {
        console.error('[ANALYTICS-BACKGROUND-FAIL]', err);
      });
    }

    return NextResponse.json({
      success: true,
      data: cache
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
