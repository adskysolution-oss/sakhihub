import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/response';
import axios from 'axios';
import https from 'https';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code || code.length !== 6) {
      return errorResponse('Invalid pincode. Must be 6 digits.', 400);
    }

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    const response = await axios.get(`https://api.postalpincode.in/pincode/${code}`, { httpsAgent });
    const data = response.data;

    if (!data || data[0].Status === 'Error' || !data[0].PostOffice) {
      return errorResponse('Pincode not found', 404);
    }

    const postOffice = data[0].PostOffice[0];
    
    const result = {
      pincode: code,
      district: postOffice.District,
      state: postOffice.State,
      block: postOffice.Block,
      area: data[0].PostOffice.map((po: any) => po.Name), // List of all areas under this pincode
    };

    return successResponse(result, 'Pincode data fetched successfully');
  } catch (error: any) {
    console.error('Pincode API Error:', error);
    return errorResponse('Failed to fetch pincode data', 500);
  }
}
