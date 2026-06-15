import fs from 'fs';
import path from 'path';

// Parse .env.local manually
try {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && !key.startsWith('#')) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.error("Failed to parse .env.local", e);
}

import { generateAgreementHtml, generatePdfBuffer } from './src/utils/pdfGenerator';

async function main() {
  const mockData = {
    vendorName: "TEST VENDOR PARTNER PVT LTD",
    address: "123, Sector 1, Industrial Area",
    district: "Indore",
    state: "Madhya Pradesh",
    mobile: "+91 9988776655",
    email: "vendor.test@sakhihub.com",
    vendorCode: "SH-VND-9999",
    joiningDate: "15 June 2026",
    agreementValidity: "3 Years",
    coordinatorType: "State Level Partner",
    assignedRegions: "Madhya Pradesh Region",
    agreementId: "SH-VAGR-TEST-009",
    qrVerificationCode: "VERIFY-99887766-OK",
    status: "approved",
    employeeCommissionAmount: "500",
    membershipIncentiveAmount: "10",
    acceptanceTimestamp: "15 June 2026, 12:00 PM"
  };

  console.log("1. Generating HTML...");
  const html = generateAgreementHtml(mockData);
  fs.writeFileSync('out_agreement.html', html);
  console.log("   HTML saved to: out_agreement.html");

  console.log("2. Generating PDF Buffer...");
  const pdfBuffer = await generatePdfBuffer(html, mockData.agreementId);
  fs.writeFileSync('out_agreement.pdf', pdfBuffer);
  console.log("   PDF saved to: out_agreement.pdf");

  console.log("3. Counting PDF Pages...");
  const dataString = (pdfBuffer as any).toString('binary');
  const matches = dataString.match(/\/Type\s*\/Page\b/g);
  const pageCount = matches ? matches.length : 0;
  console.log(`   Detected Page Count: ${pageCount}`);
}

main().catch(console.error);
