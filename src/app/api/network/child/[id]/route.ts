import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import Campaign from '@/models/Campaign';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

// Helper to sanitize documents and remove sensitive fields
function sanitizeDocuments(docs: any) {
  if (!docs) return undefined;
  const sanitized: any = {};
  for (const key in docs) {
    if (docs[key]) {
      sanitized[key] = {
        status: docs[key].status,
        remarks: docs[key].remarks,
        exceptionReason: docs[key].exceptionReason,
        exceptionAdminRemarks: docs[key].exceptionAdminRemarks,
        uploadedAt: docs[key].uploadedAt,
      };
    }
  }
  return sanitized;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session || !['vendor', 'sub_vendor'].includes((session as any).role)) {
      return errorResponse('Unauthorized', 403);
    }

    const { id: childId } = await context.params;
    await dbConnect();
    
    // Explicitly reference models to ensure they are registered for populate()
    const _Campaign = Campaign;
    const _User = User;
    const _WomenMember = WomenMember;
    const _Group = Group;

    const currentUserId = (session as any).id;
    const currentUserRole = (session as any).role;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) return errorResponse('Current user not found', 404);

    // 1. Try to find if the child is a User (sub_vendor or employee)
    let childUser = await User.findById(childId).populate('assignedCampaigns', 'title');
    let childMember = null;
    let isAuthorized = false;

    if (childUser) {
      if (currentUserRole === 'vendor') {
        // Vendor can see sub_vendors and employees
        if (childUser.parentVendorId?.toString() === currentUserId) {
          isAuthorized = true; // Direct child
        } else if (childUser.role === 'employee') {
          // Could be employee of a sub-vendor under this vendor
          const subVendor = await User.findById(childUser.parentVendorId);
          if (subVendor && subVendor.parentVendorId?.toString() === currentUserId) {
            isAuthorized = true;
          }
        }
      } else if (currentUserRole === 'sub_vendor') {
        // Sub-vendor can see employees
        if (childUser.parentVendorId?.toString() === currentUserId && childUser.role === 'employee') {
          isAuthorized = true;
        }
      }
    } else {
      // 2. If not a User, try WomenMember
      childMember = await WomenMember.findById(childId)
        .populate('assignedEmployeeId', 'fullName')
        .populate('campaignId', 'title')
        .populate('groupId', 'groupName');

      if (childMember) {
        if (currentUserRole === 'vendor') {
          // Vendor can see members assigned to them directly, to their subvendors, or to their employees
          if (childMember.vendorCode === currentUser.vendorCode || childMember.createdBy.toString() === currentUserId) {
            isAuthorized = true;
          } else if (childMember.subVendorCode) {
            // Check if this subVendorCode belongs to a sub-vendor under this vendor
            const sv = await User.findOne({ subVendorCode: childMember.subVendorCode, parentVendorId: currentUserId });
            if (sv) isAuthorized = true;
          } else if (childMember.assignedEmployeeId) {
            // Check if employee belongs to this vendor or a sub-vendor under this vendor
            const emp = await User.findById(childMember.assignedEmployeeId._id);
            if (emp) {
              if (emp.parentVendorId?.toString() === currentUserId) {
                isAuthorized = true;
              } else {
                const sv = await User.findById(emp.parentVendorId);
                if (sv && sv.parentVendorId?.toString() === currentUserId) isAuthorized = true;
              }
            }
          }
        } else if (currentUserRole === 'sub_vendor') {
          if (childMember.subVendorCode === currentUser.subVendorCode || childMember.createdBy.toString() === currentUserId) {
            isAuthorized = true;
          } else if (childMember.assignedEmployeeId) {
            const emp = await User.findById(childMember.assignedEmployeeId._id);
            if (emp && emp.parentVendorId?.toString() === currentUserId) {
              isAuthorized = true;
            }
          }
        }
      }
    }

    if (!isAuthorized) {
      return errorResponse('You do not have permission to view this profile.', 403);
    }

    if (childUser) {
      // Strip sensitive data
      const safeUser = {
        _id: childUser._id,
        fullName: childUser.fullName,
        mobile: childUser.mobile,
        email: childUser.email,
        role: childUser.role,
        vendorCode: childUser.vendorCode,
        subVendorCode: childUser.subVendorCode,
        employeeId: childUser.employeeId,
        status: childUser.status,
        state: childUser.state,
        district: childUser.district,
        block: childUser.block,
        village: childUser.village,
        pincode: childUser.pincode,
        vendorType: childUser.vendorType,
        joiningDate: childUser.joiningDate || childUser.createdAt,
        assignedCampaigns: childUser.assignedCampaigns,
        documents: sanitizeDocuments(childUser.documents?.toObject ? childUser.documents.toObject() : childUser.documents),
        // Verification booleans are safe
        isVerified: childUser.isVerified,
        onboardingCompleted: childUser.onboardingCompleted,
        documentsVerified: childUser.documentsVerified,
      };
      return successResponse({ type: 'user', data: safeUser });
    }

    if (childMember) {
      let memberDocs = undefined;
      let memberEmail = childMember.email;
      
      if (childMember.userId) {
        const memberUser = await User.findById(childMember.userId).select('documents email');
        if (memberUser) {
          memberDocs = sanitizeDocuments(memberUser.documents?.toObject ? memberUser.documents.toObject() : memberUser.documents);
          if (!memberEmail) memberEmail = memberUser.email;
        }
      }

      const safeMember = {
        _id: childMember._id,
        name: childMember.name,
        mobile: childMember.mobile,
        email: memberEmail,
        age: childMember.age,
        village: childMember.village,
        district: childMember.district,
        block: childMember.block,
        state: childMember.state,
        pincode: childMember.pincode,
        maritalStatus: childMember.maritalStatus,
        occupation: childMember.occupation,
        accountStatus: childMember.accountStatus,
        connectionStatus: childMember.connectionStatus,
        membershipStatus: childMember.membershipStatus,
        campaignId: childMember.campaignId,
        assignedEmployee: childMember.assignedEmployeeId,
        assignedGroup: childMember.groupId,
        vendorCode: childMember.vendorCode,
        subVendorCode: childMember.subVendorCode,
        documents: memberDocs,
        role: 'member', // Pass role to UI for doc checking
        createdAt: childMember.createdAt,
      };
      return successResponse({ type: 'member', data: safeMember });
    }

    return errorResponse('Record not found', 404);
  } catch (error: any) {
    console.error('Child Profile Fetch Error:', error);
    return errorResponse(error.message, 500);
  }
}
