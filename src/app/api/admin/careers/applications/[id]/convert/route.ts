import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';

function generateEmployeeId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'EMP';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    
    const application = await Application.findById(id);
    if (!application) return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    
    if (application.convertedUserId) {
      return NextResponse.json({ success: false, message: 'Candidate already converted' }, { status: 400 });
    }
    
    // Check if user with mobile already exists
    const existingUser = await User.findOne({ mobile: application.mobile });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'A user with this mobile number already exists' }, { status: 400 });
    }

    const newEmployee = new User({
      fullName: application.fullName,
      mobile: application.mobile,
      email: application.email,
      role: 'employee',
      employeeId: generateEmployeeId(),
      status: 'pending',
      assignmentStatus: 'pending',
      referralSource: 'direct',
      state: application.state,
      district: application.district,
      block: application.block,
      qualification: application.qualification,
      experience: application.experience,
      isVerified: false,
      onboardingCompleted: false,
      documentsVerified: false,
      dashboardAccess: false,
      documents: {
        resume: {
          url: application.resumeUrl,
          status: 'approved',
          uploadedAt: new Date()
        },
        aadhaarCard: {
          url: application.aadhaarUrl,
          status: 'approved',
          uploadedAt: new Date()
        },
        passportPhoto: {
          url: application.photoUrl,
          status: 'approved',
          uploadedAt: new Date()
        }
      }
    });

    await newEmployee.save();

    application.convertedUserId = newEmployee._id;
    application.status = 'Selected';
    await application.save();

    return NextResponse.json({ success: true, data: newEmployee, message: 'Candidate successfully converted to Employee' });
  } catch (error: any) {
    console.error('Error converting candidate:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
