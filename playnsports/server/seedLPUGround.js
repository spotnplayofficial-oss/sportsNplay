import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Ground from './models/Ground.js';

dotenv.config();

// Fresh ground owner for LPU Indoor Stadium
const LPU_COORDS = [75.7023, 31.2537];

const getDates = (count = 14) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const GROUNDS = [
  {
    name: 'LPU Badminton Courts — Shanti Devi Mittal Complex',
    sport: 'badminton',
    pricePerHour: 300,
    address: 'Shanti Devi Mittal Indoor Sports Complex, Near BH-1, LPU, Phagwara, Punjab 144411',
    amenities: ['Indoor Courts', 'Wooden Flooring', 'Professional Nets', 'Floodlights', 'AC', 'Locker Room', 'Drinking Water', 'Washrooms'],
    slots: [
      { startTime: '06:00', endTime: '07:00' },
      { startTime: '07:00', endTime: '08:00' },
      { startTime: '08:00', endTime: '09:00' },
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '15:30', endTime: '16:30' },
      { startTime: '16:30', endTime: '17:30' },
      { startTime: '17:30', endTime: '18:30' },
      { startTime: '18:30', endTime: '19:30' },
      { startTime: '19:30', endTime: '20:30' },
      { startTime: '20:30', endTime: '21:30' },
    ],
  },
  {
    name: 'LPU Basketball Arena — Shanti Devi Mittal Complex',
    sport: 'basketball',
    pricePerHour: 300,
    address: 'Shanti Devi Mittal Indoor Sports Complex, Near BH-1, LPU, Phagwara, Punjab 144411',
    amenities: ['Full Court', 'Wooden Flooring', 'Scoreboards', 'Floodlights', 'AC', 'Locker Room', 'First Aid'],
    slots: [
      { startTime: '06:00', endTime: '07:00' },
      { startTime: '07:00', endTime: '08:00' },
      { startTime: '08:00', endTime: '09:00' },
      { startTime: '15:30', endTime: '16:30' },
      { startTime: '16:30', endTime: '17:30' },
      { startTime: '18:30', endTime: '19:30' },
      { startTime: '19:30', endTime: '20:30' },
    ],
  },
  {
    name: 'LPU Volleyball Court — Shanti Devi Mittal Complex',
    sport: 'volleyball',
    pricePerHour: 250,
    address: 'Shanti Devi Mittal Indoor Sports Complex, Near BH-1, LPU, Phagwara, Punjab 144411',
    amenities: ['Indoor Court', 'Professional Nets', 'Wooden Flooring', 'Floodlights', 'Drinking Water'],
    slots: [
      { startTime: '06:00', endTime: '07:00' },
      { startTime: '07:00', endTime: '08:00' },
      { startTime: '16:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '18:00' },
      { startTime: '18:30', endTime: '19:30' },
      { startTime: '19:30', endTime: '20:30' },
    ],
  },
  {
    name: 'LPU Cricket Practice Nets — Sports Complex',
    sport: 'cricket',
    pricePerHour: 200,
    address: 'LPU Sports Ground, Near Block 34, LPU, Phagwara, Punjab 144411',
    amenities: ['Practice Nets', 'Bowling Machine', 'Floodlights', 'Helmet & Pads', 'Drinking Water'],
    slots: [
      { startTime: '06:00', endTime: '07:00' },
      { startTime: '07:00', endTime: '08:00' },
      { startTime: '08:00', endTime: '09:00' },
      { startTime: '16:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '18:00' },
    ],
  },
  {
    name: 'LPU Football Ground — Sports Complex',
    sport: 'football',
    pricePerHour: 500,
    address: 'LPU Sports Ground, Near Uni Gate 2, LPU, Phagwara, Punjab 144411',
    amenities: ['Full Size Ground', 'Natural Turf', 'Floodlights', 'Goal Posts', 'Changing Room', 'Washrooms'],
    slots: [
      { startTime: '06:00', endTime: '07:00' },
      { startTime: '07:00', endTime: '08:00' },
      { startTime: '16:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '19:00' },
    ],
  },
  {
    name: 'LPU Tennis Court — Sports Complex',
    sport: 'tennis',
    pricePerHour: 400,
    address: 'LPU Sports Complex, Near Block 32, LPU, Phagwara, Punjab 144411',
    amenities: ['Hard Court', 'Floodlights', 'Professional Nets', 'Rackets Available', 'Drinking Water'],
    slots: [
      { startTime: '06:00', endTime: '07:00' },
      { startTime: '07:00', endTime: '08:00' },
      { startTime: '16:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '19:00' },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete old LPU grounds if exist
    const oldOwner = await User.findOne({ email: 'lpu.sports@spotnplay.demo' });
    if (oldOwner) {
      await Ground.deleteMany({ owner: oldOwner._id });
      await User.deleteOne({ _id: oldOwner._id });
      console.log('🗑️  Cleaned old LPU data');
    }

    // Create fresh ground owner
    const hashedPassword = await bcrypt.hash('LPU@2025', 10);
    const owner = await User.create({
      name: 'LPU Sports Admin',
      email: 'lpu.sports@spotnplay.demo',
      password: hashedPassword,
      role: 'ground_owner',
      phone: '01824404404',
    });
    console.log('✅ Created ground owner: LPU Sports Admin');

    const dates = getDates(14); // 2 weeks
    let totalSlots = 0;

    for (const g of GROUNDS) {
      const allSlots = [];
      for (const date of dates) {
        for (const slot of g.slots) {
          if (allSlots.length >= 40) break;
          allSlots.push({
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: false, // all free, ready to book
          });
        }
        if (allSlots.length >= 40) break;
      }

      await Ground.create({
        owner: owner._id,
        name: g.name,
        sport: g.sport,
        address: g.address,
        pricePerHour: g.pricePerHour,
        location: { type: 'Point', coordinates: LPU_COORDS },
        amenities: g.amenities,
        slots: allSlots,
        isActive: true,
      });

      totalSlots += allSlots.length;
      console.log(`🏟️  ${g.name} — ${allSlots.length} slots`);
    }

    console.log(`\n🎉 Done! ${GROUNDS.length} grounds, ${totalSlots} total slots`);
    console.log(`🔑 Login: lpu.sports@spotnplay.demo / LPU@2025`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
};

seed();
