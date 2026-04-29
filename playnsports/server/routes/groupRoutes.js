import express from 'express';
import {
  createGroup,
  getMyGroups,
  getNearbyGroups,
  invitePlayer,
  respondToInvitation,
  joinGroup,
  leaveGroup,
  closeGroup,
  getMyInvitations,
  getInvitablePlayers,
  removeMember,
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createGroup);
router.get('/my', protect, getMyGroups);
router.get('/nearby', protect, getNearbyGroups);
router.get('/invitations', protect, getMyInvitations);
router.post('/:id/invite', protect, invitePlayer);
router.patch('/:id/respond', protect, respondToInvitation);
router.patch('/:id/join', protect, joinGroup);
router.patch('/:id/leave', protect, leaveGroup);
router.patch('/:id/close', protect, closeGroup);
router.get('/:id/invitable-players', protect, getInvitablePlayers);
router.patch('/:id/remove-member', protect, removeMember);

export default router;