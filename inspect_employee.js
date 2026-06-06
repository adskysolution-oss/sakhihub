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

  await dbConnect();
  console.log("DB Connected!");

  const employeeId = '6a0b11d15be8eec0e2f70e23';
  const employee = await User.findById(employeeId).lean();
  if (!employee) {
    console.log("Employee not found");
    process.exit(0);
  }

  console.log(`Employee: ${employee.fullName} | parentVendorId: ${employee.parentVendorId}`);

  if (employee.parentVendorId) {
    const parent = await User.findById(employee.parentVendorId).lean();
    console.log(`Parent: ${parent ? parent.fullName + ' (' + parent.role + ')' : 'NONE'}`);
  }

  process.exit(0);
}

test().catch(console.error);
