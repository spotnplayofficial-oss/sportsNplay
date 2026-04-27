import express from 'express';
import {
  createGround,
  getMyGrounds,
  getNearbyGrounds,
  getAllGrounds,
  getGroundById,
  addSlots,
  updateGround,
  deleteGround,
} from '../controllers/groundController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('ground_owner'), createGround);
router.get('/my', protect, authorizeRoles('ground_owner'), getMyGrounds);
router.get('/nearby', protect, getNearbyGrounds);
router.get('/all', protect, getAllGrounds);
router.get('/:id', protect, getGroundById);
router.post('/:id/slots', protect, authorizeRoles('ground_owner'), addSlots);
router.put('/:id', protect, authorizeRoles('ground_owner'), updateGround);
router.delete('/:id', protect, authorizeRoles('ground_owner'), deleteGround);

export default router;