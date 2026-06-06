import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    // Get this vendor's details
    const vendor = await User.findById((session as any).id);
    if (!vendor) return errorResponse('Vendor not found', 404);

    // 1. Fetch sub-vendors under this vendor
    const subVendors = await User.find({ 
      parentVendorId: vendor._id, 
      role: 'sub_vendor'
    }).select('_id');

    const subVendorIds = subVendors.map(sv => sv._id);

    // 2. Fetch all employees under this vendor directly OR under their sub-vendors
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const query: any = { 
      role: 'employee',
      $or: [
        { parentVendorId: vendor._id },
        { parentVendorId: { $in: subVendorIds } }
      ]
    };

    if (search) {
      query.$and = [
        {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
            { employeeId: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const employees = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 });

    return successResponse(employees);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
