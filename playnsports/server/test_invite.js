import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Group from './models/Group.js';
import User from './models/User.js';

dotenv.config();

async function testInvite() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Find any open group
    const group = await Group.findOne({ isOpen: true }).populate('createdBy');
    if (!group) {
      console.log('No open group found');
      return;
    }

    console.log('Found group:', group.name, group._id);

    // Find a user who is NOT a member and NOT already invited
    const members = group.members.map(m => m.toString());
    const invited = group.invitations.map(inv => inv.user?.toString());
    
    const userToInvite = await User.findOne({
      _id: { $nin: [...members, ...invited] }
    });

    if (!userToInvite) {
      console.log('No suitable user found to invite');
      return;
    }

    console.log('Found user to invite:', userToInvite.name, userToInvite._id);

    // Try to invite
    group.invitations.push({ user: userToInvite._id, status: 'pending' });
    
    try {
      await group.save();
      console.log('Successfully saved invitation!');
    } catch (saveErr) {
      console.error('Error saving group:', saveErr.message);
      if (saveErr.name === 'ValidationError') {
        console.error('Validation errors:', JSON.stringify(saveErr.errors, null, 2));
      }
    }

  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testInvite();
