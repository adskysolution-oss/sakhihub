import React from 'react';
import DocumentHeader from './DocumentHeader';

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
  travelAllowance?: string;
  performanceIncentives?: string;
  membershipIncentives?: string;
  coordinatorType?: string;
  assignedRegions?: string;
  mobile: string;
  offerLetterId: string;
  generatedDate: string | Date;
  documentStatus?: string;
  depositAmount?: string;
}

const EmployeeOfferLetterPreview: React.FC<{ data: EmployeeOfferLetterData }> = ({ data }) => {
  const companyName = "SakhiHub";
  const programName = data.programName || "Women Health & Awareness Campaign";
  const isTrainer = data.role === 'Trainer';

  const formatDate = (d: string | Date) => {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const displayRole = data.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Determine dynamic position description based on candidate designation
  const getDynamicPositionText = (role: string) => {
    const roleUpper = role.toUpperCase();
    if (roleUpper.includes('DISTRICT') || roleUpper.includes('COORD')) {
      return "District Level Women Coordinator";
    }
    return "Block Level Women Employee / Coordinator";
  };

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] mx-auto shadow-2xl p-[15mm] text-gray-800 font-serif print:shadow-none print:p-0 print:w-full print:h-auto">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          h2, h3, h4 {
            break-after: avoid;
            page-break-after: avoid;
          }
          tr, li, tbody, table {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .signatures-container {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .keep-together {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          /* Distribute space on page 1 and page 2 */
          h2 {
            margin-bottom: 16px !important;
          }
          h3 {
            margin-top: 20px !important;
            margin-bottom: 10px !important;
            padding-bottom: 4px !important;
          }
          .mb-6 {
            margin-bottom: 16px !important;
          }
          .mb-8 {
            margin-bottom: 20px !important;
          }
          .mt-16 {
            margin-top: 32px !important;
          }
          .mt-12 {
            margin-top: 24px !important;
          }
          .pt-8 {
            padding-top: 24px !important;
          }
          .pb-4 {
            padding-bottom: 12px !important;
          }
          .pb-1 {
            padding-bottom: 4px !important;
          }
          .mb-3 {
            margin-bottom: 8px !important;
          }
          .space-y-1\\.5 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 4px !important;
          }
          .print-footer-content, .print-footer-content a, .print-footer-content span {
            color: #2563eb !important;
          }
          .print-footer-content a {
            text-decoration: underline !important;
          }
        }
      `}</style>

      <table className="w-full border-none border-collapse p-0 m-0">
        <thead className="hidden print:table-header-group">
          <tr>
            <td>
              <DocumentHeader logoSrc="/logo.png" />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-0 print:px-[12mm]">
              {/* Header */}
              <div className="flex flex-col items-center border-b-2 border-[#D91656] pb-4 mb-6 text-center print:border-none print:pb-0 print:mb-4">
                <img src="/logo.png" alt="SakhiHub Logo" className="h-20 w-auto object-contain mb-3 print:hidden" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest print:hidden">{programName}</p>
                <p className="text-xs text-gray-400 italic mt-1 print:hidden">"Empowering Women Through Awareness, Support & Community Action"</p>

                {/* Status and metadata */}
                <div className="w-full flex justify-between items-center mt-4 text-[11px] text-gray-500 font-bold border-t border-gray-100 pt-2.5 print:mt-0 print:border-t-0 print:pt-0">
                  <p>Status: <span className="text-[#D91656] uppercase font-black">{data.documentStatus || 'GENERATED'}</span></p>
                  <p>Offer Letter ID: <span className="font-mono text-gray-800 font-bold">{data.offerLetterId}</span></p>
                  <p>Date: {formatDate(data.generatedDate)}</p>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                  {isTrainer ? 'OFFICIAL OFFER LETTER' : 'OFFER LETTER'}
                </h2>
                {isTrainer && (
                  <p className="text-sm font-black text-gray-600 mt-1 uppercase tracking-wide">
                    STATE LEVEL FEMALE TRAINER (PAN INDIA)
                  </p>
                )}
              </div>

              {/* Salutation & Intro */}
              <div className="text-sm space-y-4 mb-6 leading-relaxed text-justify">
                <p className="font-bold">Dear Ms. {data.employeeName},</p>
                {isTrainer ? (
                  <p>
                    We are pleased to offer you the position of <strong>State Level Female Trainer</strong> with <strong>SakhiHub Women Health & Awareness Campaign</strong>, subject to the terms and conditions mentioned below.
                  </p>
                ) : (
                  <>
                    <p>
                      We are pleased to offer you the position under the <strong>SakhiHub Women Health & Awareness Campaign Program</strong>.
                    </p>
                    <p>
                      SakhiHub is a women-focused awareness and empowerment initiative working towards health awareness, hygiene education, women support systems, community engagement, and empowerment activities across India.
                    </p>
                    <p>
                      Your selection has been made based on your application, communication ability, interest in social awareness activities, and organizational requirements.
                    </p>
                  </>
                )}
                <p>
                  This Offer Letter is being issued digitally through the SakhiHub Employee Portal and shall be considered valid after digital acceptance, declaration confirmation and online signature completion by the candidate.
                </p>
              </div>

              {isTrainer ? (
                <>
                  {/* 1. DESIGNATION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">1. DESIGNATION</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed">
                    <p className="mb-2">You are appointed as:</p>
                    <p className="font-bold text-gray-900 mb-2">State Level Female Trainer (PAN India Women Health & Awareness Program)</p>
                    <p className="font-bold text-gray-900">Reporting To:</p>
                    <p className="text-gray-700">Project Head – PAN India Operations or any authorized officer nominated by the Company from time to time.</p>
                  </div>

                  {/* 2. NATURE OF WORK */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">2. NATURE OF WORK</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed">
                    <p className="mb-2 font-bold">Your role shall include, but not be limited to:</p>
                    <ul className="space-y-1.5 list-none pl-1 mb-3">
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Conducting Online Training Sessions through Google Meet, Zoom, Webinar Platforms.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Training District Coordinators, Block Coordinators and Project Teams.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Delivering Women Health, Hygiene, Awareness and Empowerment Training.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Training employees on existing and future SakhiHub campaigns.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Orientation and induction of newly joined employees.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Preparing and delivering presentations, SOPs, manuals and training materials.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Monitoring training quality and employee performance.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Supporting field operations through virtual guidance.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Conducting awareness webinars and motivational sessions.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Submitting daily, weekly and monthly training reports.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Any other work assigned by the Company related to training, awareness, operations, monitoring or project development.</span></li>
                    </ul>
                  </div>

                  {/* 3. PLACE OF WORK */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">3. PLACE OF WORK</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    The position is primarily Work From Home / Online. The Company may require you to travel within your assigned State or other locations as per project requirements.
                  </p>

                  {/* 4. COMPENSATION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">4. COMPENSATION</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed">
                    <p className="mb-2">Your compensation shall be communicated separately through salary structure, HR communication or company policy.</p>
                    <p className="mb-3">The Company reserves the right to revise compensation, incentives, reimbursements and benefits based on performance, project requirements and organizational policies.</p>
                    {data.salary && (
                      <ul className="space-y-1.5 list-none pl-1 font-bold text-gray-900 bg-gray-50 p-3.5 border border-gray-100 rounded-2xl">
                        <li className="flex items-center gap-1.5">• Fixed Monthly Salary: <span className="text-green-700 font-extrabold">₹{data.salary} / Month</span></li>
                        {data.travelAllowance && <li className="flex items-center gap-1.5">• Petrol / Travel Allowance: <span className="text-green-700 font-extrabold">{data.travelAllowance}</span></li>}
                        {data.performanceIncentives && <li className="flex items-center gap-1.5">• Performance Incentives: <span className="text-green-700 font-extrabold">{data.performanceIncentives}</span></li>}
                        {data.membershipIncentives && <li className="flex items-center gap-1.5">• Membership Incentives (if applicable): <span className="text-green-700 font-extrabold">{data.membershipIncentives}</span></li>}
                      </ul>
                    )}
                  </div>

                  {/* 5. PROBATION PERIOD */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">5. PROBATION PERIOD</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <p className="mb-1.5">You shall remain on probation for an initial period of <strong>Six (6) Months</strong>.</p>
                    <p className="mb-1.5">During probation: Performance shall be continuously reviewed. Company may extend probation if required.</p>
                    <p>Confirmation is solely at Company discretion.</p>
                  </div>

                  {/* 6. PERFORMANCE REQUIREMENTS */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">6. PERFORMANCE REQUIREMENTS</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed">
                    <p className="mb-2 font-bold">You shall:</p>
                    <ul className="space-y-1.5 list-none pl-1 mb-2 text-gray-700">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Attend all official meetings.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Conduct assigned training sessions timely.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Maintain professional conduct.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Submit reports within prescribed timelines.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Follow all SOPs, policies and instructions.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Maintain training quality standards.</span></li>
                    </ul>
                    <p className="italic text-red-600 font-bold">Failure to meet performance standards may lead to warning, suspension, withholding of incentives or termination.</p>
                  </div>

                  {/* 7. ATTENDANCE & REPORTING COMPLIANCE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">7. ATTENDANCE & REPORTING COMPLIANCE</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Daily, weekly and monthly reporting is mandatory.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Training attendance records must be maintained accurately.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Webinar attendance and participation reports must be submitted.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Training completion reports must be uploaded within prescribed timelines.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Salary, incentives, reimbursements and performance benefits may be linked to reporting compliance.</span></li>
                    </ul>
                  </div>

                  {/* 8. BACKGROUND VERIFICATION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">8. BACKGROUND VERIFICATION</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">SakhiHub reserves the right to verify educational qualifications.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Experience certificates may be verified.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Identity and address documents may be verified.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Any false information, forged document, fake experience, misrepresentation or concealment of facts may result in immediate termination without notice.</span></li>
                    </ul>
                  </div>

                  {/* 9. DATA PROTECTION & PORTAL ACCESS */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">9. DATA PROTECTION & PORTAL ACCESS</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Portal credentials must remain confidential.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Trainer shall not share login access with any third party.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Employee, Vendor, Member and Organizational data shall remain protected.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Downloading, copying, exporting or distributing data without authorization is prohibited.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Any unauthorized access or misuse of data will be treated as misconduct.</span></li>
                    </ul>
                  </div>

                  {/* 10. TRAINING MATERIAL & INTELLECTUAL PROPERTY OWNERSHIP */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">10. TRAINING MATERIAL & INTELLECTUAL PROPERTY OWNERSHIP</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">All presentations, SOPs, manuals, webinar recordings, videos, assessments, training modules, course materials and educational content created, modified or delivered during engagement shall remain exclusive property of SakhiHub.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Trainer shall not claim ownership over such materials.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Trainer shall not distribute, sell or reuse company training materials without written permission.</span></li>
                    </ul>
                  </div>

                  {/* 11. NON-COMPETE TRAINING */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">11. NON-COMPETE TRAINING</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Trainer shall not independently conduct commercial training programs using SakhiHub materials, methodologies, participant databases, SOPs or course structures.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Trainer shall not represent SakhiHub training programs outside authorized engagements.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Violation may result in termination and legal action.</span></li>
                    </ul>
                  </div>

                  {/* 12. PERFORMANCE KPI EVALUATION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">12. PERFORMANCE KPI EVALUATION</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <p className="mb-2 font-bold">Performance may be assessed based on:</p>
                    <ul className="space-y-1.5 list-none pl-1 mb-2">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Number of trainings conducted.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Attendance percentage.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Participant engagement.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Training completion rate.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Feedback ratings.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Quality of training delivery.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Reporting compliance.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Program impact and outcomes.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Support provided to field teams.</span></li>
                    </ul>
                    <p className="mt-2 font-bold">Continuation of engagement may depend on satisfactory performance.</p>
                  </div>

                  {/* 13. RECOVERY & FINANCIAL LIABILITY */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">13. RECOVERY & FINANCIAL LIABILITY</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Any financial loss caused due to fraud, negligence, unauthorized commitments, policy violations or misuse of resources may result in recovery proceedings.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">The Company may withhold incentives, reimbursements or pending benefits until investigation is completed.</span></li>
                    </ul>
                  </div>

                  {/* 14. TRANSFER & ASSIGNMENT */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">14. TRANSFER & ASSIGNMENT</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">The Company may assign the Trainer to any state, district, project, campaign, department or training initiative based on organizational requirements.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Trainer agrees to cooperate with such assignments.</span></li>
                    </ul>
                  </div>

                  {/* 15. DIGITAL LEARNING & AI CONTENT PROTECTION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">15. DIGITAL LEARNING & AI CONTENT PROTECTION</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">AI-generated training content, digital learning resources, assessment frameworks, webinar content, presentations and educational systems developed for SakhiHub shall remain proprietary assets of the organization.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Unauthorized copying, redistribution or commercial use is prohibited.</span></li>
                    </ul>
                  </div>

                  {/* 16. POST-EMPLOYMENT RESTRICTIONS */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">16. POST-EMPLOYMENT RESTRICTIONS</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Confidentiality obligations shall continue after resignation or termination.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Training materials, participant databases and internal resources must not be retained or reused after separation.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Non-solicitation restrictions shall remain effective as per company policy.</span></li>
                    </ul>
                  </div>

                  {/* 17. TRAINER REPRESENTATION & BRAND PROTECTION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">17. TRAINER REPRESENTATION & BRAND PROTECTION</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Trainer shall represent SakhiHub professionally during all online and offline engagements.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">No public statement, media interaction, social media announcement or external communication may be made on behalf of SakhiHub without authorization.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Misrepresentation of organizational policies or programs shall be treated as misconduct.</span></li>
                    </ul>
                  </div>

                  {/* 18. CONFIDENTIALITY */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">18. CONFIDENTIALITY</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <p className="mb-2">You shall maintain complete confidentiality regarding: Training Materials, Employee Data, Vendor Data, Member Data, Business Plans, Project Strategies, Pricing Models, Internal Reports, Software & Portal Access, and Future Campaign Information.</p>
                    <p className="mb-2">No information shall be disclosed without written approval from the Company. This obligation shall continue even after resignation or termination.</p>
                  </div>

                  {/* 19. INTELLECTUAL PROPERTY */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">19. INTELLECTUAL PROPERTY</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    Any Training Material, Presentation, SOP, Video, Webinar Recording, Manual, Content, Process, or Documentation created, developed or used during employment shall remain the sole property of the Company. No ownership rights shall vest with the employee.
                  </p>

                  {/* 20. NON-SOLICITATION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">20. NON-SOLICITATION</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    During employment and for a period of 24 months after separation, you shall not directly or indirectly recruit Company employees, influence employees to leave, divert vendors or partners, or approach Company members for personal business. Violation shall invite legal action and damages.
                  </p>

                  {/* 21. SOCIAL MEDIA & PUBLIC REPRESENTATION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">21. SOCIAL MEDIA & PUBLIC REPRESENTATION</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <p className="mb-2 font-bold">You shall not:</p>
                    <ul className="space-y-1.5 list-none pl-1 text-gray-700">
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Make unauthorized public statements.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Misrepresent Company policies.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Create unofficial training programs in Company name.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1">Use Company branding without permission.</span></li>
                    </ul>
                    <p className="mt-2">All public communication shall require authorization.</p>
                  </div>

                  {/* 22. COMPANY PROPERTY */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">22. COMPANY PROPERTY</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    Any login credentials, documents, ID cards, software access, training materials, devices or resources provided by the Company shall remain Company property and must be returned immediately upon demand.
                  </p>

                  {/* 23. TERMINATION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">23. TERMINATION</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <p className="mb-2">The Company reserves the right to terminate employment immediately without notice in case of: Misconduct, Fraud, Data Theft, Misrepresentation, False Reporting, Harassment, Policy Violation, Unauthorized Collection of Money, Brand Damage, Confidentiality Breach, Non-Performance, Absenteeism, or Conflict of Interest.</p>
                    <p>For normal separation, either party may provide notice as per Company policy.</p>
                  </div>

                  {/* 24. NO PERMANENT EMPLOYMENT GUARANTEE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">24. NO PERMANENT EMPLOYMENT GUARANTEE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    This appointment does not create any guarantee of permanent employment. Continuation shall depend upon performance, project requirement, funding availability, organizational requirement, and compliance with Company policies.
                  </p>

                  {/* 25. COMPLIANCE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">25. COMPLIANCE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    You agree to comply with Company Rules, HR Policies, Operational Guidelines, Project SOPs, Data Protection Requirements, and Legal and Regulatory Requirements as amended from time to time.
                  </p>

                  {/* 26. SECURITY DEPOSIT & REFUND POLICY */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">26. SECURITY DEPOSIT & REFUND POLICY</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    <ul className="space-y-1.5 list-none pl-1">
                      <li className="flex items-start gap-1.5">• <span className="flex-1"><strong>Security Deposit Amount:</strong> ₹{data.depositAmount || '2,000'}</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1"><strong>Refund Eligibility Period:</strong> 90 Days (3 Months) of continuous service.</span></li>
                      <li className="flex items-start gap-1.5">• <span className="flex-1"><strong>Refund Policy & Conditions:</strong> The employee security deposit shall become refundable only after successful completion of 90 days (3 months) of continuous service. If the employee leaves, resigns, abandons duties, or is terminated before completion of 90 days, the security deposit shall not be refundable.</span></li>
                    </ul>
                  </div>

                  {/* 27. JURISDICTION */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">27. JURISDICTION</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    Any dispute arising out of this employment shall be subject exclusively to the jurisdiction of courts situated in Indore, Madhya Pradesh, India.
                  </p>
                </>
              ) : (
                <>
                  {/* 1. POSITION DETAILS */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">1. POSITION DETAILS</h3>
                  <table className="w-full text-xs border-collapse mb-6">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-bold w-1/3">Organization</td>
                        <td className="py-2">{companyName}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-bold">Department</td>
                        <td className="py-2">{programName}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-bold">Coordinator Assignment</td>
                        <td className="py-2 font-bold text-gray-900">{data.coordinatorType || getDynamicPositionText(data.role)}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-bold">Work Type</td>
                        <td className="py-2">Field & Awareness Based Activities</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-bold">Assigned Block(s) / District(s)</td>
                        <td className="py-2">{data.assignedRegions || `${data.workingArea || data.assignedDistrict}, ${data.assignedState}`}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-bold">Campaign Type</td>
                        <td className="py-2">PAN India Women Awareness Campaign</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-bold">Date of Joining</td>
                        <td className="py-2 font-bold">{formatDate(data.joiningDate)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 2. PRIMARY RESPONSIBILITIES */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">2. PRIMARY RESPONSIBILITIES</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed">
                    <p className="mb-2 font-bold">The candidate will be responsible for:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 list-none pl-1 mb-3">
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Women Health Awareness</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Period Hygiene Awareness</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Community Group Activities</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Women Empowerment Programs</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Membership Awareness</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Ground Level Campaign Activities</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Field Visits & Reporting</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Team Coordination (if applicable)</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Awareness Meetings & Training Sessions</span></li>
                      <li className="flex items-start gap-1.5">• <span className="text-gray-700">Campaign Monitoring & Community Support</span></li>
                    </ul>
                    <p className="italic text-gray-500">The organization may modify or assign additional responsibilities based on operational requirements.</p>
                  </div>

                  {/* 3. SALARY & BENEFITS */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">3. SALARY & BENEFITS</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed">
                    <ul className="space-y-1.5 list-none pl-1 mb-3 font-bold text-gray-900">
                      <li className="flex items-center gap-1.5">• Fixed Monthly Salary: <span className="text-green-700 font-extrabold">₹{data.salary} / Month</span></li>
                      <li className="flex items-center gap-1.5">• Petrol / Travel Allowance: <span className="text-green-700 font-extrabold">{data.travelAllowance || 'N/A'}</span></li>
                      <li className="flex items-center gap-1.5">• Performance Incentives: <span className="text-green-700 font-extrabold">{data.performanceIncentives || 'N/A'}</span></li>
                      <li className="flex items-center gap-1.5">• Membership Incentives (if applicable): <span className="text-green-700 font-extrabold">{data.membershipIncentives || 'N/A'}</span></li>
                      <li className="flex items-center gap-1.5 text-gray-700 font-normal">• Training & Guidance Support</li>
                      <li className="flex items-center gap-1.5 text-gray-700 font-normal">• Official ID Card</li>
                      <li className="flex items-center gap-1.5 text-gray-700 font-normal">• Campaign Materials & Operational Support</li>
                    </ul>
                    <p className="text-gray-500">Salary release timelines and incentive structures shall be governed as per company policy.</p>
                  </div>

                  {/* 4. NATURE OF WORK */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">4. NATURE OF WORK</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1">
                    <li className="flex items-center gap-1.5 text-gray-700">• Field visits and awareness activities</li>
                    <li className="flex items-center gap-1.5 text-gray-700">• Community interaction and meetings</li>
                    <li className="flex items-center gap-1.5 text-gray-700">• Reporting and campaign participation</li>
                    <li className="flex items-center gap-1.5 text-gray-700">• Assigned awareness programs</li>
                    <li className="flex items-center gap-1.5 text-gray-700">• Work allocation as determined by SakhiHub</li>
                  </ul>

                  {/* 5. CODE OF CONDUCT */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">5. CODE OF CONDUCT</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed">
                    <p className="mb-2 font-bold">Employee agrees to:</p>
                    <ul className="space-y-1.5 mb-3 list-none pl-1 text-gray-700">
                      <li className="flex items-center gap-1.5">• Maintain professionalism and discipline</li>
                      <li className="flex items-center gap-1.5">• Respect organizational policies</li>
                      <li className="flex items-center gap-1.5">• Avoid misleading commitments</li>
                      <li className="flex items-center gap-1.5">• Maintain respectful behaviour</li>
                      <li className="flex items-center gap-1.5">• Protect confidential information</li>
                      <li className="flex items-center gap-1.5">• Avoid misuse of organizational resources</li>
                    </ul>
                    <p className="italic text-red-600 font-bold">Any misconduct, fraud, misrepresentation or activity damaging the reputation of SakhiHub may result in immediate termination.</p>
                  </div>

                  {/* 6. CONFIDENTIALITY CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">6. CONFIDENTIALITY CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed">
                    Employee Data, Campaign Data, Membership Information, Vendor Information, Training Materials, Operational Systems, and Internal Reports shall remain confidential and shall not be disclosed without written approval.
                  </p>

                  {/* 7. DIGITAL ACCEPTANCE & PORTAL AGREEMENT */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">7. DIGITAL ACCEPTANCE & PORTAL AGREEMENT</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Digital acceptance through Portal, OTP, Checkbox or E-Sign shall constitute valid acceptance.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Digitally submitted information shall be treated as valid organizational records.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Employee confirms that all information submitted is genuine and correct.</span></li>
                  </ul>

                  {/* 8. VERIFICATION & TERMINATION POLICY */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">8. VERIFICATION & TERMINATION POLICY</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">SakhiHub reserves the right to verify documents and background information.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">False information or fake documents may result in immediate termination.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Company reserves the right to modify or discontinue operational activities.</span></li>
                  </ul>

                  {/* 9. INDEPENDENT OPERATIONAL CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">9. INDEPENDENT OPERATIONAL CLAUSE</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Campaign activities are awareness-based.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Structures may vary state-wise and district-wise.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Incentives depend upon organizational policies and performance.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Operational decisions remain under SakhiHub authority.</span></li>
                  </ul>

                  {/* 10. DECLARATION BY CANDIDATE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">10. DECLARATION BY CANDIDATE</h3>
                  <div className="text-xs mb-6 text-justify leading-relaxed">
                    <p className="mb-2 font-bold">I confirm that:</p>
                    <ul className="space-y-1.5 list-none pl-1 text-gray-700">
                      <li className="flex items-center gap-1.5">• I have read and understood this Offer Letter.</li>
                      <li className="flex items-center gap-1.5">• I agree to comply with SakhiHub policies.</li>
                      <li className="flex items-center gap-1.5">• Information submitted by me is true and correct.</li>
                      <li className="flex items-center gap-1.5">• Violation of company policies may result in termination.</li>
                      <li className="flex items-center gap-1.5">• I voluntarily accept this opportunity.</li>
                    </ul>
                  </div>

                  {/* 11. EMPLOYMENT NATURE & PROBATION CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">11. EMPLOYMENT NATURE & PROBATION CLAUSE</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Initial Probation Period: 3 Months</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Performance shall be evaluated continuously.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">SakhiHub may confirm, extend, suspend or discontinue engagement.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Employment remains subject to satisfactory performance.</span></li>
                  </ul>

                  {/* 12. TRANSFER & ASSIGNMENT CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">12. TRANSFER & ASSIGNMENT CLAUSE</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">SakhiHub may transfer employee to any district, block, tehsil, state, project or department.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Employee agrees to cooperate with such assignments.</span></li>
                  </ul>

                  {/* 13. MEMBERSHIP & GROUP OWNERSHIP CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">13. MEMBERSHIP & GROUP OWNERSHIP CLAUSE</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">All groups, members and awareness networks shall remain exclusive property of SakhiHub.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Employee shall have no ownership rights over organizational databases.</span></li>
                  </ul>

                  {/* 14. DATA PROTECTION & PORTAL ACCESS CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">14. DATA PROTECTION & PORTAL ACCESS CLAUSE</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Login credentials and operational data shall remain confidential.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Unauthorized sharing or misuse shall be treated as misconduct.</span></li>
                  </ul>

                  {/* 15. RESIGNATION & EXIT POLICY */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">15. RESIGNATION & EXIT POLICY</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Employee may resign as per company policy.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Exit formalities must be completed before settlement.</span></li>
                  </ul>

                  {/* 16. NON-SOLICITATION CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">16. NON-SOLICITATION CLAUSE</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Employee shall not induce members, employees, vendors or partners to leave SakhiHub.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Restriction shall remain applicable during employment and for 12 months after separation.</span></li>
                  </ul>

                  {/* 17. INTELLECTUAL PROPERTY CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">17. INTELLECTUAL PROPERTY CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    All content, reports, documents, presentations, photographs, videos and training materials created during employment shall remain property of SakhiHub.
                  </p>

                  {/* 18. RECOVERY CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">18. RECOVERY CLAUSE</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Financial loss, fraud, unauthorized collection or policy violations may result in recovery proceedings.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Incentives may be withheld pending investigation.</span></li>
                  </ul>

                  {/* 19. JURISDICTION CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">19. JURISDICTION CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    All disputes shall be subject exclusively to the jurisdiction of competent courts located at <strong>Indore, Madhya Pradesh</strong>.
                  </p>

                  {/* 20. FINAL AUTHORITY CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">20. FINAL AUTHORITY CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    SakhiHub shall have final authority regarding verification, performance evaluation, incentive approval, membership validation and operational decisions.
                  </p>

                  {/* 21. ATTENDANCE & REPORTING CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">21. ATTENDANCE & REPORTING CLAUSE</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Daily attendance and reporting are mandatory.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">Salary, petrol allowance and incentives may be linked to reporting compliance.</span></li>
                  </ul>

                  {/* 22. COMPANY PROPERTY CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">22. COMPANY PROPERTY CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    All ID Cards, Documents, Training Material, Portal Access and Company Assets remain property of SakhiHub.
                  </p>

                  {/* 23. NO UNAUTHORIZED COLLECTION CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">23. NO UNAUTHORIZED COLLECTION CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    Employee shall not collect money in the name of SakhiHub without written authorization.
                  </p>

                  {/* 24. LEGAL COMPLIANCE CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">24. LEGAL COMPLIANCE CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    Employee shall comply with all applicable laws and organizational policies.
                  </p>

                  {/* 25. ENTIRE AGREEMENT CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">25. ENTIRE AGREEMENT CLAUSE</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1">This Offer Letter, Portal Acceptance, Policies and future updates shall collectively form the employment understanding between employee and SakhiHub.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1">SakhiHub may revise policies from time to time.</span></li>
                  </ul>

                  {/* 26. BACKGROUND VERIFICATION CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">26. BACKGROUND VERIFICATION CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    SakhiHub may verify educational, identity, address, experience and criminal background information.
                  </p>

                  {/* 27. MEDICAL & FITNESS DECLARATION CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">27. MEDICAL & FITNESS DECLARATION CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    Employee confirms physical and mental fitness to perform assigned duties.
                  </p>

                  {/* 28. SURVIVAL CLAUSE */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">28. SURVIVAL CLAUSE</h3>
                  <p className="text-xs mb-6 text-justify leading-relaxed text-gray-700">
                    Confidentiality, Data Protection, Intellectual Property, Recovery Rights, Jurisdiction and Group Ownership Clauses shall survive resignation, suspension or termination.
                  </p>

                  {/* 29. SECURITY DEPOSIT & REFUND POLICY */}
                  <h3 className="text-sm font-black uppercase text-[#D91656] mb-3 border-b border-gray-200 pb-1">29. SECURITY DEPOSIT & REFUND POLICY</h3>
                  <ul className="text-xs space-y-1.5 mb-6 list-none pl-1 text-gray-700">
                    <li className="flex items-start gap-1.5">• <span className="flex-1"><strong>Security Deposit Amount:</strong> ₹{data.depositAmount || '2,000'}</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1"><strong>Refund Eligibility Period:</strong> 90 Days (3 Months) of continuous service.</span></li>
                    <li className="flex items-start gap-1.5">• <span className="flex-1"><strong>Refund Policy & Conditions:</strong> The employee security deposit shall become refundable only after successful completion of 90 days (3 months) of continuous service. If the employee leaves, resigns, abandons duties, or is terminated before completion of 90 days, the security deposit shall not be refundable.</span></li>
                  </ul>
                </>
              )}

              {/* Keep notice and signatures together in print */}
              <div className="keep-together">
                {/* IMPORTANT NOTICE */}
                <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                  <h4 className="text-xs font-black uppercase text-gray-800 mb-1">IMPORTANT NOTICE</h4>
                  <p className="text-[11px] text-justify leading-relaxed text-gray-600">
                    This Offer Letter is issued for organizational engagement under SakhiHub Awareness Programs and shall not be construed as a guarantee of permanent employment, fixed tenure employment or lifetime engagement.
                  </p>
                </div>

                {/* Signatures & Acceptance */}
                <div className="grid grid-cols-2 gap-8 pt-8 mt-16 border-t border-gray-200 signatures-container">
                  {/* Candidate Acceptance */}
                  <div className="space-y-4 flex flex-col justify-end min-h-[180px]">
                    <div className="mb-auto">
                      <h4 className="text-xs font-black uppercase text-gray-800 tracking-wider">CANDIDATE DIGITAL ACCEPTANCE</h4>
                      <div className="flex items-center gap-2 mb-2 mt-3">
                        <input type="checkbox" checked={data.documentStatus === 'accepted' || data.documentStatus === 'approved'} readOnly className="h-4.5 w-4.5 text-[#D91656] rounded border-gray-300 focus:ring-[#D91656]" />
                        <span className="text-xs font-bold text-gray-700">I Agree to the Terms & Conditions</span>
                      </div>
                    </div>
                    <div className="text-xs space-y-1.5 text-gray-600">
                      <p>Candidate Name: <span className="font-bold text-gray-900">{data.employeeName}</span></p>
                      <p>Mobile Number: <span className="font-bold text-gray-900">{data.mobile}</span></p>
                      <p>Date: <span className="font-bold text-gray-900">{data.documentStatus === 'accepted' || data.documentStatus === 'approved' ? formatDate(new Date()) : '____________________'}</span></p>
                      <p className="text-[10px] text-gray-400 mt-2 font-mono">
                        {data.documentStatus === 'accepted' || data.documentStatus === 'approved' ? `Signed Digitally via OTP verification` : 'Digital Signature Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Authorized By */}
                  <div className="text-center flex flex-col justify-between items-center relative min-h-[180px] pl-6 border-l border-gray-100">
                    <div className="w-full h-20 flex items-center justify-center mb-2">
                      <img src="/manager-signature.png" alt="Manager Signature" className="h-16 w-auto object-contain opacity-85" />
                    </div>
                    <div className="w-full text-center">
                      <h4 className="text-xs font-black uppercase text-gray-900 tracking-wider border-t border-gray-400 pt-2">AUTHORIZED BY</h4>
                      <p className="text-[11px] font-bold text-[#D91656] uppercase tracking-wide mt-1">SakhiHub</p>
                      <p className="text-[9px] text-gray-400 uppercase mt-0.5">Women Health & Awareness Campaign</p>
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-0.5">Official Digital Employment & Awareness Portal</p>
                    </div>
                  </div>
                </div>

                {/* Footer System Notice */}
                <div className="mt-12 pt-4 border-t border-gray-100 text-center text-[9px] text-gray-400 uppercase tracking-widest leading-normal">
                  This is a system generated digital offer letter. Digital acceptance via the SakhiHub portal is legally binding.
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot className="hidden print:table-footer-group">
          <tr>
            <td>
              {/* Running Print Footer: email | sakhihub | address */}
              <div className="h-[12mm] border-t border-gray-200 flex items-center text-[10px] font-sans px-[12mm] mt-2 gap-2 print-footer-content">
                <span>Address: Pu 4, Behind C21 Mall, Scheme 54, Indore, Madhya Pradesh 452010</span>
                <span className="text-gray-300">|</span>
                <span>Email: <a href="mailto:support@sakhihub.com">support@sakhihub.com</a></span>
                <span className="text-gray-300">|</span>
                <span>Website: <a href="https://www.sakhihub.com" target="_blank" rel="noopener noreferrer" className="font-bold uppercase tracking-wider">www.sakhihub.com</a></span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default EmployeeOfferLetterPreview;
