import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import Campaign from '@/models/Campaign';
import Document from '@/models/Document';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    // Explicitly reference models to ensure they are registered for populate()
    const _Campaign = Campaign; 

    // 1. Fetch User Profile with populated parent/campaign
    const user = await User.findById(id)
      .populate('parentVendorId', 'fullName vendorCode role')
      .populate('campaignId', 'title campaignCode')
      .populate('assignedCampaigns', 'title campaignCode')
      .select('-password');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const userId = user._id;
    const role = user.role;
    const vendorCode = user.vendorCode;
    const subVendorCode = user.subVendorCode;
    const employeeId = user.employeeId || user._id.toString();

    // 2. Aggregate Data based on Role
    let subVendors: any[] = [];
    let employees: any[] = [];
    let members: any[] = [];
    let groups: any[] = [];
    
    const counts: any = {
      subVendors: 0,
      employees: 0,
      members: 0,
      paidMembers: 0,
      freeMembers: 0,
      groups: 0,
      campaigns: user.assignedCampaigns?.length || 0,
      pendingApprovals: 0
    };

    if (role === 'vendor') {
      // Find Sub-Vendors
      subVendors = await User.find({ parentVendorId: userId, role: 'sub_vendor' }).select('fullName subVendorCode status district block');
      counts.subVendors = subVendors.length;
      const subVendorIds = subVendors.map(sv => sv._id);

      // Find Employees (Direct under Vendor OR under its Sub-Vendors)
      employees = await User.find({ 
        role: 'employee',
        $or: [
          { parentVendorId: userId },
          { parentVendorId: { $in: subVendorIds } }
        ]
      }).select('fullName employeeId status designation district block');
      counts.employees = employees.length;

      // Find Members
      members = await WomenMember.find({ 
        $or: [
          { vendorCode: vendorCode },
          { subVendorCode: { $in: subVendors.map(sv => sv.subVendorCode) } }
        ]
      }).select('name mobile village status membershipStatus connectionStatus assignedEmployeeId');
      counts.members = members.length;
      counts.paidMembers = members.filter((m: any) => m.membershipStatus === 'paid').length;
      counts.freeMembers = members.filter((m: any) => m.membershipStatus === 'free').length;

      // Find Groups
      groups = await Group.find({ 
        $or: [
          { vendorCode: vendorCode },
          { subVendorCode: { $in: subVendors.map(sv => sv.subVendorCode) } }
        ]
      }).select('groupName village totalMembers leaderName');
      counts.groups = groups.length;

      // Pending Approvals in the network
      counts.pendingApprovals = await User.countDocuments({
        $or: [
          { parentVendorId: userId, status: 'pending' },
          { parentVendorId: { $in: subVendorIds }, status: 'pending' }
        ]
      });

    } else if (role === 'sub_vendor') {
      // Find Employees
      employees = await User.find({ parentVendorId: userId, role: 'employee' }).select('fullName employeeId status designation district block');
      counts.employees = employees.length;

      // Find Members
      members = await WomenMember.find({ subVendorCode: subVendorCode }).select('name mobile village status membershipStatus connectionStatus assignedEmployeeId');
      counts.members = members.length;
      counts.paidMembers = members.filter((m: any) => m.membershipStatus === 'paid').length;
      counts.freeMembers = members.filter((m: any) => m.membershipStatus === 'free').length;

      // Find Groups
      groups = await Group.find({ subVendorCode: subVendorCode }).select('groupName village totalMembers leaderName');
      counts.groups = groups.length;

      counts.pendingApprovals = await User.countDocuments({ parentVendorId: userId, status: 'pending' });

    } else if (role === 'employee') {
      // Find Members
      members = await WomenMember.find({ assignedEmployeeId: userId }).select('name mobile village status membershipStatus connectionStatus');
      counts.members = members.length;
      counts.paidMembers = members.filter((m: any) => m.membershipStatus === 'paid').length;
      counts.freeMembers = members.filter((m: any) => m.membershipStatus === 'free').length;

      // Find Groups
      groups = await Group.find({ createdBy: userId }).select('groupName village totalMembers leaderName');
      counts.groups = groups.length;
    }

    let digitalCertificates: any[] = [];
    let userObj = user.toObject();

    if (user.role === 'employee') {
      const EmployeeOfferLetter = (await import('@/models/EmployeeOfferLetter')).default;
      const EmployeeCertificate = (await import('@/models/EmployeeCertificate')).default;
      
      const offerLetter = await EmployeeOfferLetter.findOne({ employeeId: user._id }).lean();
      if (offerLetter) {
        userObj.offerLetterDetails = offerLetter;
      }

      const certs = await EmployeeCertificate.find({ employeeId: user._id }).lean();
      
      digitalCertificates = [
        ...(offerLetter ? [{
          _id: offerLetter._id,
          type: 'employee_offer_letter',
          title: 'Employee Offer Letter',
          fileUrl: offerLetter.pdfUrl,
          status: offerLetter.status,
          agreementId: offerLetter.offerLetterId,
          createdAt: offerLetter.createdAt,
          visibleToEmployee: true
        }] : []),
        ...certs.map(c => ({
          _id: c._id,
          type: c.certificateType,
          title: c.title,
          fileUrl: c.fileUrl,
          createdAt: c.createdAt,
          visibleToEmployee: true
        }))
      ];
    } else if (['vendor', 'sub_vendor'].includes(user.role)) {
      const VendorAgreement = (await import('@/models/VendorAgreement')).default;
      const VendorMOU = (await import('@/models/VendorMOU')).default;
      const VendorCertificate = (await import('@/models/VendorCertificate')).default;

      const agreement = await VendorAgreement.findOne({ vendorId: user._id }).lean();
      if (agreement) {
        userObj.appointmentDetails = agreement;
      }

      const agreements = agreement ? [agreement] : [];
      const mous = await VendorMOU.find({ vendorId: user._id }).lean();
      const certs = await VendorCertificate.find({ vendorId: user._id }).lean();

      digitalCertificates = [
        ...agreements.map(a => ({
          _id: a._id,
          type: 'auth_letter',
          title: 'Partnership Agreement',
          fileUrl: a.fileUrl,
          uploadedDocumentUrl: a.uploadedDocumentUrl,
          status: a.status,
          isLocked: a.isLocked,
          adminRemarks: a.adminRemarks,
          agreementId: a.agreementId,
          createdAt: a.createdAt,
          visibleToVendor: true
        })),
        ...mous.map(m => ({
          _id: m._id,
          type: 'ngo_mou',
          title: 'NGO MOU',
          fileUrl: m.fileUrl,
          uploadedDocumentUrl: m.uploadedDocumentUrl,
          status: m.status,
          isLocked: m.isLocked,
          adminRemarks: m.adminRemarks,
          createdAt: m.createdAt,
          visibleToVendor: true
        })),
        ...certs.map(c => ({
          _id: c._id,
          type: c.certificateType,
          title: c.title,
          fileUrl: c.fileUrl,
          createdAt: c.createdAt,
          visibleToVendor: true
        }))
      ];
    }

    return successResponse({
      user: userObj,
      counts,
      digitalCertificates,
      hierarchy: {
        subVendors,
        employees,
        members,
        groups
      }
    });
  } catch (error: any) {
    console.error('Hierarchy Fetch Error:', error);
    return errorResponse(error.message, 500);
  }
}
