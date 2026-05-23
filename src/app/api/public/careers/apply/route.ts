import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import crypto from 'crypto';

function generateApplicationId() {
  return `APP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      vacancyId: body.vacancyId,
      $or: [
        { mobile: body.mobile },
        { email: body.email }
      ]
    });

    if (existingApplication) {
      return NextResponse.json(
        { 
          success: false, 
          message: `You have already applied for this vacancy. Your current status is: ${existingApplication.status}`,
          existingStatus: existingApplication.status
        },
        { status: 400 }
      );
    }

    // Ensure unique application ID
    let appId = generateApplicationId();
    let isUnique = false;
    while (!isUnique) {
      const existingId = await Application.findOne({ applicationId: appId });
      if (!existingId) {
        isUnique = true;
      } else {
        appId = generateApplicationId();
      }
    }
    
    const newApp = new Application({
      ...body,
      applicationId: appId,
      status: 'New'
    });
    
    await newApp.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully',
      data: newApp
    });
  } catch (error: any) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
