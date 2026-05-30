import React from 'react';

export interface EmployeeOfferLetterData {
  companyName?: string;
  programName?: string;
  employeeName: string;
  employeeId: string;
  assignedState: string;
  assignedDistrict: string;
  workingArea: string;
  role: string;
  joiningDate: string | Date;
  salary: string;
  mobile: string;
  offerLetterId: string;
  generatedDate: string | Date;
  documentStatus?: string;
}

const EmployeeOfferLetterPreview: React.FC<{ data: EmployeeOfferLetterData }> = ({ data }) => {
  const companyName = data.companyName || "SakhiHub Foundation";
  const programName = data.programName || "Women Health & Awareness Campaign";

  const formatDate = (d: string | Date) => {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const displayRole = data.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] mx-auto shadow-2xl p-[15mm] text-gray-800 font-serif print:shadow-none print:p-0 print:w-full print:h-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#D91656] pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#D91656] tracking-tight">{companyName}</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{programName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-bold">Document Status: <span className="text-[#D91656] uppercase">{data.documentStatus || 'GENERATED'}</span></p>
          <p className="text-xs text-gray-500 font-bold">Date: {formatDate(data.generatedDate)}</p>
          <p className="text-xs text-gray-500 font-bold">Offer Letter ID: <span className="font-mono text-gray-800">{data.offerLetterId}</span></p>
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-xl font-black text-gray-900 uppercase underline underline-offset-4">Official Offer Letter</h2>
      </div>

      {/* Basic Details */}
      <div className="mb-8">
        <p className="mb-4 text-sm font-bold">To,</p>
        <p className="font-bold text-lg">{data.employeeName}</p>
        <p className="text-sm text-gray-700">Mobile: {data.mobile}</p>
        <p className="text-sm text-gray-700">Employee ID: <span className="font-mono font-bold">{data.employeeId}</span></p>
        <p className="text-sm text-gray-700">Role: <span className="font-bold">{displayRole}</span></p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-black uppercase text-gray-800 mb-2">Dear Candidate,</h3>
        <p className="text-justify leading-relaxed text-sm">
          We are pleased to offer you the position of <span className="font-bold">{displayRole}</span> (Employee/Coordinator) at <span className="font-bold">{companyName}</span> for the <span className="font-bold">{programName}</span>. Your skills align perfectly with our mission. This letter serves as your formal joining and acceptance confirmation.
        </p>
      </div>

      {/* Position Details */}
      <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">1. Position Details</h3>
      <table className="w-full text-sm border-collapse mb-6">
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-2 font-bold w-1/3">Assigned State</td>
            <td className="py-2">{data.assignedState}</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-2 font-bold">Assigned District</td>
            <td className="py-2">{data.assignedDistrict}</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-2 font-bold">Working Area</td>
            <td className="py-2">{data.workingArea || data.assignedDistrict}</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-2 font-bold">Date of Joining</td>
            <td className="py-2 font-bold">{formatDate(data.joiningDate)}</td>
          </tr>
        </tbody>
      </table>

      {/* Primary Responsibilities */}
      <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">2. Primary Responsibilities</h3>
      <ul className="list-disc pl-5 text-[13px] space-y-1.5 mb-6 text-justify">
        <li>Actively coordinate and manage duties for the campaign in your designated area.</li>
        <li>Onboard and support members, ensuring active participation and maintaining compliance with organization standards.</li>
        <li>Participate in necessary training, workshops, and community outreach programs as directed by the organization.</li>
      </ul>

      {/* Salary & Benefits */}
      <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">3. Salary & Benefits</h3>
      <p className="text-[13px] text-justify mb-6 leading-relaxed">
        Your fixed salary is <span className="font-bold text-green-700">₹{data.salary} / month</span>. You may also be eligible for standard employee benefits and allowances as per the prevailing HR policies.
      </p>

      {/* Nature of Work */}
      <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">4. Nature of Work & Independent Operational Clause</h3>
      <p className="text-[13px] text-justify mb-6 leading-relaxed">
        Your role requires significant field work and direct community engagement. You are expected to operate independently in your assigned block/district while strictly adhering to SakhiHub’s operational protocols.
      </p>

      {/* Code of Conduct */}
      <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">5. Code of Conduct</h3>
      <p className="text-[13px] text-justify mb-6 leading-relaxed">
        Professional behavior, ethical conduct, and respect for community members are mandatory. Any violation of the code of conduct will result in disciplinary action.
      </p>

      {/* Confidentiality Clause */}
      <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">6. Confidentiality Clause</h3>
      <p className="text-[13px] text-justify mb-6 leading-relaxed">
        You are required to maintain strict confidentiality regarding all organizational data, member information, and internal processes.
      </p>

      {/* Portal Agreement */}
      <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">7. Digital Acceptance & Portal Agreement</h3>
      <p className="text-[13px] text-justify mb-6 leading-relaxed">
        All operational activities must be logged via the SakhiHub dashboard. By accessing and operating your employee dashboard, you digitally accept the terms of this offer.
      </p>

      {/* Verification & Termination */}
      <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">8. Verification & Termination Policy</h3>
      <p className="text-[13px] text-justify mb-8 leading-relaxed">
        This offer is subject to successful background verification and document compliance. SakhiHub reserves the right to terminate your employment with immediate effect in case of document falsification or severe misconduct.
      </p>

      {/* Declaration */}
      <div className="mb-12 bg-gray-50 p-4 border border-gray-200 rounded-xl">
        <h3 className="text-sm font-black uppercase text-gray-800 mb-2">Declaration by Candidate</h3>
        <p className="text-[12px] text-justify leading-relaxed text-gray-700 italic">
          "I hereby accept the position and the terms and conditions outlined in this Offer Letter. I agree to dedicate my full professional efforts to SakhiHub Foundation and abide by all organizational policies."
        </p>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-4 pt-8">
        <div className="text-center relative">
          <img src="/manager-signature.png" alt="Manager Signature" className="h-16 w-auto mx-auto object-contain opacity-80" />
          <p className="font-bold border-t border-gray-400 pt-2 px-8 uppercase text-xs">Authorized By</p>
          <p className="text-[10px] text-gray-500 mt-1">For {companyName}</p>
        </div>
        
        <div className="text-center">
          <p className="font-bold border-t border-gray-400 pt-2 px-8 uppercase text-xs">Candidate Digital Acceptance</p>
          <p className="text-[10px] text-gray-500 mt-1">Signed by {data.employeeName}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 uppercase tracking-widest">
        This is a system generated digital offer letter. Digital acceptance via the SakhiHub portal is legally binding.
      </div>

    </div>
  );
};

export default EmployeeOfferLetterPreview;
