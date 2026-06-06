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
  const WomenMember = (await import('./src/models/WomenMember.ts')).default;
  const Membership = (await import('./src/models/Membership.ts')).default;
  const User = (await import('./src/models/User.ts')).default;

  await dbConnect();
  console.log("DB Connected!");

  const members = await WomenMember.find().lean();
  console.log("All Members:");
  members.forEach(m => {
    console.log(`Member _id: ${m._id.toString()} | Name: ${m.name} | userId: ${m.userId} | assignedEmployeeId: ${m.assignedEmployeeId} | VC: ${m.vendorCode} | SVC: ${m.subVendorCode}`);
  });

  const memberships = await Membership.find().lean();
  console.log("\nAll Memberships:");
  for (const ms of memberships) {
    const matchedMember = await WomenMember.findById(ms.memberId).lean();
    const matchedUser = await User.findById(ms.memberId).lean();
    console.log(`Membership ID: ${ms.membershipId} | memberId field: ${ms.memberId} | Matched Member: ${matchedMember ? matchedMember.name : 'NONE'} | Matched User: ${matchedUser ? matchedUser.fullName + ' (' + matchedUser.role + ')' : 'NONE'}`);
  }

  process.exit(0);
}

test().catch(console.error);
