import dbConnect from './src/lib/mongodb';
import { PaymentResolver } from './src/lib/payments/PaymentResolver';

async function test() {
  await dbConnect();
  const provider = await PaymentResolver.resolveActiveProvider();
  console.log('Provider Name:', provider.name);
  console.log('Provider Config:', JSON.stringify((provider as any), null, 2));
  
  try {
    const orderResult = await provider.createOrder({
      orderId: 'TEST_' + Date.now(),
      orderAmount: 1,
      customerName: 'Test',
      customerPhone: '9999999999',
      customerEmail: 'test@test.com',
      returnUrl: 'http://localhost:3000/payment-pending',
      notifyUrl: 'http://localhost:3000/api/payment/webhook'
    });
    console.log('Order Result:', JSON.stringify(orderResult, null, 2));
  } catch (error: any) {
    console.error('Order Error:', error.message);
  }
  process.exit(0);
}

test();
