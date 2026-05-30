import crypto from 'crypto';
import { 
  IPaymentProvider, 
  CreateOrderParams, 
  CreateOrderResult, 
  VerifyPaymentParams, 
  VerifyPaymentResult, 
  WebhookVerificationResult 
} from './IPaymentProvider';

export class PhonePeProvider implements IPaymentProvider {
  public readonly name = 'phonepe';
  private merchantId: string = '';
  private clientId: string = '';
  private clientSecret: string = '';
  private clientVersion: string = '1';
  private webhookSecret: string = '';
  private environment: 'sandbox' | 'production' = 'production';
  private baseUrl: string = '';

  initialize(credentials: Record<string, any>, environment: 'sandbox' | 'production'): void {
    this.merchantId = credentials.merchantId || '';
    this.clientId = credentials.clientId || '';
    this.clientSecret = credentials.clientSecret || '';
    this.clientVersion = credentials.clientVersion || '1';
    this.webhookSecret = credentials.webhookSecret || '';
    this.environment = environment;
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.phonepe.com/apis/hermes' 
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  }

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const payload = {
      merchantId: this.merchantId,
      merchantTransactionId: params.orderId,
      merchantUserId: params.orderId.split('_')[1] || params.orderId,
      amount: params.orderAmount * 100, // PhonePe expects amount in paise
      redirectUrl: params.returnUrl,
      redirectMode: 'POST',
      callbackUrl: params.notifyUrl,
      mobileNumber: params.customerPhone,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const endpoint = '/pg/v1/pay';
    
    // Checksum = sha256(base64Payload + apiEndpoint + saltKey) + ### + saltIndex
    // Here we assume clientSecret is the saltKey and clientVersion is the saltIndex
    const checksum = crypto
      .createHash('sha256')
      .update(base64Payload + endpoint + this.clientSecret)
      .digest('hex') + '###' + this.clientVersion;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-CLIENT-ID': this.clientId, // Some PhonePe integrations need this
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      console.error('PhonePe Create Order Error:', data);
      throw new Error(data?.message || `PhonePe order creation failed`);
    }

    return {
      gatewayOrderId: params.orderId, // PhonePe uses the merchantTransactionId
      paymentSessionId: data.data?.instrumentResponse?.intentUrl || '',
      paymentUrl: data.data?.instrumentResponse?.redirectInfo?.url, // Standard checkout URL
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const endpoint = `/pg/v1/status/${this.merchantId}/${params.gatewayOrderId}`;
    
    const checksum = crypto
      .createHash('sha256')
      .update(endpoint + this.clientSecret)
      .digest('hex') + '###' + this.clientVersion;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': this.merchantId,
        'X-CLIENT-ID': this.clientId,
      },
    });

    const data = await response.json();

    if (data.success && data.code === 'PAYMENT_SUCCESS') {
      return {
        success: true,
        gatewayPaymentId: data.data?.transactionId,
        amount: (data.data?.amount || 0) / 100,
        status: data.code,
      };
    }

    return {
      success: false,
      status: data.code || 'PENDING',
      amount: 0,
    };
  }

  verifyWebhook(rawBody: string, headers: Record<string, string>): WebhookVerificationResult {
    // PhonePe sends X-VERIFY header: sha256(base64Payload + webhookSecret) + ### + saltIndex
    const signature = headers['x-verify'] || headers['X-VERIFY'];
    
    if (!signature || !this.clientSecret) { // Fallback to clientSecret if webhookSecret not set
      return { isValid: false, gatewayOrderId: '' };
    }

    const secretToUse = this.webhookSecret || this.clientSecret;
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (e) {
      return { isValid: false, gatewayOrderId: '' };
    }

    const base64Payload = parsedBody.response; // PhonePe webhook sends { response: "base64..." }
    if (!base64Payload) return { isValid: false, gatewayOrderId: '' };

    const expectedChecksum = crypto
      .createHash('sha256')
      .update(base64Payload + secretToUse)
      .digest('hex') + '###' + this.clientVersion;

    const isValid = expectedChecksum === signature;
    
    let gatewayOrderId = '';
    let amount = 0;
    let status = '';
    
    if (isValid) {
      try {
        const decodedStr = Buffer.from(base64Payload, 'base64').toString('utf-8');
        const decoded = JSON.parse(decodedStr);
        gatewayOrderId = decoded.data?.merchantTransactionId || '';
        amount = (decoded.data?.amount || 0) / 100;
        status = decoded.code || '';
      } catch (e) {
        console.error('PhonePe Webhook Decode Error', e);
      }
    }

    return {
      isValid,
      gatewayOrderId,
      amount,
      status,
    };
  }

  getClientSdkUrl(): string {
    return ''; // PhonePe doesn't require a JS SDK like Cashfree
  }
}
