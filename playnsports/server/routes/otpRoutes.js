import express from 'express';
import { sendOTP, verifyOTP, checkUser } from '../controllers/otpController.js';

const router = express.Router();

router.post('/send', sendOTP);
router.post('/verify', verifyOTP);
router.post('/check', checkUser);

export default router;