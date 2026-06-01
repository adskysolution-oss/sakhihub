import crypto from 'crypto';
import { 
  IPaymentProvider, 
  CreateOrderParams, 
  CreateOrderResult, 
  VerifyPaymentParams, 
  VerifyPaymentResult, 
  WebhookVerificationResult 
} from './IPaymentProvider';

export class RazorpayProvider implements IPaymentProvider {
  public readonly name = 'razorpay';
  private keyId: string = '';
  private keySecret: string = '';
  private webhookSecret: string = '';
  private environment: 'sandbox' | 'production' = 'production';

  initialize(credentials: Record<string, any>, environment: 'sandbox' | 'production'): void {
    this.keyId = credentials.keyId || '';
    this.keySecret = credentials.keySecret || '';
    this.webhookSecret = credentials.webhookSecret || '';
    this.environment = environment;
  }

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const body = {
      amount: Math.round(params.orderAmount * 100), // in paise
      currency: 'INR',
      receipt: params.orderId,
      notes: {
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail || '',
      },
    };

    const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`;

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Razorpay Create Order Error:', errorData);
      throw new Error(errorData?.error?.description || `Razorpay order creation failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      gatewayOrderId: data.id,
      paymentSessionId: data.id, // Razorpay checkout uses the order_id as the session identifier
      razorpayKeyId: this.keyId,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`;

    const response = await fetch(`https://api.razorpay.com/v1/orders/${params.gatewayOrderId}/payments`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.description || `Failed to fetch Razorpay payments`);
    }

    const data = await response.json();
    const payments = data.items || [];
    
    // Check if any payment is captured or authorized
    const successfulPayment = payments.find((p: any) => ['captured', 'authorized'].includes(p.status));
    
    if (successfulPayment) {
      return {
        success: true,
        gatewayPaymentId: successfulPayment.id,
        amount: successfulPayment.amount / 100,
        status: 'SUCCESS', // Map to SUCCESS to match other providers
      };
    }

    return {
      success: false,
      status: payments[0]?.status || 'PENDING',
      amount: 0,
    };
  }

  verifyWebhook(rawBody: string, headers: Record<string, string>): WebhookVerificationResult {
    const signature = headers['x-razorpay-signature'];
    
    if (!signature || !this.webhookSecret) {
      return { isValid: false, gatewayOrderId: '' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');
      
    const isValid = expectedSignature === signature;
    
    let gatewayOrderId = '';
    let gatewayPaymentId = '';
    let amount = 0;
    let status = 'FAILED';
    
    if (isValid) {
      try {
        const parsedBody = JSON.parse(rawBody);
        const event = parsedBody.event;
        
        // Success events
        const isSuccessEvent = ['payment.captured', 'order.paid'].includes(event);
        
        const paymentEntity = parsedBody.payload?.payment?.entity;
        const orderEntity = parsedBody.payload?.order?.entity;
        
        gatewayOrderId = paymentEntity?.order_id || orderEntity?.id || '';
        gatewayPaymentId = paymentEntity?.id || '';
        amount = (paymentEntity?.amount || orderEntity?.amount || 0) / 100;
        status = isSuccessEvent ? 'SUCCESS' : 'FAILED';
      } catch (e) {
        console.error('Razorpay Webhook Parse Error', e);
      }
    }

    return {
      isValid,
      gatewayOrderId,
      gatewayPaymentId,
      amount,
      status,
    };
  }

  getClientSdkUrl(): string {
    return 'https://checkout.razorpay.com/v1/checkout.js';
  }
}
