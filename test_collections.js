const fs = require('fs');
const path = require('path');

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
} catch (e) {}

async function test() {
  const dbConnect = (await import('./src/lib/mongodb.ts')).default;
  const User = (await import('./src/models/User.ts')).default;
  const WomenMember = (await import('./src/models/WomenMember.ts')).default;
  const Membership = (await import('./src/models/Membership.ts')).default;

  await dbConnect();
  console.log("DB Connected!");

  const targetId = '6a0d6bc5b86e185a43fb6f42';
  const targetUser = await User.findById(targetId).lean();
  if (!targetUser) {
    console.log(`User ${targetId} not found in User collection!`);
    process.exit(0);
  }

  console.log(`Found User: Name="${targetUser.fullName}", Role="${targetUser.role}", Status="${targetUser.status}", parentVendorId="${targetUser.parentVendorId}"`);

  // Find all descendants recursively if they exist
  const userHierarchy = await User.aggregate([
    { $match: { _id: targetUser._id } },
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
  console.log(`Descendants count: ${descendants.length}`);
  descendants.forEach(d => {
    console.log(`  - Descendant: Name="${d.fullName}", Role="${d.role}", ID="${d._id.toString()}", parentVendorId="${d.parentVendorId}"`);
  });

  const directAndIndirectUserIds = [targetUser._id, ...descendants.map(d => d._id)];
  const vendorCodes = [targetUser, ...descendants].filter(u => u.role === 'vendor' && u.vendorCode).map(u => u.vendorCode);
  const subVendorCodes = [targetUser, ...descendants].filter(u => u.role === 'sub_vendor' && u.subVendorCode).map(u => u.subVendorCode);

  console.log(`directAndIndirectUserIds count: ${directAndIndirectUserIds.length}`);
  console.log(`vendorCodes:`, vendorCodes);
  console.log(`subVendorCodes:`, subVendorCodes);

  // Find all members assigned to this targetUser or their descendants
  const members = await WomenMember.find({
    $or: [
      { assignedEmployeeId: { $in: directAndIndirectUserIds } },
      { subVendorCode: { $in: subVendorCodes } },
      { vendorCode: { $in: vendorCodes } }
    ]
  }).lean();

  console.log(`Assigned Members count: ${members.length}`);
  members.forEach(m => {
    console.log(`  - Member: Name="${m.name}", ID="${m._id.toString()}", assignedEmployeeId="${m.assignedEmployeeId}"`);
  });

  const memberIds = members.map(m => m._id);
  const memberships = await Membership.find({ memberId: { $in: memberIds } }).lean();
  console.log(`Memberships count: ${memberships.length}`);
  memberships.forEach(ms => {
    console.log(`  - Membership ID=${ms.membershipId}, memberId=${ms.memberId.toString()}, amount=${ms.amount}, paymentStatus=${ms.paymentStatus}`);
  });

  process.exit(0);
}

test().catch(console.error);
