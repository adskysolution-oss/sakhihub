import axios from 'axios';
import crypto from 'crypto';

export class ABDMAuthService {
  private static gatewayToken: string | null = null;
  private static tokenExpiry: number | null = null;

  public static async getGatewayToken(): Promise<string> {
    const now = Date.now();
    if (this.gatewayToken && this.tokenExpiry && now < this.tokenExpiry - 300000) {
      return this.gatewayToken;
    }

    const clientId = process.env.ABDM_CLIENT_ID;
    const clientSecret = process.env.ABDM_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('ABDM credentials (ABDM_CLIENT_ID or ABDM_CLIENT_SECRET) are missing from environment variables.');
    }

    try {
      const response = await axios.post('https://dev.abdm.gov.in/gateway/v0.5/sessions', {
        clientId,
        clientSecret,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data && response.data.accessToken) {
        this.gatewayToken = response.data.accessToken;
        this.tokenExpiry = now + (response.data.expiresIn || 86400) * 1000;
        return this.gatewayToken!;
      } else {
        throw new Error('No access token returned from ABDM sessions endpoint');
      }
    } catch (error: any) {
      console.error('ABDM gateway token generation failed:', error.response?.data || error.message);
      throw new Error(`ABDM auth failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

export class ABDMAbhaService {
  private static cachedCert: string | null = null;

  private static getBaseUrl(): string {
    return 'https://abhasbx.abdm.gov.in/abha/api';
  }

  private static getHeaders(gatewayToken: string) {
    return {
      'Authorization': `Bearer ${gatewayToken}`,
      'Content-Type': 'application/json',
      'X-CM-ID': process.env.ABDM_BRIDGE_ID || 'sbx',
      'REQUEST-ID': crypto.randomUUID(),
      'TIMESTAMP': new Date().toISOString()
    };
  }

  public static async getPublicCertificate(): Promise<string> {
    if (this.cachedCert) return this.cachedCert;
    const gatewayToken = await ABDMAuthService.getGatewayToken();
    try {
      const response = await axios.get(`${this.getBaseUrl()}/v3/profile/public/certificate`, {
        headers: this.getHeaders(gatewayToken)
      });
      let cert = response.data;
      if (typeof cert === 'object' && cert.publicKey) {
        cert = cert.publicKey;
      } else if (typeof cert === 'object' && cert.cert) {
        cert = cert.cert;
      }
      if (typeof cert === 'string') {
        if (!cert.includes('-----BEGIN')) {
          cert = `-----BEGIN PUBLIC KEY-----\n${cert}\n-----END PUBLIC KEY-----`;
        }
        this.cachedCert = cert;
        return cert;
      }
      throw new Error('Invalid cert format from ABDM /v3/profile/public/certificate');
    } catch (error: any) {
      console.error('Failed to get public cert from ABDM:', error.response?.data || error.message);
      const errMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      throw new Error(`ABDM cert retrieval failed: ${errMsg}`);
    }
  }

  public static async encrypt(text: string): Promise<string> {
    const cert = await this.getPublicCertificate();
    try {
      const buffer = Buffer.from(text);
      const encrypted = crypto.publicEncrypt(
        {
          key: cert,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha1'
        },
        buffer
      );
      return encrypted.toString('base64');
    } catch (err: any) {
      console.error('Encryption with cert failed:', err.message);
      throw new Error(`ABDM encryption error: ${err.message}`);
    }
  }

  // --- LINK / VERIFICATION FLOW FOR EXISTING ABHA ---

  public static async initVerification(healthId: string): Promise<string> {
    const gatewayToken = await ABDMAuthService.getGatewayToken();
    const isAddress = healthId.includes('@');
    const loginHint = isAddress ? 'abha-address' : 'abha-number';
    const encryptedHealthId = await this.encrypt(healthId);
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/v3/profile/login/request/otp`,
        {
          scope: ["abha-login", "mobile-verify"],
          loginHint,
          loginId: encryptedHealthId,
          otpSystem: "abdm"
        },
        { headers: this.getHeaders(gatewayToken) }
      );
      return response.data.txnId;
    } catch (error: any) {
      console.error('ABDM auth init failed:', error.response?.data || error.message);
      const errMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      throw new Error(errMsg || 'Failed to initialize ownership verification.');
    }
  }

