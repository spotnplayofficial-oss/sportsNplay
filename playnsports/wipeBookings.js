import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Adjust path depending on where script runs to find .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

import Booking from './server/models/Booking.js';
import Ground from './server/models/Ground.js';
import Payment from './server/models/Payment.js';

const wipeBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/playnsports');
    console.log('Connected to DB');

    // Wipe specific collections that hold booking data
    await Booking.deleteMany({});
    console.log('Deleted all old Booking documents');

    await Payment.deleteMany({});
    console.log('Deleted all old Payment documents');

    // Clear dynamic flexible slots inside Ground
    const res = await Ground.updateMany(
      {},
      { $set: { slots: [] } }
    );
    console.log(`Cleared slot fields in ${res.modifiedCount} Grounds`);

    console.log('All previous slot booking data removed successfully!');
    process.exit();
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
};

wipeBookings();
