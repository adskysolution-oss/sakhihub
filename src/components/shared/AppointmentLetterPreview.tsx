import React from 'react';

export interface AppointmentLetterData {
  companyName?: string;
  programName?: string;
  vendorName: string;
  ownerName: string;
  vendorCode: string;
  agreementId: string;
  assignedState: string;
  assignedDistrict: string;
  role: string;
  workingArea: string;
  joiningDate: string | Date;
  salary: string;
  petrolAllowance?: string;
  membershipIncentive?: string;
  documentStatus?: string;
  generatedDate: string | Date;
}

const AppointmentLetterPreview: React.FC<{ data: AppointmentLetterData }> = ({ data }) => {
  const companyName = data.companyName || "SakhiHub Foundation";
  const programName = data.programName || "Women Empowerment & Digital Inclusion Initiative";
  const petrolAllowance = data.petrolAllowance || "As per SakhiHub travel & operational policy";
  const membershipIncentive = data.membershipIncentive || "Performance-based as per active incentive slabs";

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
          <p className="text-xs text-gray-500 font-bold">Agreement ID: <span className="font-mono text-gray-800">{data.agreementId}</span></p>
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-xl font-black text-gray-900 uppercase underline underline-offset-4">Appointment & Agreement Letter</h2>
      </div>

      {/* Basic Details */}
      <div className="mb-8">
        <p className="mb-4">To,</p>
        <p className="font-bold text-lg">{data.vendorName}</p>
        <p className="font-bold text-gray-700">Attn: {data.ownerName}</p>
        <p className="text-sm text-gray-700">Authorized {displayRole}</p>
        <p className="text-sm text-gray-700">Official ID: <span className="font-mono font-bold">{data.vendorCode}</span></p>
      </div>

      <div className="mb-6">
        <p className="text-justify leading-relaxed">
          Dear <span className="font-bold">{data.ownerName}</span>,<br/><br/>
          Welcome to <span className="font-bold">{companyName}</span>! We are pleased to formally appoint you as an Authorized <span className="font-bold">{displayRole}</span> under the <span className="font-bold">{programName}</span>. Based on your application and subsequent verification, we believe your skills and commitment will be a valuable addition to our network.
        </p>
      </div>

      {/* Commercials & Logistics */}
      <h3 className="text-md font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">1. Commercials & Logistics</h3>
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
          <tr className="border-b border-gray-100">
            <td className="py-2 font-bold text-green-700">Fixed Remuneration (Salary)</td>
            <td className="py-2 font-bold text-green-700">₹{data.salary} / month</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-2 font-bold">Petrol & Travel Allowance</td>
            <td className="py-2">{petrolAllowance}</td>
          </tr>
          <tr>
            <td className="py-2 font-bold">Incentive Structure</td>
            <td className="py-2">{membershipIncentive}</td>
          </tr>
        </tbody>
      </table>

      {/* Responsibilities */}
      <h3 className="text-md font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">2. Core Responsibilities & Targets</h3>
      <ul className="list-disc pl-5 text-sm space-y-2 mb-6 text-justify">
        <li>You are responsible for expanding the SakhiHub network and empowering local communities in your assigned working area.</li>
        <li>You must fulfill the monthly operational targets set by the company, including member registrations and network management.</li>
        <li>Ensure transparent and ethical operations in accordance with SakhiHub guidelines.</li>
      </ul>

      {/* Portal Operations */}
      <h3 className="text-md font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">3. Portal Operations & Security</h3>
      <ul className="list-disc pl-5 text-sm space-y-2 mb-6 text-justify">
        <li>All activities must be logged and processed strictly through the official SakhiHub digital portal.</li>
        <li>Login credentials provided to you are strictly confidential and non-transferable.</li>
        <li>You are responsible for the data privacy of the members and individuals registered under your network.</li>
      </ul>

      {/* Confidentiality & Rights */}
      <h3 className="text-md font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">4. Confidentiality & Company Rights</h3>
      <p className="text-sm text-justify mb-6 leading-relaxed">
        During the course of your engagement, you will have access to confidential information regarding company operations, member data, and proprietary systems. You agree not to disclose, share, or misuse any such information. <span className="font-bold">{companyName}</span> reserves all rights to amend policies, operational guidelines, or incentive structures with prior notice. The company holds full rights over all intellectual property and network data generated during your tenure.
      </p>

      {/* Termination */}
      <h3 className="text-md font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">5. Termination & Governing Law</h3>
      <p className="text-sm text-justify mb-12 leading-relaxed">
        This agreement may be terminated by either party with a written notice. However, immediate termination may be enacted by the company in cases of fraud, policy violation, or unethical behavior. This agreement shall be governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the registered company headquarters.
      </p>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-12 pt-8">
        <div className="text-center">
          <p className="font-bold border-t border-gray-400 pt-2 px-8 uppercase text-sm">Authorized Signatory</p>
          <p className="text-xs text-gray-500 mt-1">For {companyName}</p>
        </div>
        
        <div className="text-center">
          <p className="font-bold border-t border-gray-400 pt-2 px-8 uppercase text-sm">Appointee Signature</p>
          <p className="text-xs text-gray-500 mt-1">{data.ownerName}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-16 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 uppercase tracking-widest">
        This is a system generated document and does not require a physical signature for digital validity.
      </div>

    </div>
  );
};

export default AppointmentLetterPreview;
