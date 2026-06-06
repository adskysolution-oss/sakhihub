import fs from 'fs';
import path from 'path';

// Parse .env.local manually
try {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    envContent.split('\n').forEach(line => {
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

import dbConnect from './src/lib/mongodb';
import User from './src/models/User';
import WomenMember from './src/models/WomenMember';
import Membership from './src/models/Membership';

async function test() {
  await dbConnect();
  console.log("DB Connected!");

  const vendors = await User.find({ role: 'vendor' }).limit(5).lean();
  console.log(`Found ${vendors.length} vendors.`);
  
  for (const vendor of vendors) {
    const userObjectId = vendor._id;
    const userHierarchy = await User.aggregate([
      { $match: { _id: userObjectId } },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentVendorId',
          as: 'descendants'
        }
      }
    ]);

    const descendants = userHierarchy[0]?.descendants || [];
    const directAndIndirectUserIds = [userObjectId, ...descendants.map((d: any) => d._id)];
    
    const vendorCodes = [vendor, ...descendants]
      .filter((u: any) => u.role === 'vendor' && u.vendorCode)
      .map((u: any) => u.vendorCode);
    const subVendorCodes = [vendor, ...descendants]
      .filter((u: any) => u.role === 'sub_vendor' && u.subVendorCode)
      .map((u: any) => u.subVendorCode);

    const memberIds = await WomenMember.find({
      $or: [
        { assignedEmployeeId: { $in: directAndIndirectUserIds } },
        { subVendorCode: { $in: subVendorCodes } },
        { vendorCode: { $in: vendorCodes } }
      ]
    }).distinct('_id');

    const memberships = await Membership.find({ memberId: { $in: memberIds } }).lean();

    console.log(`Vendor: ${vendor.fullName} (${vendor.vendorCode}):`);
    console.log(`  Descendants (SV/Emp): ${descendants.length}`);
    console.log(`  Members assigned: ${memberIds.length}`);
    console.log(`  Memberships paid/found: ${memberships.length}`);
  }

  process.exit(0);
}

test().catch(console.error);
