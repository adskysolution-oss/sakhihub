const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

let MONGO_URI;
try {
  const dotenvContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const env = {};
  dotenvContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
      env[key] = val;
    }
  });
  MONGO_URI = env.MONGODB_URI;
} catch (e) {
  MONGO_URI = process.env.MONGODB_URI;
}

if (!MONGO_URI) {
  console.error("MONGODB_URI not found.");
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String },
  role: { type: String },
  status: { type: String, lowercase: true }
});

const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

async function run() {
  console.log("Connecting to:", MONGO_URI.replace(/:([^@]+)@/, ':****@'));
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const hashedPassword = await bcrypt.hash('Sakhi@Hub2026', 10);
  
  let admin = await User.findOne({ role: 'super_admin' });
  if (admin) {
    console.log("Found existing super admin:", admin.email, admin.mobile);
    admin.email = 'Anil.r@sakhihub.com';
    admin.password = hashedPassword;
    admin.status = 'active';
    await admin.save();
    console.log("Super Admin updated successfully to email: Anil.r@sakhihub.com");
  } else {
    console.log("No super admin found. Creating one...");
    admin = await User.create({
      fullName: 'Super Admin',
      mobile: '9999999999',
      email: 'Anil.r@sakhihub.com',
      password: hashedPassword,
      role: 'super_admin',
      status: 'active'
    });
    console.log("Super Admin created successfully with email: Anil.r@sakhihub.com");
  }
}

run()
  .then(() => {
    console.log("Script completed successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("Fatal Error running script:", err);
    process.exit(1);
  });
