import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

// GET all employees with filtering
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const district = searchParams.get('district');
    const search = searchParams.get('search');
    const vendorCode = searchParams.get('vendorCode');
    const subVendorCode = searchParams.get('subVendorCode');

    const query: any = { role: 'employee' };
    if (status && status !== 'all') query.status = status;
    if (district && district !== 'all') query.district = district;
    if (vendorCode) query.vendorCode = vendorCode;
    if (subVendorCode) query.subVendorCode = subVendorCode;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await User.find(query).sort({ createdAt: -1 }).select('-password').lean();

    const EmployeeOfferLetter = (await import('@/models/EmployeeOfferLetter')).default;
    const employeeIds = employees.map((emp: any) => emp._id);
    const offerLetters = await EmployeeOfferLetter.find({ employeeId: { $in: employeeIds } }).lean();
    
    const offerLetterMap = offerLetters.reduce((acc: any, ol: any) => {
      acc[ol.employeeId.toString()] = ol;
      return acc;
    }, {});

    const enrichedEmployees = employees.map((emp: any) => ({
      ...emp,
      offerLetterDetails: offerLetterMap[emp._id.toString()] || null,
      appointmentDetails: offerLetterMap[emp._id.toString()] || null // Fallback for some views that still use appointmentDetails for both
    }));

    return successResponse(enrichedEmployees);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
