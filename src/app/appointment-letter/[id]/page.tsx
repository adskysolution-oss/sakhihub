import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import AppointmentLetterPreview, { AppointmentLetterData } from '@/components/shared/AppointmentLetterPreview';
import PrintButton from '@/components/shared/PrintButton';

export default async function AppointmentLetterPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const { id } = await params;
  const user = await User.findById(id).lean();
  
  if (!user || !user.appointmentDetails) {
    notFound();
  }

  const { appointmentDetails } = user as any;

  const letterData: AppointmentLetterData = {
    vendorName: user.businessName || user.fullName,
    ownerName: user.fullName,
    vendorCode: user.vendorCode || user.subVendorCode || user.employeeId || 'PENDING-ID',
    agreementId: appointmentDetails.agreementId,
    assignedState: user.state || 'N/A',
    assignedDistrict: user.district || 'N/A',
    role: user.role,
    workingArea: user.block ? `${user.block}, ${user.district}` : user.district || 'All areas',
    joiningDate: appointmentDetails.joiningDate,
    salary: appointmentDetails.salary,
    generatedDate: appointmentDetails.generatedDate,
    documentStatus: appointmentDetails.status
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