  public static async confirmVerification(otp: string, txnId: string): Promise<string> {
    const gatewayToken = await ABDMAuthService.getGatewayToken();
    const encryptedOtp = await this.encrypt(otp);
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/v3/profile/login/verify`,
        {
          otp: encryptedOtp,
          txnId
        },
        { headers: this.getHeaders(gatewayToken) }
      );
      return response.data.token; // User-specific token
    } catch (error: any) {
      console.error('ABDM auth confirm failed:', error.response?.data || error.message);
      const errMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      throw new Error(errMsg || 'Aadhaar OTP verification failed.');
    }
  }

  public static async getProfile(userToken: string): Promise<any> {
    const gatewayToken = await ABDMAuthService.getGatewayToken();
    const headers = {
      ...this.getHeaders(gatewayToken),
      'X-Token': `Bearer ${userToken}`,
      'X-token': `Bearer ${userToken}`
    };
    try {
      const response = await axios.get(
        `${this.getBaseUrl()}/v3/profile/account`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('ABDM fetch profile failed:', error.response?.data || error.message);
      const errMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      throw new Error(errMsg || 'Failed to fetch ABHA profile.');
    }
  }

  // --- CREATE NEW ABHA FLOW ---

  public static async generateOtp(aadhaarNumber: string): Promise<string> {
    const gatewayToken = await ABDMAuthService.getGatewayToken();
    const encryptedAadhaar = await this.encrypt(aadhaarNumber);
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/v3/enrollment/request/otp`,
        {
          txnId: "",
          scope: ["abha-enrol"],
          loginHint: "aadhaar",
          loginId: encryptedAadhaar,
          otpSystem: "aadhaar"
        },
        { headers: this.getHeaders(gatewayToken) }
      );
      return response.data.txnId;
    } catch (error: any) {
      console.error('ABDM generate Aadhaar OTP failed:', error.response?.data || error.message);
      const errMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      throw new Error(errMsg || 'Failed to generate Aadhaar OTP.');
    }
  }

  public static async verifyOtp(otp: string, txnId: string, mobile?: string): Promise<any> {
    const gatewayToken = await ABDMAuthService.getGatewayToken();
    const encryptedOtp = await this.encrypt(otp);
    
    const cleanMobile = mobile ? mobile.trim().replace(/\D/g, '') : '9999999999';
    const formattedMobile = cleanMobile.length > 10 ? cleanMobile.slice(-10) : cleanMobile;

    console.log('[ABDM VERIFY DETAILS]');
    console.log('- Raw mobile parameter:', mobile);
    console.log('- cleanMobile:', cleanMobile);
    console.log('- formattedMobile:', formattedMobile);
    console.log('- encryptedOtp (length):', encryptedOtp?.length);
    console.log('- txnId:', txnId);

    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/v3/enrollment/enrol/byAadhaar`,
        {
          scope: ["abha-enrol"],
          authData: {
            authMethods: ["otp"],
            otp: {
              otpValue: encryptedOtp,
              otp: encryptedOtp,
              txnId
            }
          },
          consent: {
            code: "abha-enrollment",
            version: "1.4"
          },
          mobile: formattedMobile
        },
        { headers: this.getHeaders(gatewayToken) }
      );
      return response.data.EnrolProfile;
    } catch (error: any) {
      console.error('ABDM verify Aadhaar OTP failed:', error.response?.data || error.message);
      const errMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      throw new Error(errMsg || 'Failed to verify Aadhaar OTP.');
    }
  }

  public static async createAbha(profile: any): Promise<any> {
    // Pass-through since V3 enrollment completes within verifyOtp (byAadhaar)
    return profile;
  }
}
