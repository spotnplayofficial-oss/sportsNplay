import asyncHandler from 'express-async-handler';
import Player from '../models/Player.js';

const setAvailability = asyncHandler(async (req, res) => {
  const { sport, skillLevel, bio, latitude, longitude } = req.body;

  // ← YE ADD KARO — validation
  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Location is required. Please allow location access.');
  }

  const player = await Player.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      sport,
      skillLevel,
      bio,
      isAvailable: true,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.json(player);
});

const getNearbyPlayers = asyncHandler(async (req, res) => {
  const { longitude, latitude, radius = 5000, sport, skillLevel } = req.query;

  const query = {
    isAvailable: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseFloat(radius),
      },
    },
  };

  if (sport) query.sport = sport;
  if (skillLevel) query.skillLevel = skillLevel;

  const players = await Player.find(query).populate('user', 'name phone avatar');

  res.json(players);
});

const getAllPlayers = asyncHandler(async (req, res) => {
  const { sport, skillLevel } = req.query;

  const query = { isAvailable: true };
  if (sport) query.sport = sport;
  if (skillLevel) query.skillLevel = skillLevel;

  const players = await Player.find(query).populate('user', 'name phone avatar gender');
  res.json(players);
});

const getMyProfile = asyncHandler(async (req, res) => {
  const player = await Player.findOne({ user: req.user._id }).populate('user', 'name phone avatar');

  if (!player) {
    return res.json(null);
  }

  res.json(player);
});

const deleteAvailability = asyncHandler(async (req, res) => {
  const player = await Player.findOne({ user: req.user._id });

  if (!player) {
    res.status(404);
    throw new Error('Player profile not found');
  }

  player.isAvailable = false;
  await player.save();

  res.json({ message: 'You are now offline' });
});

export { setAvailability, getNearbyPlayers, getAllPlayers, getMyProfile, deleteAvailability };

