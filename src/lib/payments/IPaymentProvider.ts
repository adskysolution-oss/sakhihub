export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  returnUrl: string;
  notifyUrl?: string;
}

export interface CreateOrderResult {
  gatewayOrderId: string;
  paymentSessionId: string;
  orderToken?: string;
  paymentUrl?: string; // Some providers return a direct URL
}

export interface VerifyPaymentParams {
  gatewayOrderId: string;
  gatewayPaymentId?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  gatewayPaymentId?: string;
  amount: number;
  status: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  amount?: number;
  status?: string;
}

export interface IPaymentProvider {
  /**
   * The provider identifier (e.g., 'cashfree', 'phonepe')
   */
  readonly name: string;

  /**
   * Initialize provider with credentials
   */
  initialize(credentials: Record<string, any>, environment: 'sandbox' | 'production'): void;

  /**
   * Create an order on the payment gateway
   */
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;

  /**
   * Verify payment status directly with the gateway
   */
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;

  /**
   * Verify the authenticity of an incoming webhook
   */
  verifyWebhook(rawBody: string, headers: Record<string, string>): WebhookVerificationResult;

  /**
   * Get the client-side SDK URL if applicable
   */
  getClientSdkUrl?(): string;
}
