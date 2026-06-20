import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import { NOTIFICATION_CATEGORIES } from '../constants/notificationTypes.js';

// GET /api/notifications?page=1&limit=20&unreadOnly=true&category=group
const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const unreadOnly = req.query.unreadOnly === 'true';
  const category = req.query.category; // e.g. 'group' | 'chat' | 'event' | 'coach' | 'ground'

  const query = { recipient: req.user._id };
  if (unreadOnly) query.isRead = false;
  if (category && NOTIFICATION_CATEGORIES[category]) {
    query.type = { $in: NOTIFICATION_CATEGORIES[category] };
  }

  const [notifications, unreadCount, total] = await Promise.all([
    Notification.find(query)
      .populate('actor', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    Notification.countDocuments(query),
  ]);

  res.json({ notifications, unreadCount, page, total, hasMore: page * limit < total });
});

// GET /api/notifications/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ unreadCount });
});

// PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) { res.status(404); throw new Error('Notification not found'); }
  res.json(notification);
});

// PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  res.json({ message: 'All notifications marked as read' });
});

// DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  if (!notification) { res.status(404); throw new Error('Notification not found'); }
  res.json({ message: 'Notification deleted' });
});

export { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
