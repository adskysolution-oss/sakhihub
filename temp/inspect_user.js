const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', UserSchema, 'users');

    const user = await User.findOne({ mobile: '9030962945' });
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }

    console.log('User Details:');
    console.log({
      _id: user._id,
      fullName: user.get('fullName'),
      mobile: user.get('mobile'),
      role: user.get('role'),
      status: user.get('status'),
      assignmentStatus: user.get('assignmentStatus'),
      parentVendorId: user.get('parentVendorId'),
      campaignId: user.get('campaignId'),
      documentsVerified: user.get('documentsVerified'),
      paymentCompleted: user.get('paymentCompleted'),
      dashboardAccess: user.get('dashboardAccess'),
      onboardingCompleted: user.get('onboardingCompleted'),
      isVerified: user.get('isVerified'),
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
