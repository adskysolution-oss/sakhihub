import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import CommissionConfig from '@/models/CommissionConfig';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    await dbConnect();
    
    let config = await CommissionConfig.findOne({ key: 'default' });
    if (!config) {
      config = await CommissionConfig.create({ key: 'default' });
    }

    return successResponse(config, 'Commission configuration retrieved successfully');
  } catch (error: any) {
    console.error('Commission Config GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch commission config', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    await dbConnect();
    const body = await req.json();
    const { 
      subscriptionCommission, 
      depositCommission, 
      memberCommission, 
      payoutRules,
      membershipFee,
      membershipPaymentEnabled
    } = body;

    let config = await CommissionConfig.findOne({ key: 'default' });
    if (!config) {
      config = new CommissionConfig({ key: 'default' });
    }

    if (subscriptionCommission) {
      config.subscriptionCommission = {
        vendorPct: Number(subscriptionCommission.vendorPct),
        subVendorPct: Number(subscriptionCommission.subVendorPct),
        employeePct: Number(subscriptionCommission.employeePct),
      };
    }

    if (depositCommission) {
      config.depositCommission = {
        vendorPct: Number(depositCommission.vendorPct),
        subVendorPct: Number(depositCommission.subVendorPct),
        employeePct: Number(depositCommission.employeePct),
      };
    }

    if (memberCommission) {
      config.memberCommission = {
        employeeRecruiter: Number(memberCommission.employeeRecruiter),
        subVendorRecruiter: Number(memberCommission.subVendorRecruiter),
        vendorRecruiter: Number(memberCommission.vendorRecruiter),
        subVendorParent: Number(memberCommission.subVendorParent),
        vendorParentDirect: Number(memberCommission.vendorParentDirect),
        vendorGrandparent: Number(memberCommission.vendorGrandparent),
      };
    }

    if (payoutRules) {
      config.payoutRules = {
        minWithdrawalAmount: Number(payoutRules.minWithdrawalAmount),
        allowAutoSettle: Boolean(payoutRules.allowAutoSettle),
      };
    }

    if (membershipFee !== undefined) {
      config.membershipFee = Number(membershipFee);
    }

    if (membershipPaymentEnabled !== undefined) {
      config.membershipPaymentEnabled = Boolean(membershipPaymentEnabled);
    }

    config.updatedBy = (session as any).id;
    await config.save();

    return successResponse(config, 'Commission configuration updated successfully');
  } catch (error: any) {
    console.error('Commission Config POST Error:', error);
    return errorResponse(error.message || 'Failed to update commission config', 500);
  }
}
