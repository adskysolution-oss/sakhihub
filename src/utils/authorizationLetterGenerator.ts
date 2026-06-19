import fs from 'fs';
import path from 'path';

export interface AuthorizationLetterData {
  employeeName: string;
  employeeId: string;
  designation: string;
  state: string;
  district: string;
  block?: string;
  authorizationNumber: string;
  issueDate: Date | string;
  validUntil: Date | string;
  verificationUrl: string;
}

export const generateAuthorizationLetterHtml = (data: AuthorizationLetterData) => {
  const isDistrictDesignation = ['District Coordinator', 'District Project Officer'].includes(data.designation);

  const formatDate = (d: string | Date) => {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  let logoBase64 = '';
  let sigBase64 = '';
  let sealBase64 = '';

  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      logoBase64 = 'data:image/png;base64,' + logoData.toString('base64');
    }
  } catch (e) {
    console.error('Logo image not found or failed to read:', e);
  }

  try {
    const sigPath = path.join(process.cwd(), 'public', 'manager-signature.png');
    if (fs.existsSync(sigPath)) {
      const sigData = fs.readFileSync(sigPath);
      sigBase64 = 'data:image/png;base64,' + sigData.toString('base64');
    }
  } catch (e) {
    console.error('Signature image not found or failed to read:', e);
  }

  try {
    const sealPath = path.join(process.cwd(), 'public', 'Seal-Signature.png');
    if (fs.existsSync(sealPath)) {
      const sealData = fs.readFileSync(sealPath);
      sealBase64 = 'data:image/png;base64,' + sealData.toString('base64');
    }
  } catch (e) {
    console.error('Seal image not found or failed to read:', e);
  }

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(data.verificationUrl)}`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Internal Authorization Letter</title>
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

      .outer-container {
        width: 210mm;
        height: 297mm;
        box-sizing: border-box;
        padding: 8mm 12mm;
        position: relative;
        background-color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      /* Premium Double Border */
      .outer-container::before {
        content: "";
        position: absolute;
        top: 6mm;
        left: 6mm;
        right: 6mm;
        bottom: 6mm;
        border: 1px solid #D91656;
        pointer-events: none;
        box-sizing: border-box;
        z-index: 10;
      }

      .outer-container::after {
        content: "";
        position: absolute;
        top: 7.5mm;
        left: 7.5mm;
        right: 7.5mm;
        bottom: 7.5mm;
        border: 2px solid #6A1B9A;
        pointer-events: none;
        box-sizing: border-box;
        z-index: 10;
      }

      /* Watermark Background */
      .watermark {
        position: absolute;
        top: 52%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 55px;
        color: rgba(106, 27, 154, 0.03);
        font-weight: 950;
        letter-spacing: 0.1em;
        white-space: nowrap;
        pointer-events: none;
        z-index: 1;
        text-transform: uppercase;
        font-family: sans-serif;
      }

      .header {
        border-bottom: 3px solid #D91656;
        padding-bottom: 8px;
        margin-bottom: 10px;
        position: relative;
        z-index: 20;
      }

      .header-table {
        width: 100%;
        border-collapse: collapse;
      }

      .logo-col {
        vertical-align: middle;
        text-align: left;
        width: 55%;
      }

      .contact-col {
        vertical-align: middle;
        text-align: right;
        font-family: sans-serif;
        font-size: 9px;
        color: #4b5563;
        line-height: 1.35;
      }

      .brand-box {
        display: inline-flex;
        align-items: center;
      }

      .logo-img {
        height: 44px;
        width: auto;
        display: inline-block;
        vertical-align: middle;
      }

      .brand-divider {
        display: inline-block;
        width: 2px;
        height: 40px;
        background-color: #D91656;
        margin: 0 10px;
        vertical-align: middle;
      }

      .brand-text {
        display: inline-block;
        vertical-align: middle;
        text-align: left;
      }

      .brand-title {
        font-size: 19px;
        font-weight: 800;
        color: #D91656;
        margin: 0;
        line-height: 1.1;
      }

      .brand-tagline {
        font-size: 9.5px;
        color: #6A1B9A;
        font-weight: bold;
        font-style: italic;
        margin: 2px 0 0 0;
      }

      .brand-reg {
        font-size: 7.5px;
        color: #4b5563;
        margin: 2px 0 0 0;
      }

      .doc-title-container {
        text-align: center;
        margin-top: 2px;
        margin-bottom: 8px;
        position: relative;
        z-index: 20;
      }

      .doc-title {
        font-size: 17px;
        font-weight: 900;
        color: #6A1B9A;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        display: inline-block;
        border-bottom: 2px dashed #D91656;
        padding-bottom: 2px;
      }

      .doc-subtitle {
        font-size: 9.5px;
        color: #4b5563;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-top: 4px;
        font-weight: bold;
      }

      .letter-content {
        font-size: 11px;
        text-align: justify;
        line-height: 1.45;
        margin-bottom: 8px;
        position: relative;
        z-index: 20;
        color: #2d3748;
      }

      .salutation {
        font-weight: bold;
        margin-bottom: 6px;
      }

      /* Profile & Assignment Info Box */
      .profile-info-box {
        background: linear-gradient(135deg, #FFF5F7 0%, #FAF5FF 100%);
        border: 1px solid #F3E8FF;
        border-radius: 10px;
        padding: 6px 12px;
        margin: 6px 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      }

      .info-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }

      .info-table td {
        padding: 2.5px 0;
        vertical-align: top;
      }

      .info-label {
        font-weight: bold;
        color: #6A1B9A;
      }

      .info-value {
        color: #1f2937;
        font-weight: bold;
      }

      /* Custom columns panels */
      .content-panel {
        background-color: #FAF5FF;
        border: 1px solid #E9D5FF;
        border-radius: 10px;
        padding: 6px 12px;
        box-sizing: border-box;
      }

      .panel-header {
        font-size: 9px;
        font-weight: 900;
        color: #6A1B9A;
        text-transform: uppercase;
        border-bottom: 1.5px solid #E9D5FF;
        padding-bottom: 2px;
        margin-bottom: 4px;
        letter-spacing: 0.05em;
        font-family: sans-serif;
      }

      .panel-list {
        margin: 0;
        padding-left: 14px;
        font-size: 9.5px;
        line-height: 1.35;
        color: #374151;
      }

      .panel-list li {
        margin-bottom: 2px;
      }

      .declaration-box {
        background-color: #FFF5F5;
        border: 1px solid #FEE2E2;
        border-radius: 10px;
        padding: 6px 12px;
        font-size: 9px;
        color: #991B1B;
        line-height: 1.35;
        text-align: justify;
        box-sizing: border-box;
      }

      /* Verification block with QR */
      .verification-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #fdfbf7;
        border: 1px solid #f5efe6;
        border-radius: 10px;
        padding: 6px 12px;
        margin: 6px 0;
      }

      .verification-text {
        width: 78%;
        font-size: 9.5px;
        color: #4b5563;
        line-height: 1.35;
      }

      .verification-text h4 {
        margin: 0 0 2px 0;
        color: #6A1B9A;
        font-size: 9.5px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .verification-link {
        font-family: monospace;
        color: #D91656;
        font-weight: bold;
        word-break: break-all;
        display: block;
        margin-top: 2px;
        font-size: 8.5px;
      }

      .qr-container {
        width: 22%;
        text-align: right;
        display: flex;
        justify-content: flex-end;
      }

      .qr-img {
        width: 54px;
        height: 54px;
        border: 2px solid #6A1B9A;
        border-radius: 6px;
        padding: 1px;
        background-color: white;
      }

      /* Signatures section */
      .footer-signatures {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        border-top: 1px solid #e5e7eb;
        padding-top: 8px;
      }

      .sig-col-left {
        width: 48%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        min-height: 60px;
        font-size: 9.5px;
        color: #4b5563;
      }

      .sig-col-right {
        width: 48%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        min-height: 60px;
        text-align: center;
        position: relative;
      }

      .sig-line {
        border-top: 1px solid #718096;
        width: 100%;
        margin-top: 4px;
        padding-top: 2px;
        font-size: 9.5px;
        font-weight: bold;
        color: #1f2937;
      }

      .seal-img {
        position: absolute;
        height: 52px;
        width: auto;
        opacity: 0.55;
        z-index: 5;
        mix-blend-mode: multiply;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
      }

      .sig-img {
        position: relative;
        height: 28px;
        width: auto;
        z-index: 10;
        mix-blend-mode: multiply;
        margin-bottom: 2px;
      }

      .auth-label {
        font-size: 8.5px;
        color: #D91656;
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 1px;
      }

      /* Legal disclaimer footer */
      .legal-disclaimer-box {
        border-top: 1px solid #f3f4f6;
        padding-top: 4px;
        text-align: center;
        position: relative;
        z-index: 20;
      }

      .disclaimer-title {
        font-size: 7.5px;
        font-weight: 900;
        color: #718096;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 2px;
      }

      .disclaimer-text {
        font-size: 7px;
        color: #718096;
        line-height: 1.3;
        text-align: justify;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="outer-container">
      <div class="watermark">SakhiHub Internal</div>

      <!-- Main Body Top Section -->
      <div>
        <!-- 1. Header -->
        <div class="header">
          <table class="header-table">
            <tr>
              <td class="logo-col">
                <div class="brand-box">
                  ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="SakhiHub Logo" />` : ''}
                  <div class="brand-divider"></div>
                  <div class="brand-text">
                    <h1 class="brand-title">SakhiHub</h1>
                    <p class="brand-tagline">Empowering Women Across India</p>
                    <p class="brand-reg">Reg No: IND26S02588604481</p>
                  </div>
                </div>
              </td>
              <td class="contact-col">
                <strong>Website:</strong> www.sakhihub.com<br/>
                <strong>Email:</strong> info@sakhihub.com<br/>
                <strong>Contact:</strong> +91 8062179122
              </td>
            </tr>
          </table>
        </div>

        <!-- 2. Document Title -->
        <div class="doc-title-container">
          <h2 class="doc-title">Internal Authorization Letter</h2>
          <div class="doc-subtitle">Official Field Representative Identification</div>
        </div>

        <!-- 3. Letter Content -->
        <div class="letter-content">
          <p class="salutation" style="margin-top: 0; margin-bottom: 4px;">TO WHOMSOEVER IT MAY CONCERN,</p>
          
          <p style="margin-top: 0; margin-bottom: 6px; font-size: 10.5px;">
            This is to certify and officially confirm that the employee specified below is an authorized representative of <strong>SakhiHub</strong> (a private organization working towards health awareness, hygiene education, women community development, and empowerment).
          </p>

          ${isDistrictDesignation ? `
          <!-- DISTRICT COORDINATOR TEMPLATE -->
          
          <!-- Profile Details Box -->
          <div class="profile-info-box" style="margin: 4px 0 6px 0; padding: 6px 12px; border-radius: 10px;">
            <table class="info-table" style="font-size: 10px;">
              <tr>
                <td class="info-label" style="width: 25%;">Representative Name</td>
                <td class="info-value" style="width: 25%;">: ${data.employeeName}</td>
                <td class="info-label" style="width: 20%;">Official Designation</td>
                <td class="info-value" style="width: 30%;">: ${data.designation}</td>
              </tr>
              <tr>
                <td class="info-label">Employee ID</td>
                <td class="info-value">: ${data.employeeId}</td>
                <td class="info-label">Assigned State</td>
                <td class="info-value">: ${data.state}</td>
              </tr>
              <tr>
                <td class="info-label">Authorization Number</td>
                <td class="info-value" style="font-family: monospace; color: #D91656; font-size: 10px;">: ${data.authorizationNumber}</td>
                <td class="info-label">Assigned District</td>
                <td class="info-value">: ${data.district}</td>
              </tr>
            </table>
          </div>

          <!-- Program & Documents Horizontal Split -->
          <div style="display: flex; gap: 10px; margin-bottom: 6px;">
            <div class="content-panel" style="flex: 1.1;">
              <div class="panel-header">Program Authorization</div>
              <p style="margin: 2px 0 0 0; font-size: 9.5px; font-weight: bold; color: #6A1B9A; line-height: 1.3;">
                Authorized under:<br/>
                SakhiHub Women Health & Hygiene Awareness Program
              </p>
            </div>
            <div class="content-panel" style="flex: 0.9;">
              <div class="panel-header">Verification Documents</div>
              <p style="margin: 2px 0 0 0; font-size: 9px; line-height: 1.3; color: #374151;">
                Representative may present for verification:<br/>
                • SakhiHub Employee ID Card &nbsp;&bull;&nbsp; Offer Letter &nbsp;&bull;&nbsp; Authorization Letter
              </p>
            </div>
          </div>

          <!-- Scope & Locations Grid -->
          <div style="display: flex; gap: 10px; margin-bottom: 6px;">
            <div class="content-panel" style="flex: 1.2;">
              <div class="panel-header">Scope Of Work</div>
              <ul class="panel-list">
                <li>Conducting Women Health & Hygiene Awareness Sessions</li>
                <li>Organizing village, ward, gram panchayat and community awareness meetings</li>
                <li>Formation and support of women groups</li>
                <li>Menstrual hygiene and women wellness awareness</li>
                <li>Coordination with local stakeholders</li>
                <li>Distribution of SakhiHub approved awareness materials</li>
                <li>Promotion of SakhiHub Membership Program</li>
                <li>Collection of feedback and field reports</li>
              </ul>
            </div>
            <div class="content-panel" style="flex: 0.8;">
              <div class="panel-header">Authorized Visit Locations</div>
              <ul class="panel-list">
                <li>District Offices</li>
                <li>Janpad Panchayat Offices</li>
                <li>Gram Panchayats</li>
                <li>Community Centers</li>
                <li>SHGs (Self Help Groups)</li>
                <li>Educational Institutions</li>
                <li>Health Awareness Meetings</li>
                <li>Villages and Rural Communities</li>
              </ul>
            </div>
          </div>

          <!-- Important Declaration Box -->
          <div class="declaration-box" style="margin-bottom: 6px;">
            <strong>Important Declaration:</strong> SakhiHub is a private organization. This authorization is not a government department, not a government scheme, and not a government authority. The employee is authorized only for approved awareness and outreach activities.
          </div>

          <!-- QR Verification Block -->
          <div class="verification-block" style="margin: 4px 0 6px 0; padding: 6px 12px; border-radius: 10px;">
            <div class="verification-text" style="width: 78%; font-size: 9.5px; line-height: 1.35;">
              <h4 style="font-size: 9.5px; margin: 0 0 2px 0;">Digital Verification & Validity</h4>
              <p style="margin: 0 0 2px 0;">
                <strong>Valid From:</strong> ${formatDate(data.issueDate)} &nbsp;|&nbsp; <strong>Valid Until:</strong> ${formatDate(data.validUntil)}
              </p>
              <p style="margin: 0;">
                Scan the QR code to verify the live status of this authorization letter online on the official SakhiHub Verification Portal:
                <span class="verification-link" style="font-size: 8.5px;">${data.verificationUrl}</span>
              </p>
            </div>
            <div class="qr-container" style="width: 22%;">
              <img src="${qrCodeImageUrl}" class="qr-img" style="width: 54px; height: 54px; border-radius: 6px; padding: 1px;" alt="Verification QR Code" />
            </div>
          </div>

          ` : `
          <!-- BLOCK COORDINATOR TEMPLATE -->

          <!-- Profile Details Box (including Block) -->
          <div class="profile-info-box" style="margin: 6px 0; padding: 8px 16px; border-radius: 12px;">
            <table class="info-table" style="font-size: 10.5px;">
              <tr>
                <td class="info-label" style="width: 25%;">Representative Name</td>
                <td class="info-value" style="width: 25%;">: ${data.employeeName}</td>
                <td class="info-label" style="width: 20%;">Official Designation</td>
                <td class="info-value" style="width: 30%;">: ${data.designation}</td>
              </tr>
              <tr>
                <td class="info-label">Employee ID</td>
                <td class="info-value">: ${data.employeeId}</td>
                <td class="info-label">Assigned State</td>
                <td class="info-value">: ${data.state}</td>
              </tr>
              <tr>
                <td class="info-label">Assigned District</td>
                <td class="info-value">: ${data.district}</td>
                <td class="info-label">Assigned Block</td>
                <td class="info-value">: ${data.block || 'N/A'}</td>
              </tr>
              <tr>
                <td class="info-label">Authorization Number</td>
                <td class="info-value" style="font-family: monospace; color: #D91656; font-size: 10.5px;">: ${data.authorizationNumber}</td>
                <td class="info-label"></td>
                <td class="info-value"></td>
              </tr>
            </table>
          </div>

          <!-- Authorized Activities -->
          <div style="margin-bottom: 8px;">
            <div class="content-panel" style="padding: 8px 14px;">
              <div class="panel-header" style="font-size: 10.5px; padding-bottom: 3px; margin-bottom: 6px;">Authorized Activities</div>
              <ul class="panel-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 15px; padding-left: 14px; font-size: 10px;">
                <li>Village Visits</li>
                <li>Community Visits</li>
                <li>Women Group Meetings</li>
                <li>Awareness Sessions</li>
                <li>Membership Awareness</li>
                <li>Material Distribution</li>
                <li>Field Reporting</li>
              </ul>
            </div>
          </div>

          <!-- Private Organization Disclaimer & Cooperation Request -->
          <div style="display: flex; gap: 12px; margin-bottom: 8px;">
            <div class="declaration-box" style="flex: 1.1; margin-bottom: 0; padding: 10px 14px; font-size: 9.5px; display: flex; flex-direction: column; justify-content: center;">
              <strong>Private Organization Disclaimer:</strong>
              <p style="margin: 3px 0 0 0; line-height: 1.35; color: #991B1B;">
                SakhiHub is a private organization and this authorization does not imply any government authority.
              </p>
            </div>
            <div class="content-panel" style="flex: 0.9; background-color: #FFFDF5; border-color: #FEF08A; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; color: #854D0E; font-size: 10.5px; text-align: center; padding: 8px 12px;">
              <span style="font-style: italic; font-size: 11px; line-height: 1.4;">"Kindly extend cooperation wherever possible."</span>
            </div>
          </div>

          <!-- QR Verification Block -->
          <div class="verification-block" style="margin: 8px 0; padding: 8px 14px; border-radius: 12px;">
            <div class="verification-text" style="width: 78%; font-size: 10px; line-height: 1.4;">
              <h4 style="font-size: 10px; margin: 0 0 2px 0;">Digital Verification & Validity</h4>
              <p style="margin: 0 0 3px 0;">
                <strong>Valid From:</strong> ${formatDate(data.issueDate)} &nbsp;|&nbsp; <strong>Valid Until:</strong> ${formatDate(data.validUntil)}
              </p>
              <p style="margin: 0;">
                Scan the QR code to verify the live status of this authorization letter online on the official SakhiHub Verification Portal:
                <span class="verification-link" style="font-size: 9px; margin-top: 2px;">${data.verificationUrl}</span>
              </p>
            </div>
            <div class="qr-container" style="width: 22%;">
              <img src="${qrCodeImageUrl}" class="qr-img" style="width: 58px; height: 58px; border-radius: 6px; padding: 1px;" alt="Verification QR Code" />
            </div>
          </div>
          `}
        </div>
      </div>

      <!-- Main Body Bottom Section -->
      <div>
        <!-- 5. Signatures -->
        <div class="footer-signatures" style="margin-top: 10px; padding-top: 8px;">
          <div class="sig-col-left" style="min-height: 60px;">
            <div style="margin-bottom: 12px; font-style: italic; font-size: 9.5px;">
              Signature of Representative: __________________
            </div>
            <div class="sig-line" style="font-size: 9.5px; padding-top: 2px; margin-top: 4px;">
              ${data.employeeName}<br/>
              Field Representative
            </div>
          </div>
          <div class="sig-col-right" style="min-height: 60px;">
            <div style="height: 40px; display: flex; align-items: center; justify-content: center; width: 100%;">
              ${sealBase64 ? `<img src="${sealBase64}" class="seal-img" style="height: 52px; top: -14px;" alt="Official Seal" />` : ''}
              ${sigBase64 ? `<img src="${sigBase64}" class="sig-img" style="height: 28px;" alt="Authorized Signature" />` : ''}
            </div>
            <div class="sig-line" style="font-size: 9.5px; padding-top: 2px; margin-top: 4px;">
              Authorized Signatory<br/>
              <span class="auth-label" style="font-size: 8.5px; margin-top: 1px;">SakhiHub Compliance</span>
            </div>
          </div>
        </div>

        <!-- 6. Disclaimer Footer -->
        <div class="legal-disclaimer-box" style="margin-top: 4px; padding-top: 4px;">
          <div class="disclaimer-title" style="font-size: 7.5px;">Mandatory Legal Disclaimer</div>
          <p class="disclaimer-text" style="font-size: 7px; line-height: 1.3;">
            SakhiHub is a private organization conducting awareness and community outreach activities. This authorization letter does not represent any Government Department, Government Scheme, Government Authority or Government Employment. The representative is not a government employee and has no authority to bind any government entity or collect cash on behalf of any government department.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};
