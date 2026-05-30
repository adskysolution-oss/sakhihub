import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export const generateAgreementHtml = (data: any) => {
  const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const companyName = "SakhiHub Platform (AdSky Solution)";
  const companyAddress = "Pu 4, Behind C21 Mall, Scheme 54, Indore, Madhya Pradesh 452010";

  let signatureBase64 = '';
  try {
    const sigPath = path.join(process.cwd(), 'public', 'manager-signature.png');
    const sigData = fs.readFileSync(sigPath);
    signatureBase64 = `data:image/png;base64,${sigData.toString('base64')}`;
  } catch (e) {
    console.error('Signature image not found:', e);
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Vendor Agreement</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman:wght@400;700&display=swap');
        
        body {
          font-family: 'Times New Roman', Times, serif;
          margin: 0;
          padding: 0;
          color: #111;
          background: #fff;
          font-size: 14px;
          line-height: 1.6;
        }

        .page {
          padding: 50px 70px;
          box-sizing: border-box;
          background: white;
          position: relative;
        }

        .page-break {
          page-break-before: always;
        }

        h1 {
          text-align: center;
          font-size: 20px;
          text-decoration: underline;
          text-transform: uppercase;
          margin-bottom: 40px;
          font-weight: 700;
        }

        .intro {
          text-align: justify;
          margin-bottom: 30px;
        }

        .bold {
          font-weight: 700;
        }

        .clause {
          margin-bottom: 20px;
          text-align: justify;
        }

        .clause-title {
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
          margin-top: 20px;
          font-size: 14px;
        }

        .sub-clause {
          margin-left: 30px;
          margin-bottom: 10px;
        }

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 60px;
        }

        .signature-box {
          width: 45%;
          text-align: left;
        }

        .line {
          border-bottom: 1px solid #000;
          height: 30px;
          margin-bottom: 5px;
        }

        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          color: rgba(200, 200, 200, 0.2);
          z-index: -1;
          pointer-events: none;
          font-weight: bold;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .footer {
          position: fixed;
          bottom: 20px;
          left: 70px;
          right: 70px;
          font-size: 10px;
          color: #666;
          display: flex;
          justify-content: space-between;
        }

        .qr-placeholder {
          width: 100px;
          height: 100px;
          border: 1px dashed #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #666;
          margin-top: 20px;
        }

        .header-meta {
          text-align: right;
          font-size: 11px;
          color: #555;
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      <div class="watermark">SakhiHub Official</div>
      
      <!-- PAGE 1 -->
      <div class="page">
        <div class="header-meta">
          Agreement ID: <strong>${data.agreementId}</strong><br/>
          Date: ${currentDate}<br/>
          QR Verification Code: ${data.qrVerificationCode}
        </div>

        <h1>VENDOR AGREEMENT</h1>

        <div class="intro">
          THIS SERVICE CONTRACT/AGREEMENT made and entered on this <strong>${currentDate}</strong>.
        </div>

        <div class="bold" style="margin-bottom: 20px;">BY AND BETWEEN</div>

        <div class="intro">
          <strong>${companyName}</strong>, a company organized and existing under the applicable laws of India, having a principal place of business at <strong>${companyAddress}</strong> (hereinafter referred to as <strong>"the Client"</strong> or <strong>"Company"</strong>, which expression shall, unless repugnant to the meaning or context thereof, mean and include its successors and assigns) of the <strong>First Part</strong>.
        </div>

        <div class="bold" style="margin-bottom: 20px;">AND</div>

        <div class="intro">
          <strong>${data.vendorName}</strong>, having its operational address at <strong>${data.address}, ${data.district}, ${data.state}</strong>; (hereinafter referred to as <strong>"Vendor"</strong>, which expression shall, unless it be repugnant to context and meaning hereof, shall deemed to include its Successors and assigns) on the <strong>Other part</strong>.
        </div>

        <div class="intro">
          <strong>WHEREAS</strong> the client and the Vendor are collectively referred to as "the Parties" and individually as "the Party".
        </div>

        <div class="intro">
          <strong>WHEREAS</strong> the Client is in the business of social impact, e-commerce, and community development and desires to engage the Vendor for operational and team expansion services.
        </div>

        <div class="intro">
          <strong>WHEREAS</strong> the Vendor is in the business of providing services to various organizations. The Vendor represented its willingness to the Client that they have requisite expertise, resources and the skilled personnel for providing the services and is desirous of providing the same to the Client.
        </div>

        <div class="intro">
          <strong>NOW THEREFORE</strong>, for and in consideration of the mutual covenants and agreements provided below, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties hereto agree to following <strong>terms and conditions</strong> set out as on ${currentDate}:
        </div>
      </div>

      <!-- PAGE 2 -->
      <div class="page page-break">
        <div class="clause-title">1. SCOPE AND STANDARD OF SERVICES:</div>
        
        <div class="clause sub-clause">
          1.1 Vendor hereby agrees to provide to the Client and the Client hereby agrees to avail operational and team expansion services from Vendor.
        </div>
        <div class="clause sub-clause">
          1.2 The Vendor is assigned the following territory for operations:
          <div style="margin-left: 20px; margin-top: 10px;">
            <strong>Assigned State(s):</strong> ${data.state || 'As assigned by the Company'}<br/>
            <strong>Assigned District(s):</strong> ${data.district || 'As assigned by the Company'}<br/>
            <strong>Territory Details:</strong> ${data.assignedTerritory || 'As assigned by the Company'}
          </div>
        </div>
        <div class="clause sub-clause">
          1.3 In rendering the services to the Client, Vendor warrants that:
          <div style="margin-left: 20px; margin-top: 10px;">
            a. It shall observe the best service quality standards and ensure that Vendor renders its obligations to the satisfaction of the Client.<br/>
            b. It shall meet the various deadlines and targets specifically mentioned in this Agreement.<br/>
            c. It shall discuss and review its progress, on a regular basis as and when required by the Client.<br/>
            d. It shall act as the operational point of contact for the designated region.
          </div>
        </div>

        <div class="clause-title">2. TENURE OF THE AGREEMENT:</div>
        <div class="clause sub-clause">
          2.1 The agreement is effective from <strong>${data.joiningDate}</strong> and shall remain in force unless terminated by either party.
        </div>
        <div class="clause sub-clause">
          2.2 The Client at its sole discretion reserves the right to extend or modify the period of this Agreement.
        </div>
        <div class="clause sub-clause">
          2.3 Either party can terminate this Agreement by giving 30 days written notice to the other party.
        </div>

        <div class="clause-title">3. COMMERCIALS AND TARGETS:</div>
        <div class="clause sub-clause">
          3.1 In consideration of Vendor rendering the Services to the Client, the Client shall pay to Vendor charges as mentioned:
          <div style="margin-left: 20px; margin-top: 10px;">
            <strong>Incentive Structure:</strong> ${data.incentiveStructure || 'Standard Company Policy'}<br/>
            <strong>Community Service Incentive:</strong> ${data.membershipCommission || 'Standard Company Policy'}<br/>
            <strong>Monthly Targets:</strong> ${data.monthlyTargets || 'As defined by management'}
          </div>
        </div>
        <div class="clause sub-clause">
          3.2 Payment will be processed monthly upon successful achievement and verification of the set targets.
        </div>
        <div class="clause sub-clause">
          3.3 All payments are subject to statutory deductions including TDS as per the Income Tax Act.
        </div>
      </div>

      <!-- PAGE 3 -->
      <div class="page page-break">
        <div class="clause-title">4. INDEPENDENT VENDOR:</div>
        <div class="clause sub-clause">
          4.1 This agreement is on a principal-to-principal basis and does not create any employer-employee relationship.
        </div>
        <div class="clause sub-clause">
          4.2 Vendor shall provide the Services hereunder as an independent vendor and nothing contained herein shall be deemed to create an association, partnership, joint venture or relationship of principal and agent or master and servant.
        </div>

        <div class="clause-title">5. CONFIDENTIALITY:</div>
        <div class="clause sub-clause">
          5.1 The Vendor shall not disclose any confidential information of the Company to any third party during or after the term of this Agreement.
        </div>
        <div class="clause sub-clause">
          5.2 All member data, strategies, and operational plans are proprietary to SakhiHub.
        </div>

        <div class="clause-title">6. GOVERNING LAW & ARBITRATION:</div>
        <div class="clause sub-clause">
          6.1 This Agreement shall be governed by the laws of India. The Courts in India shall have exclusive jurisdiction over the subject matter of this Agreement.
        </div>

        <div class="flex-between">
          <div class="signature-box" style="position: relative;">
            ${signatureBase64 ? `<img src="${signatureBase64}" alt="Signature" style="height: 60px; position: absolute; top: -25px; left: 10px; opacity: 0.8;" />` : ''}
            <div class="line"></div>
            <strong>For Client (SakhiHub)</strong><br/>
            Authorized Signatory<br/>
            Date: ${currentDate}
          </div>
          <div class="signature-box">
            <div class="line"></div>
            <strong>For Vendor</strong><br/>
            Name: ${data.vendorName}<br/>
            Code: ${data.vendorCode}
          </div>
        </div>

      </div>

    </body>
    </html>
  `;
};

export const generatePdfBuffer = async (htmlContent: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'load' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  
  await browser.close();
  
  return pdfBuffer;
};
