import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, this might fetch from a database or a config file
    // For now, we return the default static membership configuration
    const config = {
      title: 'Premium Member',
      feeAmount: 200,
      benefitLabel: '1 Year Sanitary Pads Free',
      features: [
        'Full Platform Access',
        'Premium ID Card',
        '1 Year Sanitary Pads Free'
      ]
    };

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error("Error fetching membership config:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to load membership config' },
      { status: 500 }
    );
  }
}
