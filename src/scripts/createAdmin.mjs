import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Manually parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envLines = envFile.split('\n');
const env = {};
envLines.forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) env[key.trim()] = value.join('=').trim();
});

const MONGODB_URI = env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'employee', 'member'], default: 'member' },
  status: { type: String, enum: ['active', 'pending', 'inactive', 'rejected'], default: 'pending' },
  designation: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'super_admin' });
    if (adminExists) {
      console.log('Super Admin already exists:', adminExists.mobile);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const admin = await User.create({
      fullName: 'Super Admin',
      mobile: '9999999999',
      email: 'admin@sakhihub.com',
      password: hashedPassword,
      role: 'super_admin',
      status: 'active',
      designation: 'Platform Owner'
    });

    console.log('Super Admin created successfully!');
    console.log('Mobile:', admin.mobile);
    console.log('Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
