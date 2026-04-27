import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const ADMINS = [
  {
    name: 'Admin One',
    email: 'admin@gmail.com',
    password: '123456',
  },
  {
    name: 'Admin Two',
    email: 'admin2@gmail.com',
    password: '123456',
  },
  {
    name: 'Admin Three',
    email: 'admin3@gmail.com',
    password: '123456',
  },
  {
    name: 'Admin Four',
    email: 'admin4@gmail.com',
    password: '123456',
  },
];

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;

    for (const admin of ADMINS) {
      const exists = await User.findOne({ email: admin.email });

      if (exists) {
        console.log(`⏭️  Skipping ${admin.email} (already exists)`);
        continue;
      }

      // hash password manually (same pattern as your player seed)
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      await User.create({
        name: admin.name,
        email: admin.email,
        password: admin.password,
        role: 'admin',
      });

      console.log(`✅ Created admin: ${admin.email}`);
      created++;
    }

    console.log(`\n🎉 Done! Created ${created} admin(s).`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmins();