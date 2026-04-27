import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const uploadAvatar = asyncHandler(async (req, res) => {
  console.log('FILE:', req.file);
  
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

export { uploadAvatar };