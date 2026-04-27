import asyncHandler from 'express-async-handler';
import Coach from '../models/Coach.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Ground from '../models/Ground.js';

// ── existing ──────────────────────────────────────────────

const getAllCoaches = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const coaches = await Coach.find(query).populate('user', 'name email avatar').sort('-createdAt');
  res.json(coaches);
});

const approveCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findById(req.params.id);
  if (!coach) { res.status(404); throw new Error('Coach not found'); }
  coach.status = 'approved';
  coach.rejectionReason = '';
  await coach.save();
  await User.findByIdAndUpdate(coach.user, { role: 'coach' });
  res.json({ message: 'Coach approved ✅', coach });
});

const rejectCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findById(req.params.id);
  if (!coach) { res.status(404); throw new Error('Coach not found'); }
  coach.status = 'rejected';
  coach.rejectionReason = req.body.reason || 'Application rejected';
  await coach.save();
  res.json({ message: 'Coach rejected', coach });
});

// ── expanded stats ─────────────────────────────────────────

const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalCoaches, pendingCoaches, approvedCoaches,
    totalGrounds, socialGrounds, totalBookings,
    pendingApprovals, completedBookings, cancelledBookings,
    playerCount, groundOwnerCount,
  ] = await Promise.all([
    User.countDocuments(),
    Coach.countDocuments(),
    Coach.countDocuments({ status: 'pending' }),
    Coach.countDocuments({ status: 'approved' }),
    Ground.countDocuments(),
    Ground.countDocuments({ isSocial: true }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending_approval' }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    User.countDocuments({ role: 'player' }),
    User.countDocuments({ role: 'ground_owner' }),
  ]);

  res.json({
    totalUsers, totalCoaches, pendingCoaches, approvedCoaches,
    totalGrounds, socialGrounds, totalBookings,
    pendingApprovals, completedBookings, cancelledBookings,
    playerCount, groundOwnerCount,
  });
});

// ── new: social ground booking approval ───────────────────

const getPendingSocialBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ status: 'pending_approval' })
    .populate('player', 'name email phone avatar')
    .populate('ground', 'name address sport isSocial')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

const approveSocialBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('ground');
  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  // Mark slot as booked in ground
  const ground = await Ground.findById(booking.ground._id);
  const slot = ground.slots.id(booking.slot);
  if (slot) {
    slot.isBooked = true;
    slot.bookedBy = booking.player;
    await ground.save();
  }

  booking.status = 'completed';
  await booking.save();

  res.json({ message: 'Booking approved ✅', booking });
});

const rejectSocialBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  // Remove the slot from ground entirely
  const ground = await Ground.findById(booking.ground);
  if (ground) {
    ground.slots = ground.slots.filter(
      s => s._id.toString() !== booking.slot.toString()
    );
    await ground.save();
  }

  booking.status = 'cancelled';
  await booking.save();

  res.json({ message: 'Booking rejected', booking });
});

// ── all users (for users tab) ─────────────────────────────

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  res.json(users);
});

const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ message: `User ${user.isActive ? 'activated' : 'banned'}`, isActive: user.isActive });
});

// ── all bookings ──────────────────────────────────────────

const getAllBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const bookings = await Booking.find(query)
    .populate('player', 'name email phone')
    .populate('ground', 'name address sport')
    .sort('-createdAt')
    .limit(100);
  res.json(bookings);
});

export {
  getAllCoaches, approveCoach, rejectCoach, getDashboardStats,
  getPendingSocialBookings, approveSocialBooking, rejectSocialBooking,
  getAllUsers, toggleUserActive, getAllBookings,
};