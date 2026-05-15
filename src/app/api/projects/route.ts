import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/utils/response';

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

    if (slug) {
      const project = await Project.findOne({ slug, status: 'active', isVisible: true });
      if (!project) return errorResponse('Project not found', 404);
      return successResponse(project);
    }

    const projects = await Project.find({ status: 'active', isVisible: true }).sort({ createdAt: -1 });
    return successResponse(projects);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
