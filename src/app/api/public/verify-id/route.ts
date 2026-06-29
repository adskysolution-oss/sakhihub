import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || id.trim() === '') {
      return NextResponse.json({ success: false, message: 'ID is required for verification' }, { status: 400 });
    }

    await dbConnect();

    let searchUserId: any = null;

    // Check if the id passed is a membershipId (starts with 'SH-' case insensitive)
    if (id.toUpperCase().startsWith('SH-')) {
      const Membership = (await import('@/models/Membership')).default;
      const membership = await Membership.findOne({ membershipId: id.toUpperCase() }).lean();
      if (membership && membership.memberId) {
        const WomenMember = (await import('@/models/WomenMember')).default;
        const member = await WomenMember.findById(membership.memberId).lean();
        if (member && member.userId) {
          searchUserId = member.userId;
        }
      }
    }

    // Build the query
    const searchQuery: any[] = [];
    if (searchUserId) {
      searchQuery.push({ _id: searchUserId });
    } else {
      searchQuery.push(
        { mobile: id },
        { vendorCode: id },
        { subVendorCode: id },
        { employeeId: id }
      );
      if (mongoose.Types.ObjectId.isValid(id)) {
        searchQuery.push({ _id: id });
      }
    }

    // Find the user
    const user = await User.findOne({ $or: searchQuery })
      .select('fullName role mobile profileImage vendorType designation businessName state district block pincode vendorCode subVendorCode employeeId status createdAt isVerified dashboardAccess documentsVerified joiningDate')
      .lean();

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'No verified SakhiHub identity found.' 
      }, { status: 404 });
    }

    // Prepare safe public data
    let publicData: any = {
      fullName: user.fullName,
      role: user.role,
      designation: user.designation,
      vendorType: user.vendorType,
      mobile: user.mobile,
      profileImage: user.profileImage,
      registrationDate: user.joiningDate || user.createdAt,
      state: user.state,
      district: user.district,
      block: user.block,
      pincode: user.pincode,
      organizationName: user.businessName,
      status: user.status, // We'll map this on frontend for badges
      isVerified: user.isVerified || user.documentsVerified || user.dashboardAccess,
    };

    // Determine the ID Number to display
    if (user.role === 'vendor') publicData.idNumber = user.vendorCode;
    else if (user.role === 'sub_vendor') publicData.idNumber = user.subVendorCode;
    else if (user.role === 'employee' || user.role === 'staff') {
      const expectedPrefix = user.role === 'employee' ? 'SHEMP' : 'SHSTF';
      const isCorrectFormat = typeof user.employeeId === 'string' && user.employeeId.startsWith(expectedPrefix) && user.employeeId.length === 11;

      if (!isCorrectFormat) {
        const EmployeeOfferLetter = (await import('@/models/EmployeeOfferLetter')).default;
        const offerLetter = await EmployeeOfferLetter.findOne({ employeeId: user._id }).lean();
        
        let suffix = '';
        if (offerLetter && offerLetter.offerLetterId) {
          if (offerLetter.offerLetterId.includes('/')) {
            const parts = offerLetter.offerLetterId.split('/');
            suffix = parts[parts.length - 1];
          } else if (offerLetter.offerLetterId.includes('-')) {
            const parts = offerLetter.offerLetterId.split('-');
            suffix = parts[parts.length - 1];
          }
        }
        
        if (!suffix || suffix.length !== 6) {
          suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
        }
        
        const newId = `${expectedPrefix}${suffix}`;
        publicData.idNumber = newId;
        await User.updateOne({ _id: user._id }, { $set: { employeeId: newId } });
      } else {
        publicData.idNumber = user.employeeId;
      }
    }
    else publicData.idNumber = user._id.toString();

    // If role is member, try fetching additional public details from WomenMember
    if (user.role === 'member') {
      const memberDetails = await WomenMember.findOne({ userId: user._id }).lean();
      if (memberDetails) {
        publicData.state = publicData.state || memberDetails.state;
        publicData.district = publicData.district || memberDetails.district;
        publicData.block = publicData.block || memberDetails.block;
        publicData.pincode = publicData.pincode || memberDetails.pincode;
        publicData.accountStatus = memberDetails.accountStatus; // active | inactive
        publicData.membershipStatus = memberDetails.membershipStatus; // free | paid

        // Find membershipId from Membership collection
        const Membership = (await import('@/models/Membership')).default;
        const membership = await Membership.findOne({ memberId: memberDetails._id }).lean();
        if (membership && membership.membershipId) {
          publicData.idNumber = membership.membershipId;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: publicData
    });

  } catch (error: any) {
    console.error('Verify ID Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to verify identity. Please try again.' }, { status: 500 });
  }
}
