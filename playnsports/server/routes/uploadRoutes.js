import express from 'express';
import { uploadAvatar, uploadCertificate } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/certificate', protect, upload.single('certificate'), uploadCertificate);

export default router;