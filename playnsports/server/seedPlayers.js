import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Player from './models/Player.js';

dotenv.config();

const INDIAN_PLAYERS = [
  { name: 'Arjun Singh', city: 'Delhi',       coords: [77.2090, 28.6139], sport: 'cricket',     skill: 'advanced',     bio: 'Opening batsman, love T20s 🏏', phone: '9876543001' },
  { name: 'Priya Sharma', city: 'Delhi',      coords: [77.2310, 28.6280], sport: 'badminton',   skill: 'intermediate', bio: 'Doubles specialist 🏸',          phone: '9876543002' },
  { name: 'Rohit Verma', city: 'Mumbai',      coords: [72.8777, 19.0760], sport: 'football',    skill: 'beginner',     bio: 'Weekend warrior ⚽',             phone: '9876543003' },
  { name: 'Sneha Patel', city: 'Mumbai',      coords: [72.8300, 19.0180], sport: 'tennis',      skill: 'advanced',     bio: 'State level player 🎾',          phone: '9876543004' },
  { name: 'Vikram Joshi', city: 'Bangalore',  coords: [77.5946, 12.9716], sport: 'basketball',  skill: 'intermediate', bio: 'Point guard 🏀',                 phone: '9876543005' },
  { name: 'Anjali Rao', city: 'Bangalore',    coords: [77.5700, 12.9350], sport: 'volleyball',  skill: 'beginner',     bio: 'Learning to spike! 🏐',          phone: '9876543006' },
  { name: 'Karan Mehta', city: 'Pune',        coords: [73.8567, 18.5204], sport: 'cricket',     skill: 'advanced',     bio: 'Fast bowler 💨',                 phone: '9876543007' },
  { name: 'Neha Gupta', city: 'Pune',         coords: [73.8800, 18.5300], sport: 'badminton',   skill: 'advanced',     bio: 'District champion 🏸',           phone: '9876543008' },
  { name: 'Aditya Kumar', city: 'Hyderabad',  coords: [78.4867, 17.3850], sport: 'football',    skill: 'intermediate', bio: 'Midfielder 🔥',                  phone: '9876543009' },
  { name: 'Kavitha Reddy', city: 'Hyderabad', coords: [78.4500, 17.4000], sport: 'tennis',      skill: 'beginner',     bio: 'Just started playing 🎾',        phone: '9876543010' },
  { name: 'Ravi Shankar', city: 'Chennai',    coords: [80.2707, 13.0827], sport: 'cricket',     skill: 'intermediate', bio: 'All-rounder 🏏',                 phone: '9876543011' },
  { name: 'Lakshmi Nair', city: 'Chennai',    coords: [80.2400, 13.0600], sport: 'basketball',  skill: 'advanced',     bio: 'Shooting guard 🏀',              phone: '9876543012' },
  { name: 'Manish Tiwari', city: 'Kolkata',   coords: [88.3639, 22.5726], sport: 'football',    skill: 'advanced',     bio: 'Striker, Mohun Bagan fan ⚽',    phone: '9876543013' },
  { name: 'Suman Das', city: 'Kolkata',       coords: [88.3400, 22.5500], sport: 'cricket',     skill: 'beginner',     bio: 'Gully cricket champion 🏏',      phone: '9876543014' },
  { name: 'Deepak Chauhan', city: 'Jaipur',   coords: [75.7873, 26.9124], sport: 'volleyball',  skill: 'intermediate', bio: 'Setter 🏐',                      phone: '9876543015' },
  { name: 'Pooja Bisht', city: 'Jaipur',      coords: [75.8100, 26.9200], sport: 'boxing',      skill: 'advanced',     bio: 'State level boxer 🥊',           phone: '9876543016' },
  { name: 'Suresh Yadav', city: 'Lucknow',    coords: [80.9462, 26.8467], sport: 'cricket',     skill: 'intermediate', bio: 'Spin bowler 🌀',                 phone: '9876543017' },
  { name: 'Anita Mishra', city: 'Lucknow',    coords: [80.9200, 26.8600], sport: 'badminton',   skill: 'beginner',     bio: 'Casual player 🏸',               phone: '9876543018' },
  { name: 'Gaurav Rajput', city: 'Chandigarh',coords: [76.7794, 30.7333], sport: 'football',    skill: 'advanced',     bio: 'Captain material ⚽',            phone: '9876543019' },
  { name: 'Simran Kaur', city: 'Chandigarh',  coords: [76.7600, 30.7200], sport: 'basketball',  skill: 'intermediate', bio: 'Point guard 🏀',                 phone: '9876543020' },
  { name: 'Ashish Thakur', city: 'Ahmedabad', coords: [72.5714, 23.0225], sport: 'cricket',     skill: 'advanced',     bio: 'Wicket keeper 🧤',               phone: '9876543021' },
  { name: 'Megha Desai', city: 'Ahmedabad',   coords: [72.5500, 23.0100], sport: 'tennis',      skill: 'intermediate', bio: 'Forehand specialist 🎾',         phone: '9876543022' },
  { name: 'Pankaj Pandey', city: 'Indore',    coords: [75.8577, 22.7196], sport: 'football',    skill: 'beginner',     bio: 'Right winger ⚽',                phone: '9876543023' },
  { name: 'Shruti Jain', city: 'Indore',      coords: [75.8400, 22.7300], sport: 'volleyball',  skill: 'advanced',     bio: 'Libero position 🏐',             phone: '9876543024' },
  { name: 'Nikhil Rathore', city: 'Bhopal',   coords: [77.4126, 23.2599], sport: 'boxing',      skill: 'intermediate', bio: 'Southpaw boxer 🥊',              phone: '9876543025' },
  { name: 'Divya Saxena', city: 'Bhopal',     coords: [77.4300, 23.2700], sport: 'badminton',   skill: 'advanced',     bio: 'Singles player 🏸',              phone: '9876543026' },
  { name: 'Harsh Vardhan', city: 'Nagpur',    coords: [79.0882, 21.1458], sport: 'cricket',     skill: 'beginner',     bio: 'Pace bowler in the making 🏏',   phone: '9876543027' },
  { name: 'Ritika Sharma', city: 'Nagpur',    coords: [79.0700, 21.1600], sport: 'basketball',  skill: 'beginner',     bio: 'Center player 🏀',               phone: '9876543028' },
  { name: 'Sanjay Patil', city: 'Goa',        coords: [73.8278, 15.4909], sport: 'football',    skill: 'advanced',     bio: 'Beach football lover ⚽',        phone: '9876543029' },
  { name: 'Tanvi Kulkarni', city: 'Goa',      coords: [73.8100, 15.5000], sport: 'volleyball',  skill: 'intermediate', bio: 'Beach volleyball player 🏐',     phone: '9876543030' },
];

const seedPlayers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('Test@123', 10);
    let created = 0;

    for (const p of INDIAN_PLAYERS) {
      const email = p.name.toLowerCase().replace(/\s+/g, '.') + '@spotnplay.demo';

      // Skip if user already exists
      const exists = await User.findOne({ email });
      if (exists) {
        console.log(`⏭️  Skipping ${p.name} (already exists)`);
        continue;
      }

      // Create user (bypass pre-save hook by using already-hashed password)
      const user = await User.create({
        name: p.name,
        email,
        password: hashedPassword,
        role: 'player',
        phone: p.phone,
      });

      // Create player profile
      await Player.create({
        user: user._id,
        sport: p.sport,
        isAvailable: true,
        location: { type: 'Point', coordinates: p.coords },
        skillLevel: p.skill,
        bio: p.bio,
      });

      created++;
      console.log(`✅ Created ${p.name} (${p.sport}) in ${p.city}`);
    }

    console.log(`\n🎉 Done! Created ${created} new players.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedPlayers();
