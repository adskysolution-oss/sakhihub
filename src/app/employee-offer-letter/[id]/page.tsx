import React from 'react';
import { notFound, redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeOfferLetter from '@/models/EmployeeOfferLetter';
import PaymentConfig from '@/models/PaymentConfig';
import EmployeeOfferLetterPreview, { EmployeeOfferLetterData } from '@/components/shared/EmployeeOfferLetterPreview';
import PrintButton from '@/components/shared/PrintButton';
import { getAuthSession } from '@/lib/auth';

export default async function EmployeeOfferLetterPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const { id } = await params;
  const user = await User.findById(id).lean();
  const offerLetter = await EmployeeOfferLetter.findOne({ employeeId: id }).lean();
  
  if (!user || !offerLetter || !['employee', 'staff'].includes(user.role)) {
    notFound();
  }

  const session = (await getAuthSession()) as any;
  if (!session) {
    redirect(`/login?callbackUrl=/employee-offer-letter/${id}`);
  }

  // Super Admin Bypass
  if (session.role === 'super_admin') {
    // Allowed
  } else {
    // Ownership check (Enhancement 2): verify logged-in user is the owner of the offer letter
    const isSelf = ['employee', 'staff'].includes(session.role) && offerLetter.employeeId.toString() === session.id;

    if (isSelf) {
      // Allowed
    } else {
      // Check offer_letters.view permission
      const hasPermission = Array.isArray(session.permissions) && session.permissions.includes('offer_letters.view');
      if (!hasPermission) {
        redirect('/unauthorized');
      }

      // Check regional scope
      const { checkRegionalScope } = await import('@/utils/authHelpers');
      const hasScope = await checkRegionalScope(user, session);
      if (!hasScope) {
        redirect('/unauthorized');
      }
    }
  }

  const config = await PaymentConfig.findOne({ key: 'default' }).lean();
  const depositAmountValue = config?.depositAmount?.employee ? String(config.depositAmount.employee) : '2000';

  const letterData: EmployeeOfferLetterData = {
    employeeName: user.fullName as string,
    employeeId: (user.employeeId as string) || (user.staffId as string) || 'PENDING-ID',
    assignedState: (user.state as string) || 'N/A',
    assignedDistrict: (user.district as string) || 'N/A',
    workingArea: user.block ? `${user.block}, ${user.district}` : (user.district as string) || 'All areas',
    role: (user.designation as string) || user.role,
    mobile: user.mobile as string,
    joiningDate: offerLetter.joiningDate as Date,
    salary: offerLetter.salary as string,
    travelAllowance: offerLetter.travelAllowance as string,
    performanceIncentives: offerLetter.performanceIncentives as string,
    membershipIncentives: offerLetter.membershipIncentives as string,
    coordinatorType: offerLetter.coordinatorType as string,
    assignedRegions: offerLetter.assignedRegions as string,
    generatedDate: offerLetter.generatedDate as Date,
    offerLetterId: offerLetter.offerLetterId as string,
    documentStatus: offerLetter.status as any,
    depositAmount: depositAmountValue,
    offerLetterType: user.role as 'employee' | 'staff'
  };

  return (
    <div className="min-h-screen bg-gray-200 py-12 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto mb-6 print:hidden flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-800">
            {user.role === 'staff' ? 'Staff Offer Letter' : 'Employee Offer Letter'}
          </h2>
          <p className="text-sm text-gray-500 font-bold">Use A4 paper size when printing</p>
        </div>
        <PrintButton />
      </div>

      <EmployeeOfferLetterPreview data={letterData} />
    </div>
  );
}
