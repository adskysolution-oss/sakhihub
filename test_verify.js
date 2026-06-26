const fs = require('fs');
const path = require('path');

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

async function test() {
  const dbConnect = (await import('./src/lib/mongodb.ts')).default;
  const User = (await import('./src/models/User.ts')).default;
  const { evaluateUserActivation } = await import('./src/services/activationService.ts');

  await dbConnect();
  console.log("DB Connected!");

  // Search for the user: GAMPALA PRAVALLIKA
  const user = await User.findOne({
    $or: [
      { mobile: '9030962945' },
      { fullName: /PRAVALLIKA/i }
    ]
  });

  if (!user) {
    console.log("User GAMPALA PRAVALLIKA not found in database.");
    process.exit(0);
  }

  console.log("=== BEFORE EVALUATION ===");
  console.log({
    id: user._id.toString(),
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    assignmentStatus: user.assignmentStatus,
    parentVendorId: user.parentVendorId,
    documentsVerified: user.documentsVerified,
    paymentCompleted: user.paymentCompleted,
    dashboardAccess: user.dashboardAccess,
    onboardingCompleted: user.onboardingCompleted
  });

  console.log("Running evaluateUserActivation...");
  const updatedUser = await evaluateUserActivation(user._id.toString());

  console.log("=== AFTER EVALUATION ===");
  console.log({
    id: updatedUser._id.toString(),
    fullName: updatedUser.fullName,
    role: updatedUser.role,
    status: updatedUser.status,
    assignmentStatus: updatedUser.assignmentStatus,
    parentVendorId: updatedUser.parentVendorId,
    documentsVerified: updatedUser.documentsVerified,
    paymentCompleted: updatedUser.paymentCompleted,
    dashboardAccess: updatedUser.dashboardAccess,
    onboardingCompleted: updatedUser.onboardingCompleted
  });

  process.exit(0);
}

test().catch(console.error);
