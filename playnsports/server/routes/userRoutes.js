import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { blockUser, unblockUser, getBlockedUsers } from '../controllers/userController.js';

const router = express.Router();

router.post('/block/:id', protect, blockUser);
router.post('/unblock/:id', protect, unblockUser);
router.get('/blocked', protect, getBlockedUsers);

export default router;