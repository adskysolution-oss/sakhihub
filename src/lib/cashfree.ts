import crypto from 'crypto';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = 'production';

const BASE_URL = 'https://api.cashfree.com/pg';

const API_VERSION = '2023-08-01';

interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  returnUrl: string;
  notifyUrl?: string;
}

interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
  order_token?: string;
}

interface CashfreePaymentResponse {
  cf_payment_id: string;
  order_id: string;
  payment_status: string;
  payment_amount: number;
  payment_method?: any;
  payment_time?: string;
}

/**
 * Create a Cashfree payment order
 */
export async function createCashfreeOrder(params: CreateOrderParams): Promise<CashfreeOrderResponse> {
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

  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': API_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Cashfree Create Order Error:', errorData);
    throw new Error(errorData?.message || `Cashfree order creation failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch order status from Cashfree
 */
export async function getCashfreeOrderStatus(orderId: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': API_VERSION,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `Failed to fetch order status`);
  }

  return response.json();
}

/**
 * Fetch payments for a Cashfree order
 */
export async function getCashfreePayments(orderId: string): Promise<CashfreePaymentResponse[]> {
  const response = await fetch(`${BASE_URL}/orders/${orderId}/payments`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': API_VERSION,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `Failed to fetch payments`);
  }

  return response.json();
}

/**
 * Verify Cashfree webhook signature
 */
export function verifyCashfreeWebhook(rawBody: string, timestamp: string, signature: string): boolean {
  if (!CASHFREE_SECRET_KEY) return false;
  const signatureData = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', CASHFREE_SECRET_KEY)
    .update(signatureData)
    .digest('base64');
  return expectedSignature === signature;
}

/**
 * Generate a unique order ID
 */
export function generateOrderId(userId: string, type: 'subscription' | 'deposit'): string {
  const shortId = userId.slice(-8);
  const ts = Date.now().toString(36);
  return `SH_${shortId}_${type.slice(0, 3).toUpperCase()}_${ts}`;
}

/**
 * Check if Cashfree is configured
 */
export function isCashfreeConfigured(): boolean {
  return !!(
    CASHFREE_APP_ID && 
    CASHFREE_SECRET_KEY && 
    !CASHFREE_APP_ID.includes('YOUR_') &&
    !CASHFREE_SECRET_KEY.includes('YOUR_') &&
    !CASHFREE_APP_ID.startsWith('TEST')
  );
}

/**
 * Get the Cashfree checkout JS SDK URL based on environment
 */
export function getCashfreeJsUrl(): string {
  return 'https://sdk.cashfree.com/js/v3/cashfree.js';
}

export { CASHFREE_ENV };
