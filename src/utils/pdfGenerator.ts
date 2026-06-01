import fs from 'fs';
import path from 'path';

export const generateAgreementHtml = (data: any) => {
  const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const companyName = "SakhiHub";
  const companyAddress = "PU-4, Behind C21 Mall, Scheme No. 54, Indore, Madhya Pradesh – 452010";
  const headingTitle = data.partnerType || "VENDOR / NGO PARTNERSHIP AGREEMENT";
  const isSubVendor = data.role === 'sub_vendor' || (data.partnerType && data.partnerType.toUpperCase().includes('SUB VENDOR'));

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
      content: `Vendor shall receive: <strong>₹500 Per Active Employee Per Month</strong><br/>
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
      content: `Vendor shall receive: <strong>₹${isSubVendor ? '5' : '10'} Per Successful Paid Membership</strong><br/>
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
      title: "13. CONFIDENTIALITY",
      content: `Vendor shall maintain confidentiality of:
      <div class="bullet-list">
        • Employee Data | • Member Data | • Reports | • Training Materials | • Internal Systems | • Operational Information
      </div>
      This obligation survives termination.`
    },
    {
      id: 14,
      title: "14. DATA PROTECTION",
      content: `Vendor shall not:
      <div class="bullet-list">
        • Copy Data | • Export Data | • Sell Data | • Share Data | • Download Data without authorization
      </div>
      All data belongs exclusively to SakhiHub.`
    },
    {
      id: 15,
      title: "15. FRAUD PREVENTION",
      content: `The following are strictly prohibited:
      <div class="bullet-list">
        • Fake Memberships | • Duplicate Memberships | • Fake Attendance | • Fake Reporting | • Identity Fraud | • Forged Documents
      </div>
      Any such activity may result in immediate termination.`
    },
    {
      id: 16,
      title: "16. RECOVERY RIGHTS",
      content: `Company may recover losses arising from:
      <div class="bullet-list">
        • Fraud | • Misrepresentation | • Fake Memberships | • Data Theft | • Financial Loss
      </div>
      Recovery may be adjusted from future payments.`
    },
    {
      id: 17,
      title: "17. NON-POACHING CLAUSE",
      content: "Vendor shall not recruit or induce SakhiHub employees, members, partners or vendors to leave SakhiHub. This restriction shall continue for 24 months after termination."
    },
    {
      id: 18,
      title: "18. BRAND PROTECTION",
      content: `Vendor shall not misuse:
      <div class="bullet-list">
        • SakhiHub Name | • Logo | • Website | • Training Material | • Marketing Content
      </div>
      without written approval.`
    },
    {
      id: 19,
      title: "19. SOCIAL MEDIA RESTRICTIONS",
      content: "Vendor shall not issue public announcements, media statements or press releases on behalf of SakhiHub without written authorization."
    },
    {
      id: 20,
      title: "20. AUDIT RIGHTS",
      content: `Company may conduct:
      <div class="bullet-list">
        • Physical Audits | • Digital Audits | • Membership Verification | • Employee Verification
      </div>
      at any time. Vendor shall cooperate fully.`
    },
    {
      id: 21,
      title: "21. SUSPENSION RIGHTS",
      content: `Company may suspend Vendor immediately for:
      <div class="bullet-list">
        • Fraud | • Policy Violation | • Brand Misuse | • Data Misuse | • Poor Performance
      </div>`
    },
    {
      id: 22,
      title: "22. TERMINATION",
      content: `Company may terminate this Agreement immediately without notice for:
      <div class="bullet-list">
        • Fraud | • Fake Reporting | • Criminal Activity | • Brand Damage | • Policy Violation
      </div>`
    },
    {
      id: 23,
      title: "23. NO COMPENSATION CLAIM",
      content: "Vendor shall not claim future earnings, damages or compensation arising from termination."
    },
    {
      id: 24,
      title: "24. INDEMNITY",
      content: "Vendor shall indemnify SakhiHub against all claims, damages, penalties and legal costs arising from Vendor actions."
    },
    {
      id: 25,
      title: "25. JURISDICTION",
      content: "All disputes shall be subject exclusively to the competent courts located in: <strong>Indore, Madhya Pradesh</strong>. Vendor expressly agrees to such jurisdiction."
    },
    {
      id: 26,
      title: "26. DIGITAL ACCEPTANCE",
      content: "Portal Acceptance, OTP Verification, E-Signature, Digital Signature or Online Approval shall constitute valid legal acceptance of this Agreement."
    },
    {
      id: 27,
      title: "27. FINAL AUTHORITY",
      content: `Company decisions relating to:
      <div class="bullet-list">
        • Membership Verification | • Incentive Approval | • Employee Verification | • Operational Matters | • Policy Interpretation
      </div>
      shall be final and binding.`
    },
    {
      id: 28,
      title: "28. NO PERMANENT COMMISSION CLAUSE",
      content: "Vendor acknowledges that commission and incentive structures are policy-based benefits and do not create any vested, permanent or lifetime rights. Company may revise, suspend or discontinue any commission structure at its sole discretion. Vendor shall not claim compensation for such revision."
    },
    {
      id: 29,
      title: "29. NO EXCLUSIVE RIGHTS CLAUSE",
      content: "This Agreement does not grant any exclusive rights over any district, block, tehsil, state, territory, members, groups or employees. Company may appoint any number of vendors, coordinators, agencies or representatives in the same territory."
    },
    {
      id: 30,
      title: "30. MEMBER VALIDATION CLAUSE",
      content: "Only memberships verified and approved by SakhiHub shall be eligible for incentive calculation. Company reserves the right to reject, suspend or cancel memberships without assigning any reason. No incentive shall be payable on rejected, cancelled or disputed memberships."
    },
    {
      id: 31,
      title: "31. EMPLOYEE REPLACEMENT LIABILITY",
      content: "If Vendor-referred employees are repeatedly non-performing, fraudulent, absent or non-compliant, Company may require replacement. Failure to provide suitable replacements may result in suspension or termination of Vendor status."
    },
    {
      id: 32,
      title: "32. REPUTATION DAMAGE CLAUSE",
      content: "Any action, statement, social media post, communication or conduct that harms the reputation, goodwill, credibility or public image of SakhiHub shall constitute a material breach of this Agreement. Company may immediately terminate the Agreement and pursue legal remedies."
    },
    {
      id: 33,
      title: "33. NO AUTHORITY TO BIND COMPANY",
      content: "Vendor shall not enter into any agreement, commitment, financial obligation, employment promise, partnership arrangement or legal undertaking on behalf of SakhiHub. Any such action shall be solely at Vendor’s risk and responsibility."
    },
    {
      id: 34,
      title: "34. NO CASH COLLECTION CLAUSE",
      content: "Vendor shall not collect any membership fees, registration charges, donations, service fees or other payments in cash on behalf of SakhiHub unless specifically authorized in writing. Unauthorized collection may result in immediate termination and recovery proceedings."
    },
    {
      id: 35,
      title: "35. SURVIVAL OF OBLIGATIONS",
      content: "Confidentiality, Data Protection, Recovery Rights, Intellectual Property, Non-Poaching, Jurisdiction, Member Ownership and Group Ownership clauses shall survive termination and remain enforceable."
    },
    {
      id: 36,
      title: "36. RIGHT TO MODIFY PROGRAM",
      content: "Company may modify, suspend, restructure, merge or discontinue any campaign, incentive model, operational structure, membership program or activity at any time. Vendor shall not claim damages or compensation due to such changes."
    },
    {
      id: 37,
      title: "37. FORCEFUL RECOVERY CONSENT",
      content: "Vendor agrees that any proven financial loss caused by fraud, fake memberships, data misuse, forged records or policy violations may be recovered from any outstanding incentives, commissions or payable amounts."
    },
    {
      id: 38,
      title: "38. DIGITAL RECORDS EVIDENCE CLAUSE",
      content: "Vendor agrees that portal logs, attendance records, OTP logs, uploaded documents, digital signatures, communication records and system reports shall constitute valid operational evidence for decision-making."
    },
    {
      id: 39,
      title: "39. ENTIRE AGREEMENT CLAUSE",
      content: "This Agreement, portal acceptance, digital declarations, future policy updates and operational guidelines issued by SakhiHub collectively constitute the entire understanding between the parties."
    },
    {
      id: 40,
      title: "40. COMPANY FINAL DECISION CLAUSE",
      content: `For matters relating to:
      <div class="bullet-list">
        • Vendor Approval | • Membership Validation | • Incentive Calculation | • Employee Status | • Territory Allocation | • Operational Policies | • Compliance Review
      </div>
      The decision of SakhiHub shall be final for operational purposes and binding under this Agreement.`
    },
    {
      id: 41,
      title: "41. NO EMPLOYMENT CLAIM CLAUSE",
      content: "Vendor acknowledges that no employee engaged under SakhiHub programs shall be deemed an employee, agent, representative or worker of the Vendor. Vendor shall not claim any employment rights, management rights or employer authority over SakhiHub employees."
    },
    {
      id: 42,
      title: "42. NO MEMBER DATABASE RIGHTS CLAUSE",
      content: "Vendor expressly waives all rights, title and interest in any membership database, lead database, women groups, beneficiary records, campaign records or contact information generated through SakhiHub activities. All such information shall remain exclusive property of SakhiHub."
    },
    {
      id: 43,
      title: "43. NON-COMPETE CLAUSE",
      content: "During the term of this Agreement and for a period of 24 months after termination, Vendor shall not use SakhiHub training material, operational models, campaign structures, databases, member networks or confidential information to establish or support a competing program."
    },
    {
      id: 44,
      title: "44. VENDOR ACCOUNT SUSPENSION CLAUSE",
      content: "SakhiHub reserves the right to temporarily suspend Vendor access, Vendor Panel access, reporting rights, incentive eligibility or operational privileges whenever policy violations, investigations or operational concerns arise. No compensation shall be payable during suspension."
    },
    {
      id: 45,
      title: "45. NO ASSIGNMENT CLAUSE",
      content: "Vendor shall not transfer, assign, sublicense, sell or delegate its rights or obligations under this Agreement to any third party without prior written approval from SakhiHub."
    },
    {
      id: 46,
      title: "46. RECORD RETENTION CLAUSE",
      content: "Vendor shall maintain accurate operational records, membership records and campaign records for a minimum period of three (3) years and shall provide such records whenever requested by SakhiHub."
    },
    {
      id: 47,
      title: "47. COMPLIANCE WITH COMPANY POLICIES",
      content: "Vendor agrees to comply with all present and future policies, SOPs, operational manuals, portal guidelines, reporting formats and instructions issued by SakhiHub from time to time. Such policies shall form an integral part of this Agreement."
    },
    {
      id: 48,
      title: "48. NO PUBLIC REPRESENTATION CLAUSE",
      content: "Vendor shall not represent itself as owner, co-owner, founder, co-founder, franchise owner, state head, district owner or legal authority of SakhiHub. Vendor may only represent itself as an authorized Vendor / NGO Partner of SakhiHub."
    },
    {
      id: 49,
      title: "49. SEVERABILITY CLAUSE",
      content: "If any provision of this Agreement is held invalid, illegal or unenforceable by a competent authority, the remaining provisions shall continue in full force and effect."
    },
    {
      id: 50,
      title: "50. BINDING EFFECT CLAUSE",
      content: "This Agreement shall be binding upon the Vendor, its representatives, successors, assigns, office bearers, trustees, directors, employees and authorized representatives. All obligations contained herein shall continue to apply as permitted by law."
    },
    {
      id: 51,
      title: "51. ANTI-BRIBERY & ANTI-CORRUPTION CLAUSE",
      content: "Vendor shall not offer, promise, authorize or provide any unlawful payment, benefit, gift, commission or advantage in connection with SakhiHub operations. Any violation shall result in immediate termination."
    },
    {
      id: 52,
      title: "52. GOVERNMENT COMPLIANCE CLAUSE",
      content: "Vendor shall comply with all applicable laws, regulations, registrations, tax requirements and governmental directions applicable to its operations. Any liability arising from Vendor non-compliance shall remain Vendor's responsibility."
    },
    {
      id: 53,
      title: "53. NO PARTNERSHIP PROPERTY RIGHTS CLAUSE",
      content: "Vendor shall not claim ownership, tenancy rights, possession rights or proprietary rights over any SakhiHub office, infrastructure, portal, system, territory, project, database or operational asset."
    },
    {
      id: 54,
      title: "54. LIMITATION OF LIABILITY CLAUSE",
      content: "Under no circumstances shall SakhiHub be liable for indirect, consequential, incidental, special or business losses suffered by Vendor. Maximum liability, if any, shall not exceed the amount payable to Vendor under this Agreement."
    },
    {
      id: 55,
      title: "55. VOLUNTARY EXECUTION CLAUSE",
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
          margin: 22mm 20mm 22mm 20mm;
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
        }
        
        h1 {
          text-align: center;
          font-size: 16px;
          text-decoration: underline;
          text-transform: uppercase;
          margin-top: 5px;
          margin-bottom: 15px;
          font-weight: 700;
          line-height: 1.3;
        }

        .section-title {
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 700;
          margin-top: 15px;
          margin-bottom: 6px;
          border-bottom: 1px solid #111;
          padding-bottom: 2px;
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }

        .details-table td {
          padding: 5px 8px;
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
          margin-top: 15px;
          margin-bottom: 12px;
        }

        .clause-container {
          page-break-inside: avoid;
          margin-bottom: 8px;
        }

        .clause-title {
          font-weight: 700;
          margin-bottom: 3px;
          font-size: 11px;
          text-transform: uppercase;
        }

        .clause {
          text-align: justify;
          margin-bottom: 6px;
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
        }

        .signatures-grid {
          page-break-inside: avoid;
          margin-top: 35px;
        }

        .sig-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .signature-box {
          width: 45%;
          text-align: left;
          font-size: 11px;
        }

        .line {
          border-bottom: 1px solid #111;
          height: 35px;
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

      <!-- TITLE -->
      <h1>${headingTitle}</h1>

      <!-- INTRO -->
      <div class="intro-statement">
        THIS ${headingTitle} (the "Agreement") is executed and made effective as of the Date of Execution specified below, by and between the following parties:
      </div>

      <!-- PARTIES -->
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

      <!-- AGREEMENT METADATA -->
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
          <td>3 Years</td>
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

      <!-- CLAUSES -->
      <div class="clause-header">TERMS AND CONDITIONS</div>
      
      ${clauses.map(clause => `
        <div class="clause-container">
          <div class="clause-title">${clause.title}</div>
          <div class="clause">${clause.content}</div>
        </div>
      `).join('\n')}

      <!-- SIGNATURES -->
      <div class="signatures-grid">
        <div class="section-title">EXECUTION & SIGNATURES</div>
        <div class="intro-statement" style="text-align: center; font-style: italic; margin-top: 10px; margin-bottom: 40px;">
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

        <div class="sig-row" style="margin-top: 40px;">
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

    </body>
    </html>
  `;
};

export const generatePdfBuffer = async (htmlContent: string, agreementId?: string) => {
  let browser;
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (isServerless) {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    const puppeteerCore = (await import('puppeteer-core')).default;

    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v148.0.0/chromium-v148.0.0-pack.x64.tar'
      ),
      headless: chromium.headless,
    });
  } else {
    const puppeteerLocal = (await import('puppeteer')).default;
    browser = await puppeteerLocal.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  const page = await browser.newPage();

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
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate,
    margin: { top: '22mm', right: '20mm', bottom: '22mm', left: '20mm' },
  });

  await browser.close();

  return pdfBuffer;
};
