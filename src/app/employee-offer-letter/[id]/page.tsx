import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeOfferLetter from '@/models/EmployeeOfferLetter';
import EmployeeOfferLetterPreview, { EmployeeOfferLetterData } from '@/components/shared/EmployeeOfferLetterPreview';
import PrintButton from '@/components/shared/PrintButton';

export default async function EmployeeOfferLetterPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const { id } = await params;
  const user = await User.findById(id).lean();
  const offerLetter = await EmployeeOfferLetter.findOne({ employeeId: id }).lean();
  
  if (!user || !offerLetter || user.role !== 'employee') {
    notFound();
  }

  const letterData: EmployeeOfferLetterData = {
    employeeName: user.fullName as string,
    employeeId: (user.employeeId as string) || 'PENDING-ID',
    assignedState: (user.state as string) || 'N/A',
    assignedDistrict: (user.district as string) || 'N/A',
    workingArea: user.block ? `${user.block}, ${user.district}` : (user.district as string) || 'All areas',
    role: (user.designation as string) || user.role,
    mobile: user.mobile as string,
    joiningDate: offerLetter.joiningDate as Date,
    salary: offerLetter.salary as string,
    generatedDate: offerLetter.generatedDate as Date,
    offerLetterId: offerLetter.offerLetterId as string,
    documentStatus: offerLetter.status as any
  };

  return (
    <div className="min-h-screen bg-gray-200 py-12 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto mb-6 print:hidden flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-800">Employee Offer Letter</h2>
          <p className="text-sm text-gray-500 font-bold">Use A4 paper size when printing</p>
        </div>
        <PrintButton />
      </div>

      <EmployeeOfferLetterPreview data={letterData} />
    </div>
  );
}
