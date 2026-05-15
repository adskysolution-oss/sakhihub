import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { successResponse, errorResponse } from '@/utils/response';
import { uploadToCloudinary } from '@/lib/cloudinary';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Project;
    }
    const Project = require('@/models/Project').default;

    const projects = await Project.find().sort({ createdAt: -1 });
    return successResponse(projects);
  } catch (err: any) {
    return errorResponse(err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Force clear model cache in development to ensure schema changes apply
    if (process.env.NODE_ENV === 'development') {
      const mongoose = require('mongoose');
      delete mongoose.models.Project;
    }

    // Re-import Project to get the fresh model
    const Project = require('@/models/Project').default;

    const body = await req.json();
    console.log("🚀 Project Creation Triggered (Fresh Model):", body.title);

    // Filter empty highlights
    if (body.highlights) {
      body.highlights = body.highlights.filter((h: string) => h.trim() !== '');
    }
    if (body.heroBanner?.highlights) {
      body.heroBanner.highlights = body.heroBanner.highlights.filter((h: string) => h.trim() !== '');
    }

    // Handle image uploads if provided as base64
    if (body.posterImage && body.posterImage.startsWith('data:')) {
      const uploadRes = await uploadToCloudinary(body.posterImage, 'projects');
      body.posterImage = uploadRes.secure_url;
    }
    if (body.secondaryImage && body.secondaryImage.startsWith('data:')) {
      const uploadRes = await uploadToCloudinary(body.secondaryImage, 'projects');
      body.secondaryImage = uploadRes.secure_url;
    }

    const project = await Project.create(body);
    return successResponse(project, 'Project created successfully', 201);
  } catch (err: any) {
    console.error("Project Creation Error:", err);
    if (err.code === 11000) {
      return errorResponse('A project with this title already exists', 400);
    }
    return errorResponse(err.message || "Failed to create project", 400);
  }
}
