import express from 'express';
import { uploadAvatar, uploadCertificate, uploadEventImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload, uploadEvent } from '../config/cloudinary.js';

const router = express.Router();

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/certificate', protect, upload.single('certificate'), uploadCertificate);
router.post('/event', protect, uploadEvent.single('image'), uploadEventImage);

export default router;
