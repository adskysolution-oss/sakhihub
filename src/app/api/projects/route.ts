import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/utils/response';
import { translateDynamicData } from '@/lib/server-translate';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Project;
    }
    const Project = require('@/models/Project').default;

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const lang = req.headers.get('x-language') || 'en';
    const fieldsToTranslate = [
      'title', 'shortDescription', 'tagline', 'highlights',
      'heroBanner.heading', 'heroBanner.subHeading', 'heroBanner.highlights',
      'heroBanner.ctaText1', 'heroBanner.ctaText2'
    ];

    if (slug) {
      const project = await Project.findOne({ slug, status: 'active', isVisible: true }).lean();
      if (!project) return errorResponse('Project not found', 404);
      
      const translatedProject = await translateDynamicData(project, lang, fieldsToTranslate);
      return successResponse(translatedProject);
    }

    const projects = await Project.find({ status: 'active', isVisible: true }).sort({ createdAt: -1 }).lean();
    const translatedProjects = await translateDynamicData(projects, lang, fieldsToTranslate);
    
    return successResponse(translatedProjects);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
