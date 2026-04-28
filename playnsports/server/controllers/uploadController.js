import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.path },
    { new: true }
  ).select('-password');

  res.json({
    message: 'Avatar uploaded successfully ✅',
    avatar: user.avatar,
    user,
  });
});

// Certificate / document upload — returns the Cloudinary URL
const uploadCertificate = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  res.json({
    message: 'Certificate uploaded successfully ✅',
    fileUrl: req.file.path, // Cloudinary URL
  });
});

export { uploadAvatar, uploadCertificate };