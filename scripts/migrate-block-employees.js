const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://adskys26_db_user:0E4WAzwn8C8I7yEd@cluster0.l4mm4jh.mongodb.net/sakhihub?appName=Cluster0';

async function migrate() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Database connected successfully!');

  // Define User schema
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    designation: String
  }));

  const query = { designation: 'Block Employee' };
  const totalMatched = await User.countDocuments(query);
  console.log(`Total matched users with designation "Block Employee": ${totalMatched}`);

  if (totalMatched === 0) {
    console.log('No records need migration. Database is already clean.');
    await mongoose.disconnect();
    return;
  }

  console.log('Executing updateMany...');
  const result = await User.updateMany(
    query,
    { $set: { designation: 'Block Coordinator' } }
  );

  console.log('Migration completed successfully!');
  console.log(`Matched records: ${result.matchedCount}`);
  console.log(`Modified records: ${result.modifiedCount}`);

  // Final verification check
  const remainingCount = await User.countDocuments({ designation: 'Block Employee' });
  console.log(`Verification: Remaining users with designation "Block Employee": ${remainingCount}`);

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
