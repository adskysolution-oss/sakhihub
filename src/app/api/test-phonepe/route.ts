import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PaymentResolver } from '@/lib/payments/PaymentResolver';
import PaymentConfig from '@/models/PaymentConfig';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const config = await PaymentConfig.findOne({ key: 'default' }).lean();
    
    const provider = await PaymentResolver.resolveActiveProvider();
    
    return NextResponse.json({
      success: true,
      config: config,
      providerName: provider.name,
      providerInstance: provider, // this will serialize the class instance properties
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
