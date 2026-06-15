import fs from 'fs';
import path from 'path';

// Generate raw HTML for DocumentHeader to avoid react-dom/server Turbopack build errors
const generateDocumentHeaderHtml = (logoSrc: string, noPadding: boolean = false) => {
  const paddingVal = noPadding ? '0' : '0 12mm';
  return `
    <div class="w-full font-sans select-none" style="width: 100%; box-sizing: border-box; padding-top: 0px; font-family: sans-serif;">
      
      <!-- 1. Main Letterhead Content Container -->
      <div style="padding: ${paddingVal}; box-sizing: border-box; width: 100%;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0; table-layout: fixed;">
          <tr>
            <!-- Left Branding Area -->
            <td style="width: 55%; padding: 0; border: none; vertical-align: middle; text-align: left;">
              <table style="border-collapse: collapse; border: none; margin: 0; padding: 0; width: auto;">
                <tr>
                  <td style="padding: 0; border: none; vertical-align: middle;">
                    <img 
                      src="${logoSrc}" 
                      alt="SakhiHub Logo" 
                      style="height: 52px; width: auto; object-fit: contain; display: block;" 
                    />
                  </td>
                  <td style="padding: 0; border: none; vertical-align: middle;">
                    <div 
                      style="width: 2.5px; height: 48px; background-color: #D91656; margin: 0 16px; border-radius: 1px;" 
                    ></div>
                  </td>
                  <td style="padding: 0; border: none; vertical-align: middle; text-align: left; line-height: 1.2;">
                    <span style="font-size: 24px; font-weight: 800; color: #D91656; letter-spacing: 0.2px; display: block;">
                      SakhiHub
                    </span>
                    <span style="font-size: 11.5px; color: #6A1B9A; font-weight: bold; font-style: italic; margin-top: 3px; display: block;">
                      Empowering Women Across India
                    </span>
                    <span style="font-size: 9px; color: #374151; font-weight: 500; margin-top: 5px; display: block;">
                      Reg No :- IND26S02588604481
                    </span>
                  </td>
                </tr>
              </table>
            </td>

            <!-- Right Contact Info Area -->
            <td style="width: 45%; padding: 0; border: none; vertical-align: middle; text-align: right;">
              <table style="border-collapse: collapse; border: none; margin: 0; padding: 0; width: 100%;">
                <!-- Row 1: Website -->
                <tr>
                  <td style="padding: 2px 0; border: none; text-align: right; font-size: 11px; color: #374151; vertical-align: middle;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span style="font-weight: bold; color: #6A1B9A; margin-right: 4px; display: inline-block; vertical-align: middle;">Website :</span>
                    <a href="https://www.sakhihub.com" target="_blank" rel="noopener noreferrer" style="color: #D91656; font-weight: bold; text-decoration: none; display: inline-block; vertical-align: middle;">
                      www.sakhihub.com
                    </a>
                  </td>
                </tr>
                <!-- Row 2: Email -->
                <tr>
                  <td style="padding: 2px 0; border: none; text-align: right; font-size: 11px; color: #374151; vertical-align: middle;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span style="font-weight: bold; color: #6A1B9A; margin-right: 4px; display: inline-block; vertical-align: middle;">Email :</span>
                    <a href="mailto:info@sakhihub.com" style="color: #6A1B9A; text-decoration: none; display: inline-block; vertical-align: middle;">
                      info@sakhihub.com
                    </a>
                  </td>
                </tr>
                <!-- Row 3: Contact -->
                <tr>
                  <td style="padding: 2px 0; border: none; text-align: right; font-size: 11px; color: #374151; vertical-align: middle;">
                    <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #6A1B9A; display: inline-block; vertical-align: middle; margin-right: 8px; text-align: center; line-height: 14px;">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -3px;">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <span style="font-weight: bold; color: #6A1B9A; margin-right: 4px; display: inline-block; vertical-align: middle;">Contact :</span>
                    <span style="font-weight: bold; color: #6A1B9A; display: inline-block; vertical-align: middle;">+91 8062179122</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- 2. Address Pill with Decorative Skewed Ribbons -->
      <div style="padding: ${paddingVal}; box-sizing: border-box; width: 100%;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 6px; padding: 0; table-layout: fixed;">
          <tr>
            <!-- Left Decorative Ribbon -->
            <td style="width: 52px; padding: 0; border: none; vertical-align: middle; text-align: left;">
              <div style="display: flex; transform: skewX(-25deg); height: 18px; overflow: hidden; width: 52px;">
                <div style="width: 28px; height: 100%; background-color: #D91656; flex-shrink: 0;" ></div>
                <div style="width: 18px; height: 100%; background-color: #6A1B9A; flex-shrink: 0;" ></div>
                <div style="width: 6px; height: 100%; background-color: #D91656; flex-shrink: 0;" ></div>
              </div>
            </td>

            <!-- Center Rounded Address Pill -->
            <td style="padding: 0 12px; border: none; vertical-align: middle; text-align: center;">
              <div 
                style="background: linear-gradient(to right, #FFF2F6, #F9F0FF); border: 1px solid #FBCFE8; border-radius: 25px; padding: 4px 14px; display: block; font-size: 9.5px; color: #374151; font-weight: 500; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02); box-sizing: border-box; white-space: nowrap; overflow: hidden; text-align: center;"
              >
                <!-- Map Pin SVG Icon inside a solid purple circle -->
                <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #6A1B9A; display: inline-block; vertical-align: middle; margin-right: 8px; text-align: center; line-height: 14px;">
                  <svg width="8" height="8" viewBox="0 0 12 15" fill="none" style="color: #FFFFFF; display: inline-block; vertical-align: middle; margin-top: -3px;">
                    <path d="M6 0C2.69 0 0 2.69 0 6C0 10.5 6 15 6 15C6 15 12 10.5 12 6C12 2.69 9.31 0 6 0ZM6 8.25C4.76 8.25 3.75 7.24 3.75 6C3.75 4.76 4.76 3.75 6 3.75C7.24 3.75 8.25 4.76 8.25 6C8.25 7.24 7.24 8.25 6 8.25Z" fill="currentColor"/>
                  </svg>
                </div>
                <span style="display: inline-block; vertical-align: middle;">
                  <span style="font-weight: bold; color: #6A1B9A; margin-right: 4px;">Address :</span> Pu 4, Behind C21 Mall, Scheme 54, Indore, Madhya Pradesh 452010
                </span>
              </div>
            </td>

            <!-- Right Decorative Ribbon -->
            <td style="width: 52px; padding: 0; border: none; vertical-align: middle; text-align: right;">
              <div style="display: flex; transform: skewX(25deg); height: 18px; overflow: hidden; width: 52px; float: right;">
                <div style="width: 6px; height: 100%; background-color: #D91656; flex-shrink: 0;" ></div>
                <div style="width: 18px; height: 100%; background-color: #6A1B9A; flex-shrink: 0;" ></div>
                <div style="width: 28px; height: 100%; background-color: #D91656; flex-shrink: 0;" ></div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- 3. Bottom Gradient Divider Line -->
      <div 
        style="height: 4px; width: 100%; background: linear-gradient(to right, #D91656, #6A1B9A); margin-top: 6px; margin-bottom: 8px;" 
      />
    </div>
  `;
};

