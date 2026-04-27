import express from 'express';
import adminProtect from '../middleware/adminMiddleware.js';
import {
  getAllCoaches, approveCoach, rejectCoach, getDashboardStats,
  getPendingSocialBookings, approveSocialBooking, rejectSocialBooking,
  getAllUsers, toggleUserActive, getAllBookings,
} from '../controllers/adminController.js';

const router = express.Router();

// stats
router.get('/stats', adminProtect, getDashboardStats);

// coaches
router.get('/coaches', adminProtect, getAllCoaches);
router.patch('/coaches/:id/approve', adminProtect, approveCoach);
router.patch('/coaches/:id/reject', adminProtect, rejectCoach);

// social booking approvals
router.get('/social-bookings/pending', adminProtect, getPendingSocialBookings);
router.patch('/social-bookings/:id/approve', adminProtect, approveSocialBooking);
router.patch('/social-bookings/:id/reject', adminProtect, rejectSocialBooking);

// users
router.get('/users', adminProtect, getAllUsers);
router.patch('/users/:id/toggle-active', adminProtect, toggleUserActive);

// bookings
router.get('/bookings', adminProtect, getAllBookings);

export default router;