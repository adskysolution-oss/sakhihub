import mongoose from 'mongoose';
import dbConnect from './src/lib/mongodb';
import VendorAgreement from './src/models/VendorAgreement';
import User from './src/models/User';
import AgreementVersion from './src/models/AgreementVersion';

async function test() {
  await dbConnect();
  const user = await User.findOne({ role: 'vendor' });
  if (!user) {
    console.log('No vendor found');
    process.exit(0);
  }

  try {
    const existingAgreement = await VendorAgreement.findOne({ vendorId: user._id });
    const versionNumber = existingAgreement ? (await AgreementVersion.countDocuments({ vendorId: user._id })) + 1 : 1;
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const agreementId = existingAgreement?.agreementId || `SH-VAGR-${randomStr}`;

    const vendorAgreementDetails = {
      vendorId: user._id,
      vendorCode: 'VEND123',
      partnerType: 'VENDOR PARTNERSHIP AGREEMENT',
      joiningDate: new Date(),
      status: 'generated',
      agreementId,
    };

    console.log('Trying findOneAndUpdate...');
    const updatedAgreement = await VendorAgreement.findOneAndUpdate(
      { vendorId: user._id },
      vendorAgreementDetails,
      { upsert: true, returnDocument: 'after' }
    );
    console.log('Success:', updatedAgreement);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

test();
