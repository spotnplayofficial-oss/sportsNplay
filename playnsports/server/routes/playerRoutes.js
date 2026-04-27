import express from 'express';
import {
  setAvailability,
  getNearbyPlayers,
  getAllPlayers,
  getMyProfile,
  deleteAvailability,
} from '../controllers/playerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/availability', protect, authorizeRoles('player'), setAvailability);
router.get('/nearby', protect, getNearbyPlayers);
router.get('/all', protect, getAllPlayers);
router.get('/me', protect, authorizeRoles('player'), getMyProfile);
router.patch('/offline', protect, authorizeRoles('player'), deleteAvailability);

export default router;