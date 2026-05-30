import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import PaymentConfig from '@/models/PaymentConfig';
import AuditLog from '@/models/AuditLog';
import { isCashfreeConfigured } from '@/lib/cashfree';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();

    let config = await PaymentConfig.findOne({ key: 'default' });
    if (!config) {
      config = await PaymentConfig.create({
        key: 'default',
        subscriptionAmount: { vendor: 5000, sub_vendor: 3000, employee: 1000 },
        depositAmount: { vendor: 10000, sub_vendor: 5000, employee: 2000 },
        paymentRequired: { vendor: true, sub_vendor: true, employee: true },
        subscriptionRequired: { vendor: true, sub_vendor: true, employee: true },
        depositRequired: { vendor: true, sub_vendor: true, employee: true },
      });
    }

    return successResponse({
      ...config.toObject(),
      // Send decrypted keys if they exist, otherwise empty
      providers: {
        cashfree: {
          appId: config.providers?.cashfree?.appId,
          secretKey: decrypt(config.providers?.cashfree?.secretKey || ''),
          linkUrls: config.providers?.cashfree?.linkUrls,
        },
        phonepe: {
          merchantId: config.providers?.phonepe?.merchantId,
          clientId: config.providers?.phonepe?.clientId,
          clientSecret: decrypt(config.providers?.phonepe?.clientSecret || ''),
          clientVersion: config.providers?.phonepe?.clientVersion,
          webhookSecret: decrypt(config.providers?.phonepe?.webhookSecret || ''),
          linkUrls: config.providers?.phonepe?.linkUrls,
        }
      },
      isConfigured: isCashfreeConfigured()
    }, 'Payment configuration retrieved');
  } catch (error: any) {
    console.error('Get Payment Config Error:', error);
    return errorResponse(error.message || 'Failed to fetch config', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const body = await req.json();

    const updateData: any = { updatedBy: (session as any).id };

    // Validate and set amounts
    if (body.subscriptionAmount) {
      const sa = body.subscriptionAmount;
      updateData.subscriptionAmount = {
        vendor: Math.max(0, Number(sa.vendor) || 0),
        sub_vendor: Math.max(0, Number(sa.sub_vendor) || 0),
        employee: Math.max(0, Number(sa.employee) || 0),
      };
    }

    if (body.depositAmount) {
      const da = body.depositAmount;
      updateData.depositAmount = {
        vendor: Math.max(0, Number(da.vendor) || 0),
        sub_vendor: Math.max(0, Number(da.sub_vendor) || 0),
        employee: Math.max(0, Number(da.employee) || 0),
      };
    }

    if (body.paymentRequired) {
      updateData.paymentRequired = {
        vendor: !!body.paymentRequired.vendor,
        sub_vendor: !!body.paymentRequired.sub_vendor,
        employee: !!body.paymentRequired.employee,
      };
    }

    if (body.subscriptionRequired) {
      updateData.subscriptionRequired = {
        vendor: !!body.subscriptionRequired.vendor,
        sub_vendor: !!body.subscriptionRequired.sub_vendor,
        employee: !!body.subscriptionRequired.employee,
      };
    }

    if (body.depositRequired) {
      updateData.depositRequired = {
        vendor: !!body.depositRequired.vendor,
        sub_vendor: !!body.depositRequired.sub_vendor,
        employee: !!body.depositRequired.employee,
      };
    }

    // ── Role-wise payment request URLs (used when gateway is OFF) ──────────
    if (body.paymentRequestUrls && typeof body.paymentRequestUrls === 'object') {
      updateData.paymentRequestUrls = body.paymentRequestUrls;
    }

    if (body.paymentMethod) updateData.paymentMethod = body.paymentMethod;
    if (body.activeProvider) updateData.activeProvider = body.activeProvider;
    if (body.environment) updateData.environment = body.environment;

    if (body.providers) {
      updateData.providers = body.providers;
      
      // Encrypt sensitive fields
      if (updateData.providers.cashfree?.secretKey) {
        updateData.providers.cashfree.secretKey = encrypt(updateData.providers.cashfree.secretKey);
      }
      if (updateData.providers.phonepe?.clientSecret) {
        updateData.providers.phonepe.clientSecret = encrypt(updateData.providers.phonepe.clientSecret);
      }
      if (updateData.providers.phonepe?.webhookSecret) {
        updateData.providers.phonepe.webhookSecret = encrypt(updateData.providers.phonepe.webhookSecret);
      }
    }

    let config = await PaymentConfig.findOne({ key: 'default' });
    if (!config) {
      config = new PaymentConfig({ key: 'default' });
    }

    config.set(updateData);
    await config.save();

    await AuditLog.create({
      action: 'PAYMENT_CONFIG_UPDATED',
      details: {
        paymentMethod: updateData.paymentMethod,
        activeProvider: updateData.activeProvider,
        environment: updateData.environment,
      },
      performedBy: (session as any).id,
    });

    return successResponse(config, 'Payment configuration updated');
  } catch (error: any) {
    console.error('Update Payment Config Error:', error);
    return errorResponse(error.message || 'Failed to update config', 500);
  }
}