export const generateAgreementHtml = (data: any) => {
  const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const companyName = "SakhiHub";
  const companyAddress = "PU-4, Behind C21 Mall, Scheme No. 54, Indore, Madhya Pradesh – 452010";
  const headingTitle = data.partnerType || "VENDOR / NGO PARTNERSHIP AGREEMENT";
  const isSubVendor = data.role === 'sub_vendor' || (data.partnerType && data.partnerType.toUpperCase().includes('SUB VENDOR'));

  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoData = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
  } catch (e) {
    console.error('Logo image not found:', e);
  }

  const headerHtml = generateDocumentHeaderHtml(logoBase64, true);

  let signatureBase64 = '';
  try {
    const sigPath = path.join(process.cwd(), 'public', 'manager-signature.png');
    const sigData = fs.readFileSync(sigPath);
    signatureBase64 = `data:image/png;base64,${sigData.toString('base64')}`;
  } catch (e) {
    console.error('Signature image not found:', e);
  }



  // 55 Clauses definition
  const clauses = [
    {
      id: 1,
      title: "1. PURPOSE OF AGREEMENT",
      content: "The Vendor shall assist SakhiHub in awareness campaign expansion, employee coordination, group formation, membership awareness, reporting and operational support activities."
    },
    {
      id: 2,
      title: "2. NATURE OF RELATIONSHIP",
      content: `2.1 Vendor shall act as an Independent Vendor Partner.<br/>
      2.2 Nothing contained herein shall create:
      <div class="bullet-list">
        • Employer-Employee Relationship<br/>
        • Partnership Firm<br/>
        • Franchise Relationship<br/>
        • Joint Venture<br/>
        • Agency Relationship
      </div>
      between Vendor and SakhiHub.<br/>
      2.3 Vendor shall not represent itself as owner, franchise owner, legal representative or authorized signatory of SakhiHub.`
    },
    {
      id: 3,
      title: "3. VENDOR SUBSCRIPTION FEE",
      content: `3.1 Vendor shall pay a non-refundable Platform Subscription Fee of ₹1000.<br/>
      3.2 Subscription Fee grants access to:
      <div class="bullet-list">
        • Vendor Panel<br/>
        • Training Resources<br/>
        • Program Access<br/>
        • Operational Support
      </div>
      3.3 Subscription Fee shall not be refundable under any circumstances.`
    },
    {
      id: 4,
      title: "4. EMPLOYEE OWNERSHIP CLAUSE",
      content: `4.1 All Employees shall remain employees of SakhiHub.<br/>
      4.2 Offer Letter, Appointment, Training, ID Card, Reporting, Transfer and Termination rights shall remain exclusively with SakhiHub.<br/>
      4.3 Vendor shall have no ownership rights over any employee.<br/>
      4.4 Vendor shall not claim employment rights over Company employees.`
    },
    {
      id: 5,
      title: "5. MEMBER & GROUP OWNERSHIP CLAUSE",
      content: `5.1 All Members, Groups, Beneficiaries, Community Networks and Campaign Records shall remain the sole property of SakhiHub.<br/>
      5.2 Vendor shall not claim ownership over any Member, Group or Database.<br/>
      5.3 Upon termination, all records shall remain with SakhiHub.`
    },
    {
      id: 6,
      title: "6. VENDOR RESPONSIBILITIES",
      content: `Vendor shall:
      <div class="bullet-list">
        • Support recruitment<br/>
        • Monitor employee activities<br/>
        • Support awareness campaigns<br/>
        • Promote membership awareness<br/>
        • Submit reports<br/>
        • Coordinate field activities<br/>
        • Follow Company Guidelines
      </div>`
    },
    {
      id: 7,
      title: "7. EMPLOYEE TARGET SYSTEM",
      content: `Vendor shall ensure:
      <div class="bullet-list">
        • 1 Employee = 50 Groups<br/>
        • 1 Group = 10 Women<br/>
        • 1 Employee Reach = 500 Women<br/>
        • Minimum Membership Awareness Target = 60%
      </div>
      Company reserves the right to revise targets.`
    },
    {
      id: 8,
      title: "8. COMMISSION STRUCTURE",
      content: `Vendor shall receive: <strong>₹${data.employeeCommissionAmount || '500'} Per Active Employee Per Month</strong><br/>
      Conditions:
      <div class="bullet-list">
        • Employee must be active<br/>
        • Employee must be verified<br/>
        • Reporting must be completed<br/>
        • Performance must be satisfactory
      </div>
      Company decision shall be final.`
    },
    {
      id: 9,
      title: "9. MEMBERSHIP INCENTIVE",
      content: `Vendor shall receive: <strong>₹${data.membershipIncentiveAmount || (isSubVendor ? '5' : '10')} Per Successful Paid Membership</strong><br/>
      Conditions:
      <div class="bullet-list">
        • Valid Membership<br/>
        • Successful Payment<br/>
        • Company Verification<br/>
        • No Refund/Fraud
      </div>`
    },
    {
      id: 10,
      title: "10. PAYMENT CONDITIONS",
      content: `All incentives shall be subject to Company verification.<br/>
      Company may:
      <div class="bullet-list">
        • Hold Payments | • Adjust Payments | • Suspend Payments | • Recover Excess Payments
      </div>
      where discrepancies are identified.`
    },
    {
      id: 11,
      title: "11. NO TERRITORY OWNERSHIP",
      content: `Vendor acknowledges that:
      <div class="bullet-list">
        • No District Ownership is granted.<br/>
        • No State Ownership is granted.<br/>
        • No Exclusive Territory Rights are granted.
      </div>
      Company may appoint additional Vendors in the same territory.`
    },
    {
      id: 12,
      title: "12. MULTI-VENDOR CLAUSE",
      content: "Company reserves the right to appoint multiple vendors within the same district, block, tehsil or state. Vendor shall not object to such appointments."
    },
    {
      id: 13,
      title: "13. STATE OPERATIONAL PRIORITY & PERFORMANCE PROTECTION",
      content: `13.1 Where a Vendor has been officially assigned a particular State for the SakhiHub Awareness Program, SakhiHub shall not appoint any additional Vendor, NGO Partner or equivalent operational partner for the same SakhiHub Awareness Program within that assigned State, provided the Vendor continues to perform satisfactorily and remains fully compliant with Company policies, reporting requirements, membership targets, employee management standards and operational obligations.<br/>
      13.2 The Vendor shall be granted operational priority for the assigned State for the SakhiHub Awareness Program during the validity of the Agreement, subject to continued satisfactory performance.<br/>
      13.3 Further, for any future projects, programs or expansion opportunities introduced by SakhiHub within the assigned State, the existing Vendor shall be given first preference for consideration, subject to eligibility, performance, operational capability and Company requirements. However, SakhiHub shall retain the sole discretion regarding final appointment and project allocation.<br/>
      13.4 In the event that the Vendor's performance is found to be unsatisfactory, including but not limited to poor reporting, inactive operations, target non-achievement, employee management issues, compliance failures or other operational deficiencies, SakhiHub shall issue a written Performance Improvement Notice and provide the Vendor with a period of ten (10) days to rectify the deficiencies.<br/>
      13.5 Upon completion of the 10-day review period, if the Vendor fails to demonstrate satisfactory improvement as determined by SakhiHub, the Company shall have the right to terminate the Vendor's operational priority and/or Agreement and appoint another Vendor, NGO Partner or operational representative for the concerned State without any further obligation.`
    },
    {
      id: 14,
      title: "14. CONFIDENTIALITY",
      content: `Vendor shall maintain confidentiality of:
      <div class="bullet-list">
        • Employee Data | • Member Data | • Reports | • Training Materials | • Internal Systems | • Operational Information
      </div>
      This obligation survives termination.`
    },
    {
      id: 15,
      title: "15. DATA PROTECTION",
      content: `Vendor shall not:
      <div class="bullet-list">
        • Copy Data | • Export Data | • Sell Data | • Share Data | • Download Data without authorization
      </div>
      All data belongs exclusively to SakhiHub.`
    },
    {
      id: 16,
      title: "16. FRAUD PREVENTION",
      content: `The following are strictly prohibited:
      <div class="bullet-list">
        • Fake Memberships | • Duplicate Memberships | • Fake Attendance | • Fake Reporting | • Identity Fraud | • Forged Documents
      </div>
      Any such activity may result in immediate termination.`
    },
    {
      id: 17,
      title: "17. RECOVERY RIGHTS",
      content: `Company may recover losses arising from:
      <div class="bullet-list">
        • Fraud | • Misrepresentation | • Fake Memberships | • Data Theft | • Financial Loss
      </div>
      Recovery may be adjusted from future payments.`
    },
    {
      id: 18,
      title: "18. NON-POACHING CLAUSE",
      content: "Vendor shall not recruit or induce SakhiHub employees, members, partners or vendors to leave SakhiHub. This restriction shall continue for 24 months after termination."
    },
    {
      id: 19,
      title: "19. BRAND PROTECTION",
      content: `Vendor shall not misuse:
      <div class="bullet-list">
        • SakhiHub Name | • Logo | • Website | • Training Material | • Marketing Content
      </div>
      without written approval.`
    },
    {
      id: 20,
      title: "20. SOCIAL MEDIA RESTRICTIONS",
      content: "Vendor shall not issue public announcements, media statements or press releases on behalf of SakhiHub without written authorization."
    },
    {
      id: 21,
      title: "21. AUDIT RIGHTS",
      content: `Company may conduct:
      <div class="bullet-list">
        • Physical Audits | • Digital Audits | • Membership Verification | • Employee Verification
      </div>
      at any time. Vendor shall cooperate fully.`
    },
    {
      id: 22,
      title: "22. SUSPENSION RIGHTS",
      content: `Company may suspend Vendor immediately for:
      <div class="bullet-list">
        • Fraud | • Policy Violation | • Brand Misuse | • Data Misuse | • Poor Performance
      </div>`
    },
    {
      id: 23,
      title: "23. TERMINATION",
      content: `Company may terminate this Agreement immediately without notice for:
      <div class="bullet-list">
        • Fraud | • Fake Reporting | • Criminal Activity | • Brand Damage | • Policy Violation
      </div>`
    },
    {
      id: 24,
      title: "24. NO COMPENSATION CLAIM",
      content: "Vendor shall not claim future earnings, damages or compensation arising from termination."
    },
    {
      id: 25,
      title: "25. INDEMNITY",
      content: "Vendor shall indemnify SakhiHub against all claims, damages, penalties and legal costs arising from Vendor actions."
    },
    {
      id: 26,
      title: "26. JURISDICTION",
      content: "All disputes shall be subject exclusively to the competent courts located in: <strong>Indore, Madhya Pradesh</strong>. Vendor expressly agrees to such jurisdiction."
    },
    {
      id: 27,
      title: "27. DIGITAL ACCEPTANCE",
      content: "Portal Acceptance, OTP Verification, E-Signature, Digital Signature or Online Approval shall constitute valid legal acceptance of this Agreement."
    },
    {
      id: 28,
      title: "28. FINAL AUTHORITY",
      content: `Company decisions relating to:
      <div class="bullet-list">
        • Membership Verification | • Incentive Approval | • Employee Verification | • Operational Matters | • Policy Interpretation
      </div>
      shall be final and binding.`
    },
    {
      id: 29,
      title: "29. NO PERMANENT COMMISSION CLAUSE",
      content: "Vendor acknowledges that commission and incentive structures are policy-based benefits and do not create any vested, permanent or lifetime rights. Company may revise, suspend or discontinue any commission structure at its sole discretion. Vendor shall not claim compensation for such revision."
    },
    {
      id: 30,
      title: "30. NO EXCLUSIVE RIGHTS CLAUSE",
      content: "This Agreement does not grant any exclusive rights over any district, block, tehsil, state, territory, members, groups or employees. Company may appoint any number of vendors, coordinators, agencies or representatives in the same territory."
    },
    {
      id: 31,
      title: "31. MEMBER VALIDATION CLAUSE",
      content: "Only memberships verified and approved by SakhiHub shall be eligible for incentive calculation. Company reserves the right to reject, suspend or cancel memberships without assigning any reason. No incentive shall be payable on rejected, cancelled or disputed memberships."
    },
    {
      id: 32,
      title: "32. EMPLOYEE REPLACEMENT LIABILITY",
      content: "If Vendor-referred employees are repeatedly non-performing, fraudulent, absent or non-compliant, Company may require replacement. Failure to provide suitable replacements may result in suspension or termination of Vendor status."
    },
    {
      id: 33,
      title: "33. REPUTATION DAMAGE CLAUSE",
      content: "Any action, statement, social media post, communication or conduct that harms the reputation, goodwill, credibility or public image of SakhiHub shall constitute a material breach of this Agreement. Company may immediately terminate the Agreement and pursue legal remedies."
    },
    {
      id: 34,
      title: "34. NO AUTHORITY TO BIND COMPANY",
      content: "Vendor shall not enter into any agreement, commitment, financial obligation, employment promise, partnership arrangement or legal undertaking on behalf of SakhiHub. Any such action shall be solely at Vendor’s risk and responsibility."
    },
    {
      id: 35,
      title: "35. NO CASH COLLECTION CLAUSE",
      content: "Vendor shall not collect any membership fees, registration charges, donations, service fees or other payments in cash on behalf of SakhiHub unless specifically authorized in writing. Unauthorized collection may result in immediate termination and recovery proceedings."
    },
    {
      id: 36,
      title: "36. SURVIVAL OF OBLIGATIONS",
      content: "Confidentiality, Data Protection, Recovery Rights, Intellectual Property, Non-Poaching, Jurisdiction, Member Ownership and Group Ownership clauses shall survive termination and remain enforceable."
    },
    {
      id: 37,
      title: "37. RIGHT TO MODIFY PROGRAM",
      content: "Company may modify, suspend, restructure, merge or discontinue any campaign, incentive model, operational structure, membership program or activity at any time. Vendor shall not claim damages or compensation due to such changes."
    },
    {
      id: 38,
      title: "38. FORCEFUL RECOVERY CONSENT",
      content: "Vendor agrees that any proven financial loss caused by fraud, fake memberships, data misuse, forged records or policy violations may be recovered from any outstanding incentives, commissions or payable amounts."
    },
    {
      id: 39,
      title: "39. DIGITAL RECORDS EVIDENCE CLAUSE",
      content: "Vendor agrees that portal logs, attendance records, OTP logs, uploaded documents, digital signatures, communication records and system reports shall constitute valid operational evidence for decision-making."
    },
    {
      id: 40,
      title: "40. ENTIRE AGREEMENT CLAUSE",
      content: "This Agreement, portal acceptance, digital declarations, future policy updates and operational guidelines issued by SakhiHub collectively constitute the entire understanding between the parties."
    },
    {
      id: 41,
      title: "41. COMPANY FINAL DECISION CLAUSE",
      content: `For matters relating to:
      <div class="bullet-list">
        • Vendor Approval | • Membership Validation | • Incentive Calculation | • Employee Status | • Territory Allocation | • Operational Policies | • Compliance Review
      </div>
      The decision of SakhiHub shall be final for operational purposes and binding under this Agreement.`
    },
    {
      id: 42,
      title: "42. NO EMPLOYMENT CLAIM CLAUSE",
      content: "Vendor acknowledges that no employee engaged under SakhiHub programs shall be deemed an employee, agent, representative or worker of the Vendor. Vendor shall not claim any employment rights, management rights or employer authority over SakhiHub employees."
    },
    {
      id: 43,
      title: "43. NO MEMBER DATABASE RIGHTS CLAUSE",
      content: "Vendor expressly waives all rights, title and interest in any membership database, lead database, women groups, beneficiary records, campaign records or contact information generated through SakhiHub activities. All such information shall remain exclusive property of SakhiHub."
    },
    {
      id: 44,
      title: "44. NON-COMPETE CLAUSE",
      content: "During the term of this Agreement and for a period of 24 months after termination, Vendor shall not use SakhiHub training material, operational models, campaign structures, databases, member networks or confidential information to establish or support a competing program."
    },
    {
      id: 45,
      title: "45. VENDOR ACCOUNT SUSPENSION CLAUSE",
      content: "SakhiHub reserves the right to temporarily suspend Vendor access, Vendor Panel access, reporting rights, incentive eligibility or operational privileges whenever policy violations, investigations or operational concerns arise. No compensation shall be payable during suspension."
    },
    {
      id: 46,
      title: "46. NO ASSIGNMENT CLAUSE",
      content: "Vendor shall not transfer, assign, sublicense, sell or delegate its rights or obligations under this Agreement to any third party without prior written approval from SakhiHub."
    },
    {
      id: 47,
      title: "47. RECORD RETENTION CLAUSE",
      content: "Vendor shall maintain accurate operational records, membership records and campaign records for a minimum period of three (3) years and shall provide such records whenever requested by SakhiHub."
    },
    {
      id: 48,
      title: "48. COMPLIANCE WITH COMPANY POLICIES",
      content: "Vendor agrees to comply with all present and future policies, SOPs, operational manuals, portal guidelines, reporting formats and instructions issued by SakhiHub from time to time. Such policies shall form an integral part of this Agreement."
    },
    {
      id: 49,
      title: "49. NO PUBLIC REPRESENTATION CLAUSE",
      content: "Vendor shall not represent itself as owner, co-owner, founder, co-founder, franchise owner, state head, district owner or legal authority of SakhiHub. Vendor may only represent itself as an authorized Vendor / NGO Partner of SakhiHub."
    },
    {
      id: 50,
      title: "50. SEVERABILITY CLAUSE",
      content: "If any provision of this Agreement is held invalid, illegal or unenforceable by a competent authority, the remaining provisions shall continue in full force and effect."
    },
    {
      id: 51,
      title: "51. BINDING EFFECT CLAUSE",
      content: "This Agreement shall be binding upon the Vendor, its representatives, successors, assigns, office bearers, trustees, directors, employees and authorized representatives. All obligations contained herein shall continue to apply as permitted by law."
    },
    {
      id: 52,
      title: "52. ANTI-BRIBERY & ANTI-CORRUPTION CLAUSE",
      content: "Vendor shall not offer, promise, authorize or provide any unlawful payment, benefit, gift, commission or advantage in connection with SakhiHub operations. Any violation shall result in immediate termination."
    },
    {
      id: 53,
      title: "53. GOVERNMENT COMPLIANCE CLAUSE",
      content: "Vendor shall comply with all applicable laws, regulations, registrations, tax requirements and governmental directions applicable to its operations. Any liability arising from Vendor non-compliance shall remain Vendor's responsibility."
    },
    {
      id: 54,
      title: "54. NO PARTNERSHIP PROPERTY RIGHTS CLAUSE",
      content: "Vendor shall not claim ownership, tenancy rights, possession rights or proprietary rights over any SakhiHub office, infrastructure, portal, system, territory, project, database or operational asset."
    },
    {
      id: 55,
      title: "55. LIMITATION OF LIABILITY CLAUSE",
      content: "Under no circumstances shall SakhiHub be liable for indirect, consequential, incidental, special or business losses suffered by Vendor. Maximum liability, if any, shall not exceed the amount payable to Vendor under this Agreement."
    },
    {
      id: 56,
      title: "56. VOLUNTARY EXECUTION CLAUSE",
      content: "Vendor confirms that this Agreement has been read, understood and accepted voluntarily without coercion, undue influence or misrepresentation and shall be legally binding upon acceptance through signature, OTP verification, digital signature or portal approval."
    }
  ];

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${headingTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman:wght@400;700&display=swap');
        
        @page {
          size: A4;
          margin: 8mm 12mm 15mm 12mm;
        }
 
        body {
          font-family: 'Times New Roman', Times, serif;
          margin: 0;
          padding: 0;
          color: #222;
          background: #fff;
          font-size: 11px;
          line-height: 1.45;
          text-align: justify;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
 
        .agreement-document {
          width: 100%;
          table-layout: fixed;
          border: none;
          border-collapse: collapse;
          padding: 0;
          margin: 0;
        }
 
        .agreement-document > tbody,
        .agreement-document > tbody > tr,
        .agreement-document > tbody > tr > td {
          break-inside: auto !important;
          page-break-inside: auto !important;
        }
 
        .agreement-document > thead,
        .agreement-document > thead > tr,
        .agreement-document > thead > tr > td {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
 
        .agreement-content-cell {
          padding-bottom: 4px;
          padding-top: 3px;
        }
 
        thead {
          display: table-header-group !important;
        }
        
        tfoot {
          display: table-footer-group !important;
        }
        
        h1 {
          text-align: center;
          font-size: 16px;
          text-decoration: underline;
          text-transform: uppercase;
          margin-top: 5px;
          margin-bottom: 8px;
          font-weight: 700;
          line-height: 1.3;
        }
 
        .section-title {
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 700;
          margin-top: 8px;
          margin-bottom: 4px;
          border-bottom: 1px solid #111;
          padding-bottom: 2px;
          page-break-after: avoid;
        }
 
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
 
        .details-table td {
          padding: 3px 6px;
          border: 1px solid #aaa;
          font-size: 10.5px;
        }
 
        .parties-section {
          margin-bottom: 12px;
        }
 
        .party-block {
          margin-bottom: 8px;
          font-size: 11px;
          line-height: 1.4;
        }
 
        .clause-header {
          font-size: 13px;
          text-align: center;
          text-transform: uppercase;
          text-decoration: underline;
          font-weight: 700;
          margin-top: 8px;
          margin-bottom: 6px;
        }
 
        .clause-container {
          page-break-inside: auto;
          margin-bottom: 4px;
        }
 
        .clause-title {
          font-weight: 700;
          margin-bottom: 3px;
          font-size: 11px;
          text-transform: uppercase;
          page-break-after: avoid;
          break-after: avoid;
        }
 
        .clause {
          text-align: justify;
          margin-bottom: 3px;
          font-size: 11px;
          line-height: 1.35;
        }
 
        .bullet-list {
          margin-left: 15px;
          margin-top: 3px;
          margin-bottom: 3px;
          line-height: 1.35;
        }
 
        .text-underline {
          text-decoration: underline;
        }
 
        .bold {
          font-weight: 700;
        }
 
        .intro-statement {
          margin-bottom: 10px;
          line-height: 1.4;
          page-break-after: avoid;
        }
 
        .signatures-grid {
          margin-top: 10px;
        }
 
        .sig-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
 
        .signature-box {
          width: 45%;
          text-align: left;
          font-size: 11px;
        }
 
        .line {
          border-bottom: 1px solid #111;
          height: 24px;
          margin-bottom: 6px;
        }
 
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 90px;
          color: rgba(0, 0, 0, 0.03);
          z-index: -1000;
          pointer-events: none;
          font-weight: bold;
          text-transform: uppercase;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="watermark">SakhiHub Official</div>

      <table class="agreement-document">
        <thead>
          <tr>
            <td style="width: 100%;">
              ${headerHtml}
            </td>
          </tr>
        </thead>
        <tbody>
          <!-- ROW 1: TITLE & INTRO -->
          <tr>
            <td class="agreement-content-cell">
              <h1>${headingTitle}</h1>
              <div class="intro-statement">
                THIS ${headingTitle} (the "Agreement") is executed and made effective as of the Date of Execution specified below, by and between the following parties:
              </div>
            </td>
          </tr>

          <!-- ROW 2: PARTIES -->
          <tr>
            <td class="agreement-content-cell" style="padding-top: 0;">
              <div class="section-title">PARTIES TO THE AGREEMENT</div>
              <table class="details-table">
                <tr>
                  <td class="bold" style="width: 25%;">First Party (The Company)</td>
                  <td>
                    <strong>SakhiHub</strong>, having its principal place of business at PU-4, Behind C21 Mall, Scheme No. 54, Indore, Madhya Pradesh – 452010 (hereinafter referred to as the <strong>"Company"</strong>).
                  </td>
                </tr>
                <tr>
                  <td class="bold">Second Party (The Vendor / Partner)</td>
                  <td>
                    <strong>${data.vendorName}</strong>, having its address at ${data.address}${data.district ? ', ' + data.district : ''}${data.state ? ', ' + data.state : ''} (Authorized Representative: ${data.vendorName}, Mobile: ${data.mobile || 'N/A'}, Email: ${data.email || 'N/A'}) (hereinafter referred to as the <strong>"Vendor"</strong>).
                  </td>
                </tr>
              </table>
              <div class="intro-statement" style="margin-top: 10px;">
                The Company and the Vendor shall collectively be referred to as the <strong>"Parties"</strong> and individually as a <strong>"Party"</strong>.
              </div>
            </td>
          </tr>

          <!-- ROW 3: AGREEMENT DETAILS -->
          <tr>
            <td class="agreement-content-cell" style="padding-top: 0;">
              <div class="section-title">AGREEMENT DETAILS</div>
              <table class="details-table">
                <tr>
                  <td class="bold" style="width: 25%;">Agreement ID</td>
                  <td style="width: 25%;">${data.agreementId}</td>
                  <td class="bold" style="width: 25%;">Vendor Code</td>
                  <td style="width: 25%;">${data.vendorCode}</td>
                </tr>
                <tr>
                  <td class="bold">Date of Execution</td>
                  <td>${data.joiningDate}</td>
                  <td class="bold">Agreement Validity</td>
                  <td>${data.agreementValidity || '3 Years'}</td>
                </tr>
                <tr>
                  <td class="bold">Partner Assignment</td>
                  <td>${data.coordinatorType || 'N/A'}</td>
                  <td class="bold">Assigned Region(s)</td>
                  <td>${data.assignedRegions || 'N/A'}</td>
                </tr>
                <tr>
                  <td class="bold">QR Verification Code</td>
                  <td colspan="3">${data.qrVerificationCode}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ROW 4: TERMS HEADER -->
          <tr>
            <td class="agreement-content-cell" style="padding-top: 0;">
              <div class="clause-header">TERMS AND CONDITIONS</div>
            </td>
          </tr>

          <!-- ROWS 5 to 5+N: CLAUSES -->
          ${clauses.map(clause => `
          <tr>
            <td class="agreement-content-cell" style="padding-top: 0; padding-bottom: 8px;">
              <div class="clause-container">
                <div class="clause-title">${clause.title}</div>
                <div class="clause">${clause.content}</div>
              </div>
            </td>
          </tr>
          `).join('\n')}

          <!-- ROW LAST: SIGNATURES -->
          <tr>
            <td class="agreement-content-cell" style="padding-top: 0;">
              <div class="signatures-grid">
                <div style="break-inside: avoid; page-break-inside: avoid;">
                  <div class="section-title">EXECUTION & SIGNATURES</div>
                  <div class="intro-statement" style="text-align: center; font-style: italic; margin-top: 6px; margin-bottom: 12px;">
                    IN WITNESS WHEREOF, the Parties hereto have executed this ${headingTitle} on the day, month, and year first above written.
                  </div>

                  <div class="sig-row">
                    <div class="signature-box" style="position: relative;">
                      ${signatureBase64 ? `<img src="${signatureBase64}" alt="Signature" style="height: 45px; position: absolute; top: -15px; left: 10px; opacity: 0.85;" />` : ''}
                      <div class="line"></div>
                      <strong>For SakhiHub</strong><br/>
                      Authorized Signatory<br/>
                      Date: ${data.acceptanceTimestamp ? data.acceptanceTimestamp.split(',')[0] : currentDate}
                    </div>
                    <div class="signature-box">
                      <div class="line"></div>
                      <strong>For Vendor</strong><br/>
                      Authorized Representative: ${data.vendorName}<br/>
                      Date: ${data.acceptanceTimestamp ? data.acceptanceTimestamp.split(',')[0] : currentDate}
                    </div>
                  </div>
                </div>

                <div class="sig-row" style="margin-top: 10px;">
                  <div class="signature-box">
                    <div class="line"></div>
                    <strong>Witness 1</strong><br/>
                    Name:<br/>
                    Signature:
                  </div>
                  <div class="signature-box">
                    <div class="line"></div>
                    <strong>Witness 2</strong><br/>
                    Name:<br/>
                    Signature:
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="width: 100%;">
              <div style="height: 15mm; width: 100%;"></div>
            </td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;
};

export const generateOfferLetterHtml = (data: any) => {
  const formatDate = (d: string | Date) => {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getDynamicPositionText = (role: string) => {
    const roleUpper = (role || '').toUpperCase();
    if (roleUpper.includes('DISTRICT') || roleUpper.includes('COORD')) {
      return "District Level Women Coordinator";
    }
    return "Block Level Women Employee / Coordinator";
  };

  let logoBase64 = '';
  let sigBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoData = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
  } catch (e) {
    console.error('Logo image not found:', e);
  }
  try {
    const sigPath = path.join(process.cwd(), 'public', 'manager-signature.png');
    const sigData = fs.readFileSync(sigPath);
    sigBase64 = `data:image/png;base64,${sigData.toString('base64')}`;
  } catch (e) {
    console.error('Signature image not found:', e);
  }

  const programName = data.programName || "Women Health & Awareness Campaign";

  const headerHtml = generateDocumentHeaderHtml(logoBase64);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Employee Offer Letter</title>
    <style>
      @page {
        size: A4;
        margin: 0;
      }
      
      body {
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        font-family: Georgia, Cambria, "Times New Roman", Times, serif;
        color: #1f2937;
        line-height: 1.5;
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
      
      .print-header {
        display: table-header-group;
      }
      
      .print-footer {
        display: table-footer-group;
      }
      
      .container {
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
      }
      
      .offer-table {
        width: 100%;
        border: none;
        border-collapse: collapse;
        padding: 0;
        margin: 0;
      }
      
      .print-header-space {
        height: 12mm;
      }
      
      .print-footer-space {
        height: 12mm;
      }
      
      .content-cell {
        padding-left: 12mm;
        padding-right: 12mm;
      }
      
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
        .print-header {
          display: table-header-group;
        }
        .print-footer {
          display: table-footer-group;
        }
        .content-cell {
          padding-left: 12mm;
          padding-right: 12mm;
        }
      }
      
      /* Header styles */
      .header-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        border-bottom: 2px solid #D91656;
        padding-bottom: 12px;
        margin-bottom: 20px;
        text-align: center;
      }
      .logo-img {
        height: 70px;
        width: auto;
        object-fit: contain;
        margin-bottom: 10px;
      }
      .program-name {
        font-size: 14px;
        font-weight: bold;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 0;
      }
      .program-tagline {
        font-size: 12px;
        color: #9ca3af;
        font-style: italic;
        margin-top: 4px;
        margin-bottom: 0;
      }
      .meta-row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        font-size: 11px;
        color: #6b7280;
        font-weight: bold;
        border-top: 1px solid #f3f4f6;
        padding-top: 8px;
      }
      .meta-row p {
        margin: 0;
      }
      .status-badge {
        color: #D91656;
        text-transform: uppercase;
        font-weight: 900;
      }
      .meta-id {
        font-family: monospace;
        color: #1f2937;
        font-weight: bold;
      }
      
      /* Title */
      .title-container {
        text-align: center;
        margin-bottom: 24px;
      }
      .title-text {
        font-size: 20px;
        font-weight: 900;
        color: #111827;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        margin: 0;
      }
      
      /* Salutation & Intro */
      .intro-container {
        font-size: 14px;
        margin-bottom: 18px;
        line-height: 1.625;
        text-align: justify;
      }
      .intro-container p {
        margin-top: 0;
        margin-bottom: 12px;
      }
      .intro-container p:last-child {
        margin-bottom: 0;
      }
      .font-bold {
        font-weight: bold;
      }
      
      /* Section Titles */
      .section-title {
        font-size: 14px;
        font-weight: 900;
        text-transform: uppercase;
        color: #D91656;
        margin-top: 18px;
        margin-bottom: 10px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 4px;
        page-break-after: avoid;
        break-after: avoid;
      }
      
      /* Tables */
      .details-table {
        width: 100%;
        font-size: 12px;
        border-collapse: collapse;
        margin-bottom: 18px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .details-table tr {
        border-bottom: 1px solid #f3f4f6;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .details-table td {
        padding-top: 6px;
        padding-bottom: 6px;
      }
      .details-table td.label {
        font-weight: bold;
        width: 33.3333%;
      }
      
      /* Bullet list for Responsibilities */
      .bullet-list-responsibilities {
        display: flex;
        flex-direction: column;
        gap: 5px;
        list-style: none;
        padding-left: 4px;
        margin-top: 0;
        margin-bottom: 12px;
      }
      .bullet-list-responsibilities li {
        display: flex;
        align-items: start;
        gap: 6px;
        color: #374151;
      }
      .italic-gray-text {
        font-style: italic;
        color: #6b7280;
        margin-top: 4px;
        margin-bottom: 0;
      }
      
      /* Salary list */
      .salary-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        list-style: none;
        padding-left: 4px;
        margin-top: 0;
        margin-bottom: 12px;
        font-weight: bold;
        color: #111827;
      }
      .salary-list li {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .salary-list li.normal-benefit {
        font-weight: normal;
        color: #374151;
      }
      .text-green-700 {
        color: #15803d;
        font-weight: 800;
      }
      .text-gray-500 {
        color: #6b7280;
        margin-top: 4px;
        margin-bottom: 0;
      }
      
      /* Nature of work list */
      .nature-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        list-style: none;
        padding-left: 4px;
        margin-top: 0;
        margin-bottom: 18px;
        font-size: 12px;
      }
      .nature-list li {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #374151;
      }
      
      /* Code of Conduct */
      .conduct-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        list-style: none;
        padding-left: 4px;
        margin-top: 0;
        margin-bottom: 12px;
        color: #374151;
      }
      .conduct-list li {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .text-red-600 {
        color: #dc2626;
        font-weight: bold;
        font-style: italic;
        margin-top: 4px;
        margin-bottom: 0;
      }
      
      /* Paragraph clause text */
      .clause-text {
        font-size: 12px;
        margin-bottom: 18px;
        text-align: justify;
        line-height: 1.625;
        color: #374151;
      }
      
      /* Bullet lists in clauses */
      .clause-bullet-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        list-style: none;
        padding-left: 4px;
        margin-top: 0;
        margin-bottom: 18px;
        font-size: 12px;
        color: #374151;
      }
      .clause-bullet-list li {
        display: flex;
        align-items: start;
        gap: 6px;
      }
      .clause-bullet-list li span {
        flex: 1;
      }
      
      /* Important notice box */
      .important-notice-box {
        margin-bottom: 24px;
        padding: 12px;
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .important-notice-title {
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        color: #1f2937;
        margin-top: 0;
        margin-bottom: 4px;
      }
      .important-notice-text {
        font-size: 11px;
        text-align: justify;
        line-height: 1.625;
        color: #4b5563;
        margin: 0;
      }
      
      /* Signatures section */
      .signatures-container {
        display: flex;
        justify-content: space-between;
        padding-top: 24px;
        margin-top: 36px;
        border-top: 1px solid #e5e7eb;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .signature-col {
        width: 48%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        min-height: 180px;
      }
      .signature-col-right {
        width: 48%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        min-height: 180px;
        padding-left: 24px;
        border-left: 1px solid #f3f4f6;
        text-align: center;
        box-sizing: border-box;
      }
      .sig-title {
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        color: #1f2937;
        letter-spacing: 0.05em;
        margin: 0;
      }
      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        margin-top: 12px;
      }
      .checkbox-box {
        width: 16px;
        height: 16px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        display: inline-block;
        vertical-align: middle;
        text-align: center;
        line-height: 14px;
        font-size: 12px;
        font-weight: bold;
        color: #D91656;
      }
      .checkbox-label {
        font-size: 12px;
        font-weight: bold;
        color: #374151;
      }
      .sig-details {
        font-size: 12px;
        color: #4b5563;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .sig-details p {
        margin: 0;
      }
      .sig-status-text {
        font-size: 10px;
        color: #9ca3af;
        margin-top: 8px;
        font-family: monospace;
      }
      .sig-img-container {
        width: 100%;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
      }
      .sig-img {
        height: 64px;
        width: auto;
        object-fit: contain;
        opacity: 0.85;
      }
      .auth-title {
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        color: #111827;
        border-top: 1px solid #9ca3af;
        padding-top: 8px;
        width: 100%;
        margin: 0;
      }
      .auth-brand {
        font-size: 11px;
        font-weight: bold;
        color: #D91656;
        text-transform: uppercase;
        margin-top: 4px;
        margin-bottom: 0;
      }
      .auth-dept {
        font-size: 9px;
        color: #9ca3af;
        text-transform: uppercase;
        margin-top: 2px;
        margin-bottom: 0;
      }
      .auth-portal {
        font-size: 8px;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 2px;
        margin-bottom: 0;
      }
      
      /* Footer notice */
      .footer-system-notice {
        margin-top: 24px;
        padding-top: 12px;
        border-top: 1px solid #f3f4f6;
        text-align: center;
        font-size: 9px;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        line-height: 1.5;
      }
      
      .keep-together {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      .print-footer-content, .print-footer-content a, .print-footer-content span {
        color: #2563eb !important;
      }
      
      .print-footer-content a {
        text-decoration: underline !important;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <table class="offer-table">
        <thead class="print-header">
          <tr>
            <td>
              ${headerHtml}
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="content-cell">
              
              <!-- Header -->
              <div class="header-container" style="border-bottom: none; margin-bottom: 15px; padding-bottom: 0;">
                <div class="meta-row" style="border-top: none; padding-top: 0; margin-top: 0;">
                  <p>Status: <span class="status-badge">${(data.documentStatus || 'GENERATED').toUpperCase()}</span></p>
                  <p>Offer Letter ID: <span class="meta-id">${data.offerLetterId}</span></p>
                  <p>Date: ${formatDate(data.generatedDate)}</p>
                </div>
              </div>

              <div class="title-container">
                <h2 class="title-text">OFFER LETTER</h2>
              </div>

              <!-- Salutation & Intro -->
              <div class="intro-container">
                <p class="font-bold">Dear ${data.employeeName},</p>
                <p>We are pleased to offer you the position under the <strong>SakhiHub Women Health & Awareness Campaign Program</strong>.</p>
                <p>SakhiHub is a women-focused awareness and empowerment initiative working towards health awareness, hygiene education, women support systems, community engagement, and empowerment activities across India.</p>
                <p>Your selection has been made based on your application, communication ability, interest in social awareness activities, and organizational requirements.</p>
                <p>This Offer Letter is being issued digitally through the SakhiHub Employee Portal and shall be considered valid after digital acceptance, declaration confirmation and online signature completion by the candidate.</p>
              </div>

              <!-- 1. POSITION DETAILS -->
              <h3 class="section-title">1. POSITION DETAILS</h3>
              <table class="details-table">
                <tbody>
                  <tr>
                    <td class="label">Organization</td>
                    <td>SakhiHub</td>
                  </tr>
                  <tr>
                    <td class="label">Department</td>
                    <td>${programName}</td>
                  </tr>
                  <tr>
                    <td class="label">Coordinator Assignment</td>
                    <td class="font-bold">${data.coordinatorType || getDynamicPositionText(data.role)}</td>
                  </tr>
                  <tr>
                    <td class="label">Work Type</td>
                    <td>Field & Awareness Based Activities</td>
                  </tr>
                  <tr>
                    <td class="label">Assigned Block(s) / District(s)</td>
                    <td>${data.assignedRegions || `${data.workingArea || data.assignedDistrict}, ${data.assignedState}`}</td>
                  </tr>
                  <tr>
                    <td class="label">Campaign Type</td>
                    <td>PAN India Women Awareness Campaign</td>
                  </tr>
                  <tr>
                    <td class="label">Date of Joining</td>
                    <td class="font-bold">${formatDate(data.joiningDate)}</td>
                  </tr>
                </tbody>
              </table>

              <!-- 2. PRIMARY RESPONSIBILITIES -->
              <h3 class="section-title">2. PRIMARY RESPONSIBILITIES</h3>
              <div class="clause-text">
                <p class="font-bold" style="margin-bottom: 8px;">The candidate will be responsible for:</p>
                <ul class="bullet-list-responsibilities">
                  <li>• <span>Women Health Awareness</span></li>
                  <li>• <span>Period Hygiene Awareness</span></li>
                  <li>• <span>Community Group Activities</span></li>
                  <li>• <span>Women Empowerment Programs</span></li>
                  <li>• <span>Membership Awareness</span></li>
                  <li>• <span>Ground Level Campaign Activities</span></li>
                  <li>• <span>Field Visits & Reporting</span></li>
                  <li>• <span>Team Coordination (if applicable)</span></li>
                  <li>• <span>Awareness Meetings & Training Sessions</span></li>
                  <li>• <span>Campaign Monitoring & Community Support</span></li>
                </ul>
                <p class="italic-gray-text">The organization may modify or assign additional responsibilities based on operational requirements.</p>
              </div>

              <!-- 3. SALARY & BENEFITS -->
              <h3 class="section-title">3. SALARY & BENEFITS</h3>
              <div class="clause-text">
                <ul class="salary-list">
                  <li>• <span>Fixed Monthly Salary: <span class="text-green-700">₹${data.salary} / Month</span></span></li>
                  <li>• <span>Petrol / Travel Allowance: <span class="text-green-700">${data.travelAllowance || 'N/A'}</span></span></li>
                  <li>• <span>Performance Incentives: <span class="text-green-700">${data.performanceIncentives || 'N/A'}</span></span></li>
                  <li>• <span>Membership Incentives (if applicable): <span class="text-green-700">${data.membershipIncentives || 'N/A'}</span></span></li>
                  <li class="normal-benefit">• <span>Training & Guidance Support</span></li>
                  <li class="normal-benefit">• <span>Official ID Card</span></li>
                  <li class="normal-benefit">• <span>Campaign Materials & Operational Support</span></li>
                </ul>
                <p class="text-gray-500">Salary release timelines and incentive structures shall be governed as per company policy.</p>
              </div>

              <!-- 4. NATURE OF WORK -->
              <h3 class="section-title">4. NATURE OF WORK</h3>
              <ul class="nature-list">
                <li>• <span>Field visits and awareness activities</span></li>
                <li>• <span>Community interaction and meetings</span></li>
                <li>• <span>Reporting and campaign participation</span></li>
                <li>• <span>Assigned awareness programs</span></li>
                <li>• <span>Work allocation as determined by SakhiHub</span></li>
              </ul>

              <!-- 5. CODE OF CONDUCT -->
              <h3 class="section-title">5. CODE OF CONDUCT</h3>
              <div class="clause-text">
                <p class="font-bold" style="margin-bottom: 8px;">Employee agrees to:</p>
                <ul class="conduct-list">
                  <li>• <span>Maintain professionalism and discipline</span></li>
                  <li>• <span>Respect organizational policies</span></li>
                  <li>• <span>Avoid misleading commitments</span></li>
                  <li>• <span>Maintain respectful behaviour</span></li>
                  <li>• <span>Protect confidential information</span></li>
                  <li>• <span>Avoid misuse of organizational resources</span></li>
                </ul>
                <p class="text-red-600">Any misconduct, fraud, misrepresentation or activity damaging the reputation of SakhiHub may result in immediate termination.</p>
              </div>

              <!-- 6. CONFIDENTIALITY CLAUSE -->
              <h3 class="section-title">6. CONFIDENTIALITY CLAUSE</h3>
              <p class="clause-text">
                Employee Data, Campaign Data, Membership Information, Vendor Information, Training Materials, Operational Systems, and Internal Reports shall remain confidential and shall not be disclosed without written approval.
              </p>

              <!-- 7. DIGITAL ACCEPTANCE & PORTAL AGREEMENT -->
              <h3 class="section-title">7. DIGITAL ACCEPTANCE & PORTAL AGREEMENT</h3>
              <ul class="clause-bullet-list">
                <li>• <span>Digital acceptance through Portal, OTP, Checkbox or E-Sign shall constitute valid acceptance.</span></li>
                <li>• <span>Digitally submitted information shall be treated as valid organizational records.</span></li>
                <li>• <span>Employee confirms that all information submitted is genuine and correct.</span></li>
              </ul>

              <!-- 8. VERIFICATION & TERMINATION POLICY -->
              <h3 class="section-title">8. VERIFICATION & TERMINATION POLICY</h3>
              <ul class="clause-bullet-list">
                <li>• <span>SakhiHub reserves the right to verify documents and background information.</span></li>
                <li>• <span>False information or fake documents may result in immediate termination.</span></li>
                <li>• <span>Company reserves the right to modify or discontinue operational activities.</span></li>
              </ul>

              <!-- 9. INDEPENDENT OPERATIONAL CLAUSE -->
              <h3 class="section-title">9. INDEPENDENT OPERATIONAL CLAUSE</h3>
              <ul class="clause-bullet-list">
                <li>• <span>Campaign activities are awareness-based.</span></li>
                <li>• <span>Structures may vary state-wise and district-wise.</span></li>
                <li>• <span>Incentives depend upon organizational policies and performance.</span></li>
                <li>• <span>Operational decisions remain under SakhiHub authority.</span></li>
              </ul>

              <!-- 10. DECLARATION BY CANDIDATE -->
              <h3 class="section-title">10. DECLARATION BY CANDIDATE</h3>
              <div class="clause-text">
                <p class="font-bold" style="margin-bottom: 8px;">I confirm that:</p>
                <ul class="conduct-list">
                  <li>• <span>I have read and understood this Offer Letter.</span></li>
                  <li>• <span>I agree to comply with SakhiHub policies.</span></li>
                  <li>• <span>Information submitted by me is true and correct.</span></li>
                  <li>• <span>Violation of company policies may result in termination.</span></li>
                  <li>• <span>I voluntarily accept this opportunity.</span></li>
                </ul>
              </div>

              <!-- 11. EMPLOYMENT NATURE & PROBATION CLAUSE -->
              <h3 class="section-title">11. EMPLOYMENT NATURE & PROBATION CLAUSE</h3>
              <ul class="clause-bullet-list">
                <li>• <span>Initial Probation Period: 3 Months</span></li>
                <li>• <span>Performance shall be evaluated continuously.</span></li>
                <li>• <span>SakhiHub may confirm, extend, suspend or discontinue engagement.</span></li>
                <li>• <span>Employment remains subject to satisfactory performance.</span></li>
              </ul>

              <!-- 12. TRANSFER & ASSIGNMENT CLAUSE -->
              <h3 class="section-title">12. TRANSFER & ASSIGNMENT CLAUSE</h3>
              <ul class="clause-bullet-list">
                <li>• <span>SakhiHub may transfer employee to any district, block, tehsil, state, project or department.</span></li>
                <li>• <span>Employee agrees to cooperate with such assignments.</span></li>
              </ul>

              <!-- 13. MEMBERSHIP & GROUP OWNERSHIP CLAUSE -->
              <h3 class="section-title">13. MEMBERSHIP & GROUP OWNERSHIP CLAUSE</h3>
              <ul class="clause-bullet-list">
                <li>• <span>All groups, members and awareness networks shall remain exclusive property of SakhiHub.</span></li>
                <li>• <span>Employee shall have no ownership rights over organizational databases.</span></li>
              </ul>

              <!-- 14. DATA PROTECTION & PORTAL ACCESS CLAUSE -->
              <h3 class="section-title">14. DATA PROTECTION & PORTAL ACCESS CLAUSE</h3>
              <ul class="clause-bullet-list">
                <li>• <span>Login credentials and operational data shall remain confidential.</span></li>
                <li>• <span>Unauthorized sharing or misuse shall be treated as misconduct.</span></li>
              </ul>

              <!-- 15. RESIGNATION & EXIT POLICY -->
              <h3 class="section-title">15. RESIGNATION & EXIT POLICY</h3>
              <ul class="clause-bullet-list">
                <li>• <span>Employee may resign as per company policy.</span></li>
                <li>• <span>Exit formalities must be completed before settlement.</span></li>
              </ul>

              <!-- 16. NON-SOLICITATION CLAUSE -->
              <h3 class="section-title">16. NON-SOLICITATION CLAUSE</h3>
              <ul class="clause-bullet-list">
                <li>• <span>Employee shall not induce members, employees, vendors or partners to leave SakhiHub.</span></li>
                <li>• <span>Restriction shall remain applicable during employment and for 12 months after separation.</span></li>
              </ul>

              <!-- 17. INTELLECTUAL PROPERTY CLAUSE -->
              <h3 class="section-title">17. INTELLECTUAL PROPERTY CLAUSE</h3>
              <p class="clause-text">
                All content, reports, documents, presentations, photographs, videos and training materials created during employment shall remain property of SakhiHub.
              </p>

              <!-- 18. RECOVERY CLAUSE -->
              <h3 class="section-title">18. RECOVERY CLAUSE</h3>
              <ul class="clause-bullet-list">
                <li>• <span>Financial loss, fraud, unauthorized collection or policy violations may result in recovery proceedings.</span></li>
                <li>• <span>Incentives may be withheld pending investigation.</span></li>
              </ul>

              <!-- 19. JURISDICTION CLAUSE -->
              <h3 class="section-title">19. JURISDICTION CLAUSE</h3>
              <p class="clause-text">
                All disputes shall be subject exclusively to the jurisdiction of competent courts located at <strong>Indore, Madhya Pradesh</strong>.
              </p>

              <!-- 20. FINAL AUTHORITY CLAUSE -->
              <h3 class="section-title">20. FINAL AUTHORITY CLAUSE</h3>
              <p class="clause-text">
                SakhiHub shall have final authority regarding verification, performance evaluation, incentive approval, membership validation and operational decisions.
              </p>

              <!-- 21. ATTENDANCE & REPORTING CLAUSE -->
              <h3 class="section-title">21. ATTENDANCE & REPORTING CLAUSE</h3>
              <ul class="clause-bullet-list">
                <li>• <span>Daily attendance and reporting are mandatory.</span></li>
                <li>• <span>Salary, petrol allowance and incentives may be linked to reporting compliance.</span></li>
              </ul>

              <!-- 22. COMPANY PROPERTY CLAUSE -->
              <h3 class="section-title">22. COMPANY PROPERTY CLAUSE</h3>
              <p class="clause-text">
                All ID Cards, Documents, Training Material, Portal Access and Company Assets remain property of SakhiHub.
              </p>

              <!-- 23. NO UNAUTHORIZED COLLECTION CLAUSE -->
              <h3 class="section-title">23. NO UNAUTHORIZED COLLECTION CLAUSE</h3>
              <p class="clause-text">
                Employee shall not collect money in the name of SakhiHub without written authorization.
              </p>

              <!-- 24. LEGAL COMPLIANCE CLAUSE -->
              <h3 class="section-title">24. LEGAL COMPLIANCE CLAUSE</h3>
              <p class="clause-text">
                Employee shall comply with all applicable laws and organizational policies.
              </p>

              <!-- 25. ENTIRE AGREEMENT CLAUSE -->
              <h3 class="section-title">25. ENTIRE AGREEMENT CLAUSE</h3>
              <ul class="clause-bullet-list">
                <li>• <span>This Offer Letter, Portal Acceptance, Policies and future updates shall collectively form the employment understanding between employee and SakhiHub.</span></li>
                <li>• <span>SakhiHub may revise policies from time to time.</span></li>
              </ul>

              <!-- 26. BACKGROUND VERIFICATION CLAUSE -->
              <h3 class="section-title">26. BACKGROUND VERIFICATION CLAUSE</h3>
              <p class="clause-text">
                SakhiHub may verify educational, identity, address, experience and criminal background information.
              </p>

              <!-- 27. MEDICAL & FITNESS DECLARATION CLAUSE -->
              <h3 class="section-title">27. MEDICAL & FITNESS DECLARATION CLAUSE</h3>
              <p class="clause-text">
                Employee confirms physical and mental fitness to perform assigned duties.
              </p>

              <!-- 28. SURVIVAL CLAUSE -->
              <h3 class="section-title">28. SURVIVAL CLAUSE</h3>
              <p class="clause-text">
                Confidentiality, Data Protection, Intellectual Property, Recovery Rights, Jurisdiction and Group Ownership Clauses shall survive resignation, suspension or termination.
              </p>

              <!-- 29. SECURITY DEPOSIT & REFUND POLICY -->
              <h3 class="section-title">29. SECURITY DEPOSIT & REFUND POLICY</h3>
              <ul class="clause-bullet-list">
                <li>• <span><strong>Security Deposit Amount:</strong> ₹${data.depositAmount || '2,000'}</span></li>
                <li>• <span><strong>Refund Eligibility Period:</strong> 90 Days (3 Months) of continuous service.</span></li>
                <li>• <span><strong>Refund Policy & Conditions:</strong> The employee security deposit shall become refundable only after successful completion of 90 days (3 months) of continuous service. If the employee leaves, resigns, abandons duties, or is terminated before completion of 90 days, the security deposit shall not be refundable.</span></li>
              </ul>

              <!-- Keep notice and signatures together in print -->
              <div class="keep-together">
                <!-- IMPORTANT NOTICE -->
                <div class="important-notice-box">
                  <h4 class="important-notice-title">IMPORTANT NOTICE</h4>
                  <p class="important-notice-text">
                    This Offer Letter is issued for organizational engagement under SakhiHub Awareness Programs and shall not be construed as a guarantee of permanent employment, fixed tenure employment or lifetime engagement.
                  </p>
                </div>

                <!-- Signatures & Acceptance -->
                <div class="signatures-container">
                  <!-- Candidate Acceptance -->
                  <div class="signature-col">
                    <div style="margin-bottom: auto;">
                      <h4 class="sig-title">CANDIDATE DIGITAL ACCEPTANCE</h4>
                      <div class="checkbox-row">
                        <span class="checkbox-box">${data.documentStatus === 'accepted' || data.documentStatus === 'approved' ? '✓' : ''}</span>
                        <span class="checkbox-label">I Agree to the Terms & Conditions</span>
                      </div>
                    </div>
                    <div class="sig-details">
                      <p>Candidate Name: <span class="font-bold" style="color: #111827;">${data.employeeName}</span></p>
                      <p>Mobile Number: <span class="font-bold" style="color: #111827;">${data.mobile}</span></p>
                      <p>Date: <span class="font-bold" style="color: #111827;">${data.documentStatus === 'accepted' || data.documentStatus === 'approved' ? formatDate(new Date()) : '____________________'}</span></p>
                      <p class="sig-status-text">
                        ${data.documentStatus === 'accepted' || data.documentStatus === 'approved' ? 'Signed Digitally via OTP verification' : 'Digital Signature Pending'}
                      </p>
                    </div>
                  </div>

                  <!-- Authorized By -->
                  <div class="signature-col-right">
                    <div class="sig-img-container">
                      ${sigBase64 ? `<img src="${sigBase64}" class="sig-img" alt="Manager Signature" />` : ''}
                    </div>
                    <div style="width: 100%;">
                      <h4 class="auth-title">AUTHORIZED BY</h4>
                      <p class="auth-brand">SakhiHub</p>
                      <p class="auth-dept">Women Health & Awareness Campaign</p>
                      <p class="auth-portal">Official Digital Employment & Awareness Portal</p>
                    </div>
                  </div>
                </div>

                <!-- Footer System Notice -->
                <div class="footer-system-notice">
                  This is a system generated digital offer letter. Digital acceptance via the SakhiHub portal is legally binding.
                </div>
              </div>

            </td>
          </tr>
        </tbody>
        <tfoot class="print-footer">
          <tr>
            <td>
              <!-- Running Print Footer: email | sakhihub | address -->
              <div class="print-footer-content" style="height: 12mm; border-top: 1px solid #e5e7eb; display: flex; align-items: center; font-size: 10px; font-family: sans-serif; padding-left: 12mm; padding-right: 12mm; box-sizing: border-box; margin-top: 8px; gap: 8px;">
                <span>Address: Pu 4, Behind C21 Mall, Scheme 54, Indore, Madhya Pradesh 452010</span>
                <span style="color: #d1d5db;">|</span>
                <span>Email: <a href="mailto:support@sakhihub.com">support@sakhihub.com</a></span>
                <span style="color: #d1d5db;">|</span>
                <span>Website: <a href="https://www.sakhihub.com" style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">www.sakhihub.com</a></span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </body>
  </html>
  `;
};

export const generatePdfBuffer = async (
  htmlContent: string,
  agreementId?: string,
  options?: {
    margin?: { top?: string; right?: string; bottom?: string; left?: string };
    displayHeaderFooter?: boolean;
  }
) => {
  let browser;
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (isServerless) {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    const puppeteerCore = (await import('puppeteer-core')).default;

    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: (chromium as any).defaultViewport,
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v148.0.0/chromium-v148.0.0-pack.x64.tar'
      ),
      headless: (chromium as any).headless === 'shell' ? 'shell' : (chromium as any).headless,
    });
  } else {
    const puppeteerLocal = (await import('puppeteer')).default;
    browser = await puppeteerLocal.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  const page = await browser.newPage();
  await page.emulateMediaType('print');

  await page.setContent(htmlContent, { waitUntil: 'load' });

  const headerTemplate = '<div></div>';

  const footerTemplate = `
    <div style="font-size: 7.5px; font-family: 'Times New Roman', serif; width: 100%; padding: 0 20mm; display: flex; justify-content: space-between; color: #777; border-top: 0.5px solid #ccc; padding-top: 3px; box-sizing: border-box;">
      <span>Agreement ID: ${agreementId || ''}</span>
      <span style="font-weight: bold;">CONFIDENTIAL</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `;

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: options?.displayHeaderFooter !== undefined ? options.displayHeaderFooter : true,
    headerTemplate,
    footerTemplate,
    margin: options?.margin || { top: '22mm', right: '20mm', bottom: '22mm', left: '20mm' },
    preferCSSPageSize: true,
  });

  await browser.close();

  return pdfBuffer;
};
