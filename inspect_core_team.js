const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

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

const MONGODB_URI = process.env.MONGODB_URI;

async function test() {
  await mongoose.connect(MONGODB_URI);
  console.log("DB Connected!");

  const members = await mongoose.connection.db.collection('coreteammembers').find().toArray();
  console.log("All Core Team Members count:", members.length);
  members.forEach(m => {
    console.log(JSON.stringify(m, null, 2));
  });

  process.exit(0);
}

test().catch(console.error);
