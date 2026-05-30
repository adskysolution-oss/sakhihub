import crypto from 'crypto';
import { 
  IPaymentProvider, 
  CreateOrderParams, 
  CreateOrderResult, 
  VerifyPaymentParams, 
  VerifyPaymentResult, 
  WebhookVerificationResult 
} from './IPaymentProvider';

const API_VERSION = '2023-08-01';

export class CashfreeProvider implements IPaymentProvider {
  public readonly name = 'cashfree';
  private appId: string = '';
  private secretKey: string = '';
  private environment: 'sandbox' | 'production' = 'production';
  private baseUrl: string = '';

  initialize(credentials: Record<string, any>, environment: 'sandbox' | 'production'): void {
    this.appId = credentials.appId || process.env.CASHFREE_APP_ID || '';
    this.secretKey = credentials.secretKey || process.env.CASHFREE_SECRET_KEY || '';
    this.environment = environment;
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';
  }

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const body = {
      order_id: params.orderId,
      order_amount: params.orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: params.orderId.split('_')[1] || params.orderId,
        customer_name: params.customerName,
        customer_phone: params.customerPhone,
        customer_email: params.customerEmail || `${params.customerPhone}@sakhihub.com`,
      },
      order_meta: {
        return_url: params.returnUrl,
        notify_url: params.notifyUrl || '',
      },
    };

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
        'x-api-version': API_VERSION,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cashfree Create Order Error:', errorData);
      throw new Error(errorData?.message || `Cashfree order creation failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      gatewayOrderId: data.cf_order_id || data.order_id,
      paymentSessionId: data.payment_session_id,
      orderToken: data.order_token,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    // Note: To be fully accurate, we should hit the `/orders/{orderId}/payments` 
    // endpoint or `/orders/{orderId}` to get the final status.
    const response = await fetch(`${this.baseUrl}/orders/${params.gatewayOrderId}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
        'x-api-version': API_VERSION,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || `Failed to fetch Cashfree payments`);
    }

    const payments = await response.json();
    // Assuming payments is an array of payment objects
    const successfulPayment = Array.isArray(payments) ? payments.find((p: any) => p.payment_status === 'SUCCESS') : null;
    
    if (successfulPayment) {
      return {
        success: true,
        gatewayPaymentId: successfulPayment.cf_payment_id,
        amount: successfulPayment.payment_amount,
        status: successfulPayment.payment_status,
      };
    }

    return {
      success: false,
      status: payments[0]?.payment_status || 'PENDING',
      amount: 0,
    };
  }

  verifyWebhook(rawBody: string, headers: Record<string, string>): WebhookVerificationResult {
    const signature = headers['x-webhook-signature'];
    const timestamp = headers['x-webhook-timestamp'];
    
    if (!signature || !timestamp || !this.secretKey) {
      return { isValid: false, gatewayOrderId: '' };
    }

    const signatureData = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureData)
      .digest('base64');
      
    const isValid = expectedSignature === signature;
    
    let gatewayOrderId = '';
    let amount = 0;
    let status = '';
    
    try {
      const parsedBody = JSON.parse(rawBody);
      gatewayOrderId = parsedBody.data?.order?.order_id || '';
      amount = parsedBody.data?.payment?.payment_amount || 0;
      status = parsedBody.data?.payment?.payment_status || '';
    } catch (e) {
      // JSON parse error
    }

    return {
      isValid,
      gatewayOrderId,
      amount,
      status,
    };
  }

  getClientSdkUrl(): string {
    return this.environment === 'production' 
      ? 'https://sdk.cashfree.com/js/v3/cashfree.js'
      : 'https://sdk.cashfree.com/js/v3/cashfree.js'; // Cashfree uses same URL for v3
  }
}
