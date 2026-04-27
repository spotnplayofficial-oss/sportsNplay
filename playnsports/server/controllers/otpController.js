import asyncHandler from 'express-async-handler';
import OTP from '../models/OTP.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendOTPEmail from '../utils/sendEmail.js';

const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const cleanEmail = email.toLowerCase().trim(); // ← add

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.deleteMany({ email: cleanEmail });
  await OTP.create({
  email: cleanEmail,
  otp,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });
  await sendOTPEmail(cleanEmail, otp);

  res.json({ message: 'OTP sent ✅' });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, name, phone, role, password } = req.body;

  console.log('Verify attempt:', { email, otp, type: typeof otp });

  // String convert karo dono ko
  const otpRecord = await OTP.findOne({ 
    email: email.toLowerCase().trim(),
  });

  console.log('DB record:', otpRecord?.otp, 'Received:', otp);

  if (!otpRecord) {
    res.status(400);
    throw new Error('OTP expired or not found. Please request a new one.');
  }

  // String comparison
  if (String(otpRecord.otp).trim() !== String(otp).trim()) {
    res.status(400);
    throw new Error('Invalid OTP. Please check and try again.');
  }

  if (new Date() > otpRecord.expiresAt) {
    await OTP.deleteOne({ email });
    res.status(400);
    throw new Error('OTP expired. Please request a new one.');
  }

  await OTP.deleteOne({ email });

  let user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    user = await User.create({
      name: name || 'Player',
      email: email.toLowerCase().trim(),
      password: password || Math.random().toString(36),
      role: role || 'player',
      phone: phone || '',
    });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar || '',
    token: generateToken(user._id, user.role),
  });
});

const checkUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  res.json({ exists: !!user });
});

export { sendOTP, verifyOTP, checkUser };

