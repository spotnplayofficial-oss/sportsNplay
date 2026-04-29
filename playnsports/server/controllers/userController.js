import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Block user
export const blockUser = async (req, res) => {
  try {
    const blocker = await User.findById(req.user._id);
    const blockeeId = req.params.id;

    if (blocker.blockedUsers.includes(blockeeId)) {
      return res.status(400).json({ message: 'Already blocked' });
    }

    blocker.blockedUsers.push(blockeeId);
    await blocker.save(); 

    res.json({ message: 'User blocked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const blocker = await User.findById(req.user._id);
    blocker.blockedUsers = blocker.blockedUsers.filter(
      id => id.toString() !== req.params.id
    );
    await blocker.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', 'name avatar');
    res.json(user.blockedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, phone, gender, dateOfBirth, city, state, country, bio } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (gender !== undefined) user.gender = gender;
  if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth || null;
  if (city !== undefined) user.city = city;
  if (state !== undefined) user.state = state;
  if (country !== undefined) user.country = country;
  if (bio !== undefined) user.bio = bio;

  await user.save();
  res.json({ message: 'Profile updated ✅', user });
});

export const getMyStreak = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    'loginStreak longestStreak lastLoginDate activeDays bookedDays'
  );
  if (!user) { res.status(404); throw new Error('User not found'); }

  const today = new Date().toISOString().split('T')[0];

  res.json({
    loginStreak: user.loginStreak || 0,
    longestStreak: user.longestStreak || 0,
    lastLoginDate: user.lastLoginDate,
    activeDays: user.activeDays || [],
    bookedDays: user.bookedDays || [],
    bookedToday: (user.bookedDays || []).includes(today),
    loggedInToday: user.lastLoginDate === today,
  });
});