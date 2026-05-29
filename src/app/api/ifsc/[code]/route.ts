import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code || code.length !== 11) {
      return NextResponse.json({ error: 'Invalid IFSC code. Must be 11 characters.' }, { status: 400 });
    }

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await axios.get(`https://ifsc.razorpay.com/${code}`, { httpsAgent });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('IFSC Proxy API Error:', error?.message);
    const status = error?.response?.status || 500;
    const message = error?.response?.data || 'Failed to fetch IFSC data';
    return NextResponse.json({ error: message }, { status });
  }
}
