require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/User');

async function createAdmin() {
  await connectDB();

  const [, , emailArg, passwordArg, ...nameParts] = process.argv;
  const email = (emailArg || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = passwordArg || process.env.ADMIN_PASSWORD;
  const name = nameParts.join(' ').trim() || process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error('Provide ADMIN_EMAIL and ADMIN_PASSWORD in .env, or run: npm run seed:admin -- admin@example.com password "Admin Name"');
    process.exit(1);
  }

  const existing = await User.findOne({ email }).select('+password');

  if (existing) {
    existing.name = name;
    existing.password = password;
    existing.role = 'admin';
    existing.status = 'approved';
    await existing.save();
    console.log(`Updated admin: ${email}`);
    process.exit(0);
  }

  await User.create({
    name,
    email,
    password,
    role: 'admin',
    status: 'approved',
    assignedExams: []
  });

  console.log(`Created admin: ${email}`);
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
