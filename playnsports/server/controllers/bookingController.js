import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';
import Ground from '../models/Ground.js';


const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ player: req.user._id })
    .populate('ground', 'name address sport pricePerHour')
    .sort({ createdAt: -1 });

  const today = new Date();
  today.setHours(0,0,0,0);

  const activeBookings = bookings.filter(b => {
    if (['cancelled', 'refunded', 'pending'].includes(b.status)) return false;
    
    // Check if date has passed
    const bDate = new Date(b.date + 'T00:00:00');
    bDate.setHours(0,0,0,0);
    return bDate.getTime() >= today.getTime();
  });

  res.json(activeBookings);
});

const getGroundBookings = asyncHandler(async (req, res) => {
  const ground = await Ground.findOne({ _id: req.params.id, owner: req.user._id });
  if (!ground) {
    res.status(404);
    throw new Error('Ground not found or unauthorized');
  }

  const bookings = await Booking.find({ ground: req.params.id })
    .populate('player', 'name phone')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, player: req.user._id });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found or unauthorized');
  }

  const ground = await Ground.findById(booking.ground);
  const slot = ground.slots.id(booking.slot);
  if (slot) {
    slot.isBooked = false;
    slot.bookedBy = null;
    await ground.save();
  }

  booking.status = 'cancelled';
  await booking.save();

  res.json({ message: 'Booking cancelled successfully' });
});

const bookGroundSlot = asyncHandler(async (req, res) => {
  const { slotId } = req.body;
  const ground = await Ground.findById(req.params.id);

  if (!ground) {
    res.status(404);
    throw new Error('Ground not found');
  }
  
  if (!ground.isSocial) {
    res.status(400);
    throw new Error('This ground requires payment to book');
  }

  const slot = ground.slots.id(slotId);
  if (!slot) {
    res.status(404);
    throw new Error('Slot not found');
  }

  if (slot.isBooked) {
    res.status(400);
    throw new Error('Slot already booked');
  }

  slot.isBooked = true;
  slot.bookedBy = req.user._id;
  await ground.save();

  const booking = await Booking.create({
    player: req.user._id,
    ground: ground._id,
    slot: slot._id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    totalPrice: 0,
    advancePrice: 0,
    remainingPrice: 0,
    status: 'completed'
  });

  res.status(201).json(booking);
});

const bookSocialGroundSlot = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const ground = await Ground.findById(req.params.id);

  if (!ground) {
    res.status(404);
    throw new Error('Ground not found');
  }

  if (!ground.isSocial) {
    res.status(400);
    throw new Error('This ground is not a social ground');
  }

  // Validate date is today or tomorrow
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);
  const tomorrowObj = new Date(todayObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);

  const reqDateObj = new Date(date + 'T00:00:00');
  reqDateObj.setHours(0,0,0,0);

  if (reqDateObj.getTime() !== todayObj.getTime() && reqDateObj.getTime() !== tomorrowObj.getTime()) {
    res.status(400);
    throw new Error('Booking only allowed for today or tomorrow');
  }

  // Validate time between 09:00 and 19:00, valid duration, and max 1 hour length
  const t2m = (t) => { const [h, m] = t.split(':'); return parseInt(h)*60 + parseInt(m); };
  
  const startMins = t2m(startTime);
  const endMins = t2m(endTime);

  if (startMins < 9*60 || endMins > 19*60 || startMins >= endMins) {
    res.status(400);
    throw new Error('Time must be between 09:00 and 19:00, with a valid duration');
  }

  if (endMins - startMins > 60) {
    res.status(400);
    throw new Error('You can only book a maximum of 1 hour per slot');
  }

  // Removed 2-hour constraint

  // Check if player has booked today; enforce non-consecutive rule
  const existingUserBookings = await Booking.find({
    player: req.user._id,
    date: date,
    status: { $ne: 'cancelled' }
  });

  for (const b of existingUserBookings) {
    const eStart = t2m(b.startTime);
    if (Math.abs(startMins - eStart) === 0) {
      res.status(400);
      throw new Error('You have already booked this slot!');
    }
    // If the diff between starts is exactly 60 or less, they are consecutive or overlapping
    if (Math.abs(startMins - eStart) <= 60) {
      res.status(400);
      throw new Error('You cannot book consecutive slots. Please leave at least a 1-hour gap between bookings.');
    }
  }

  // Check overlap against ALL existing booked slots for this date
  const existingSlots = ground.slots.filter(s => s.date === date && s.isBooked);
  for (const s of existingSlots) {
    const eStart = t2m(s.startTime);
    const eEnd = t2m(s.endTime);
    if (startMins < eEnd && endMins > eStart) {
      res.status(400);
      throw new Error('Slot already booked');
    }
  }

  // Push custom flexible slot
  ground.slots.push({
    date,
    startTime,
    endTime,
    isBooked: false,
    bookedBy: null,
  });
  
  const newSlot = ground.slots[ground.slots.length - 1];
  await ground.save();

  const booking = await Booking.create({
    player: req.user._id,
    ground: ground._id,
    slot: newSlot._id,
    date,
    startTime,
    endTime,
    totalPrice: 0,
    advancePrice: 0,
    remainingPrice: 0,
    status: 'pending_approval'
  });

  res.status(201).json(booking);
});

export { getMyBookings, getGroundBookings, cancelBooking, bookGroundSlot, bookSocialGroundSlot };