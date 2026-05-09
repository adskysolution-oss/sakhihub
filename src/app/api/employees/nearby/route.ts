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

    if (!pincode && !district && !block) {
      return errorResponse('Pincode, district or block is required for search', 400);
    }

    // Build query
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
