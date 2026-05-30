import { IPaymentProvider } from './IPaymentProvider';
import { CashfreeProvider } from './CashfreeProvider';
import { PhonePeProvider } from './PhonePeProvider';
import PaymentConfig from '@/models/PaymentConfig';
import { decrypt } from '@/lib/encryption';

export class PaymentResolver {
  static getProviderInstance(providerName: string): IPaymentProvider {
    switch (providerName.toLowerCase()) {
      case 'cashfree':
        return new CashfreeProvider();
      case 'phonepe':
        return new PhonePeProvider();
      default:
        throw new Error(`Unsupported payment provider: ${providerName}`);
    }
  }

  /**
   * Resolves the active provider based on DB configuration
   * Returns initialized provider instance.
   */
  static async resolveActiveProvider(): Promise<IPaymentProvider> {
    const config = await PaymentConfig.findOne({ key: 'default' }).lean();
    if (!config) {
      // Fallback to Cashfree if no config is present
      const provider = new CashfreeProvider();
      provider.initialize({
        appId: process.env.CASHFREE_APP_ID,
        secretKey: process.env.CASHFREE_SECRET_KEY,
      }, 'production');
      return provider;
    }

    const providerName = config.activeProvider || 'cashfree';
    const environment = config.environment || 'production';
    
    // Get credentials for this provider
    let credentials = config.providers?.[providerName] || {};
    
    // Decrypt credentials
    if (providerName === 'cashfree' && credentials.secretKey) {
      credentials = { ...credentials, secretKey: decrypt(credentials.secretKey) };
    } else if (providerName === 'phonepe') {
      credentials = {
        ...credentials,
        clientSecret: credentials.clientSecret ? decrypt(credentials.clientSecret) : undefined,
        webhookSecret: credentials.webhookSecret ? decrypt(credentials.webhookSecret) : undefined,
      };
    }
    
    const provider = this.getProviderInstance(providerName);
    provider.initialize(credentials, environment as 'sandbox' | 'production');
    
    return provider;
  }

  /**
   * Initializes a specific provider with its stored configuration
   * Used for webhooks and verifications where the transaction specifies the provider
   */
  static async resolveProviderByName(providerName: string): Promise<IPaymentProvider> {
    const config = await PaymentConfig.findOne({ key: 'default' }).lean();
    const environment = config?.environment || 'production';
    let credentials = config?.providers?.[providerName] || {};
    
    if (providerName === 'cashfree' && credentials.secretKey) {
      credentials = { ...credentials, secretKey: decrypt(credentials.secretKey) };
    } else if (providerName === 'phonepe') {
      credentials = {
        ...credentials,
        clientSecret: credentials.clientSecret ? decrypt(credentials.clientSecret) : undefined,
        webhookSecret: credentials.webhookSecret ? decrypt(credentials.webhookSecret) : undefined,
      };
    }
    
    const provider = this.getProviderInstance(providerName);
    provider.initialize(credentials, environment as 'sandbox' | 'production');
    
    return provider;
  }
}
