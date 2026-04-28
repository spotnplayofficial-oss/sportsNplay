import express from 'express';
import {
  setAvailability,
  getNearbyPlayers,
  getAllPlayers,
  getMyProfile,
  deleteAvailability,
  updatePlayerProfile,
  addCertificate,
  removeCertificate,
} from '../controllers/playerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/availability', protect, authorizeRoles('player'), setAvailability);
router.get('/nearby', protect, getNearbyPlayers);
router.get('/all', protect, getAllPlayers);
router.get('/me', protect, authorizeRoles('player'), getMyProfile);
router.patch('/offline', protect, authorizeRoles('player'), deleteAvailability);

// ── extended profile ──
router.patch('/profile', protect, authorizeRoles('player'), updatePlayerProfile);
router.post('/certificates', protect, authorizeRoles('player'), addCertificate);
router.delete('/certificates/:certId', protect, authorizeRoles('player'), removeCertificate);

export default router;