import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode');
    const district = searchParams.get('district');
    const block = searchParams.get('block');
    const employeeCode = searchParams.get('employeeCode');

    if (!pincode && !district && !block && !employeeCode) {
      return errorResponse('Pincode, district, block or Employee Code is required for search', 400);
    }

    // Handle Inviter Code Resolution
    if (employeeCode) {
      const code = employeeCode.trim().toUpperCase();
      let queryKey = 'employeeId';
      let searchRole = 'employee';
      if (code.startsWith('SVN') || code.startsWith('SHSVN')) {
        queryKey = 'subVendorCode';
        searchRole = 'sub_vendor';
      } else if (code.startsWith('VND') || code.startsWith('SHVND')) {
        queryKey = 'vendorCode';
        searchRole = 'vendor';
      }

      const inviter = await User.findOne({
        [queryKey]: { $regex: new RegExp(`^${code}$`, 'i') },
        role: searchRole,
        status: 'active'
      }).select('fullName employeeId vendorCode subVendorCode role area block district status pincode');

      return successResponse(inviter, 'Inviter resolved successfully');
    }

    // Build query for pincode nearby discovery
    const query: any = {
      role: 'employee',
      status: 'active'
    };

    if (pincode) {
      query.$or = [
        { pincode },
        { district },
        { block }
      ];
    } else if (district) {
      query.district = district;
    } else if (block) {
      query.block = block;
    }

    const employees = await User.find(query).select('fullName employeeId area block district status pincode');

    return successResponse(employees, 'Nearby employees fetched successfully');
  } catch (error: any) {
    console.error('Nearby Employees API Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
