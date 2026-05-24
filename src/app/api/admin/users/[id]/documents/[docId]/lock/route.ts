import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import Document from '@/models/Document';
import VendorAgreement from '@/models/VendorAgreement';
import VendorMOU from '@/models/VendorMOU';
import EmployeeOfferLetter from '@/models/EmployeeOfferLetter';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, docId: string }> }
) {
  try {
    const { id, docId } = await params;
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 401);
    }

    const { isLocked, isApproved, adminRemarks, newStatus } = await req.json();

    await dbConnect();

    // Verify user exists
    const user = await User.findById(id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Try generic Document first
    let doc: any = await Document.findOne({ _id: docId, userId: id });
    let collection = 'Document';

    // Fall back to vendor/employee-specific collections
    if (!doc) {
      doc = await VendorAgreement.findOne({ _id: docId, vendorId: id });
      collection = 'VendorAgreement';
    }
    if (!doc) {
      doc = await VendorMOU.findOne({ _id: docId, vendorId: id });
      collection = 'VendorMOU';
    }
    if (!doc) {
      doc = await EmployeeOfferLetter.findOne({ _id: docId, employeeId: id });
      collection = 'EmployeeOfferLetter';
    }

    if (!doc) {
      return errorResponse('Document not found', 404);
    }

    if (isLocked !== undefined) doc.isLocked = isLocked;
    if (adminRemarks !== undefined) doc.adminRemarks = adminRemarks;

    if (newStatus) {
      // Explicit status from frontend (preferred path)
      doc.status = newStatus;
    } else if (collection === 'Document') {
      // Legacy generic Document model which uses isApproved field
      if (isApproved !== undefined) doc.isApproved = isApproved;
      if (isLocked && isApproved) {
        doc.status = 'approved';
      } else if (!isLocked) {
        doc.status = 'unlocked';
      }
    } else {
      // Infer for VendorAgreement / VendorMOU / EmployeeOfferLetter
      if (isLocked && isApproved) {
        doc.status = 'approved';
      } else if (isLocked && !isApproved) {
        doc.status = 'under_review';
      } else if (!isLocked) {
        doc.status = 'reupload_required';
      }
    }

    await doc.save();

    return successResponse({
      message: `Document ${isLocked ? 'locked' : 'unlocked'} successfully`,
      document: doc
    });

  } catch (error: any) {
    console.error('Lock/Unlock Document Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
