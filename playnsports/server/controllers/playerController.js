import asyncHandler from 'express-async-handler';
import Player from '../models/Player.js';
import User from '../models/User.js';

// ── existing ───────────────────────────────────────────────

const setAvailability = asyncHandler(async (req, res) => {
  const { sport, skillLevel, bio, latitude, longitude } = req.body;

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
  const player = await Player.findOne({ user: req.user._id }).populate('user', 'name phone avatar gender city state bio dateOfBirth country');
  if (!player) return res.json(null);
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

// ── new: update full player profile ──────────────────────

const updatePlayerProfile = asyncHandler(async (req, res) => {
  const {
    // User-level fields
    name, phone, gender, dateOfBirth, city, state, country, bio,
    // Player-level fields
    height, weight, sports, achievements, instagram, twitter,
  } = req.body;

  // 1. Update User document
  const userUpdates = {};
  if (name !== undefined) userUpdates.name = name;
  if (phone !== undefined) userUpdates.phone = phone;
  if (gender !== undefined) userUpdates.gender = gender;
  if (dateOfBirth !== undefined) userUpdates.dateOfBirth = dateOfBirth || null;
  if (city !== undefined) userUpdates.city = city;
  if (state !== undefined) userUpdates.state = state;
  if (country !== undefined) userUpdates.country = country;
  if (bio !== undefined) userUpdates.bio = bio;

  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(req.user._id, userUpdates);
  }

  // 2. Update or create Player document (upsert)
  const playerUpdates = {};
  if (height !== undefined) playerUpdates.height = height;
  if (weight !== undefined) playerUpdates.weight = weight;
  if (sports !== undefined) playerUpdates.sports = sports;
  if (achievements !== undefined) playerUpdates.achievements = achievements;
  if (instagram !== undefined) playerUpdates.instagram = instagram;
  if (twitter !== undefined) playerUpdates.twitter = twitter;
  if (bio !== undefined) playerUpdates.bio = bio;

  // Set primary sport/skillLevel from first sports entry if sports array updated
  if (sports && sports.length > 0) {
    playerUpdates.sport = sports[0].name;
    playerUpdates.skillLevel = sports[0].level;
  }

  let player = await Player.findOne({ user: req.user._id });

  if (player) {
    Object.assign(player, playerUpdates);
    await player.save();
  } else {
    // Player doc doesn't exist yet — create minimal one (no location required for profile-only)
    player = await Player.create({
      user: req.user._id,
      sport: sports?.[0]?.name || 'cricket',
      skillLevel: sports?.[0]?.level || 'beginner',
      location: { type: 'Point', coordinates: [0, 0] },
      ...playerUpdates,
    });
  }

  const updated = await Player.findOne({ user: req.user._id })
    .populate('user', 'name phone avatar gender city state bio dateOfBirth country');
  res.json(updated);
});

// ── new: add certificate to player profile ────────────────

const addCertificate = asyncHandler(async (req, res) => {
  const { title, fileUrl } = req.body;
  if (!title || !fileUrl) {
    res.status(400);
    throw new Error('Title and file URL required');
  }

  const player = await Player.findOne({ user: req.user._id });
  if (!player) {
    res.status(404);
    throw new Error('Player profile not found');
  }

  player.certificates.push({ title, fileUrl });
  await player.save();
  res.json(player.certificates);
});

// ── new: remove certificate ───────────────────────────────

const removeCertificate = asyncHandler(async (req, res) => {
  const player = await Player.findOne({ user: req.user._id });
  if (!player) {
    res.status(404);
    throw new Error('Player profile not found');
  }

  player.certificates = player.certificates.filter(
    c => c._id.toString() !== req.params.certId
  );
  await player.save();
  res.json(player.certificates);
});

export {
  setAvailability,
  getNearbyPlayers,
  getAllPlayers,
  getMyProfile,
  deleteAvailability,
  updatePlayerProfile,
  addCertificate,
  removeCertificate,
};