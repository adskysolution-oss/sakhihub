import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/utils/response';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Project;
    }
    const Project = require('@/models/Project').default;

    const { id } = await params;
    const project = await Project.findById(id);
    if (!project) return errorResponse('Project not found', 404);
    return successResponse(project);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Project;
    }
    const Project = require('@/models/Project').default;

    const { id } = await params;
    const body = await req.json();

    // Filter empty highlights
    if (body.highlights) {
      body.highlights = body.highlights.filter((h: string) => h.trim() !== '');
    }
    if (body.heroBanner?.highlights) {
      body.heroBanner.highlights = body.heroBanner.highlights.filter((h: string) => h.trim() !== '');
    }

    // Handle image uploads if provided as base64 and it's new
    if (body.posterImage && body.posterImage.startsWith('data:')) {
      const uploadRes = await uploadToCloudinary(body.posterImage, 'projects');
      body.posterImage = uploadRes.secure_url;
    }
    if (body.secondaryImage && body.secondaryImage.startsWith('data:')) {
      const uploadRes = await uploadToCloudinary(body.secondaryImage, 'projects');
      body.secondaryImage = uploadRes.secure_url;
    }

    const project = await Project.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!project) return errorResponse('Project not found', 404);

    return successResponse(project, 'Project updated successfully');
  } catch (err: any) {
    console.error("Project Update Error:", err);
    return errorResponse(err.message || "Failed to update project", 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const Project = require('@/models/Project').default;
    const project = await Project.findByIdAndDelete(id);
    if (!project) return errorResponse('Project not found', 404);
    return successResponse(null, 'Project deleted successfully');
  } catch (err: any) {
    return errorResponse(err.message);
  }
}
