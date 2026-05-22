import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VendorAgreement from '@/models/VendorAgreement';
import AppointmentLetterPreview, { AppointmentLetterData } from '@/components/shared/AppointmentLetterPreview';
import PrintButton from '@/components/shared/PrintButton';

export default async function AppointmentLetterPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const { id } = await params;
  const user = await User.findById(id).lean();
  const agreement = await VendorAgreement.findOne({ vendorId: id }).lean();
  
  if (!user || !agreement) {
    notFound();
  }

  const letterData: AppointmentLetterData = {
    vendorName: (user.businessName as string) || (user.fullName as string),
    ownerName: user.fullName as string,
    vendorCode: (user.vendorCode as string) || (user.subVendorCode as string) || (user.employeeId as string) || 'PENDING-ID',
    agreementId: agreement.agreementId as string,
    assignedState: (user.state as string) || 'N/A',
    assignedDistrict: (user.district as string) || 'N/A',
    role: user.role as any,
    workingArea: user.block ? `${user.block}, ${user.district}` : (user.district as string) || 'All areas',
    joiningDate: agreement.joiningDate as Date,
    salary: agreement.salary as string,
    generatedDate: agreement.generatedDate as Date,
    documentStatus: agreement.status as any
  };

  return (
    <div className="min-h-screen bg-gray-200 py-12 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto mb-6 print:hidden flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-800">Official Agreement Document</h2>
          <p className="text-sm text-gray-500 font-bold">Use A4 paper size when printing</p>
        </div>
        <PrintButton />
      </div>

      <AppointmentLetterPreview data={letterData} />
    </div>
  );
}
