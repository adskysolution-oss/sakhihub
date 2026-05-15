import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SupportRequest from '@/models/SupportRequest';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { name, email, subject, message, userRole, submittedBy } = body;
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const request = await SupportRequest.create({
      name,
      email,
      subject,
      message,
      userRole: userRole || 'Guest',
      submittedBy,
      status: 'new'
    });

    return NextResponse.json({ success: true, data: request }, { status: 201 });
  } catch (error: any) {
    console.error('Support Request Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
