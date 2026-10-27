const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env before seeding.');
  process.exit(1);
}

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-issue-tracker');

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
    } else {
      admin.name = 'System Admin';
      admin.email = adminEmail;
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
    }

    await User.updateMany(
      { _id: { $ne: admin._id }, role: 'admin' },
      { $set: { role: 'user' } }
    );

    console.log(`Admin account ready: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

runSeed();
