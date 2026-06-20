import mongoose from 'mongoose';
import { NOTIFICATION_TYPE_VALUES } from '../constants/notificationTypes.js';

const notificationSchema = new mongoose.Schema(
  {
    // Who this notification is for
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Who/what triggered it (optional — e.g. the user who invited you,
    // null for system/admin-generated notifications)
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // One of NOTIFICATION_TYPES — drives icon/grouping on the frontend
    type: {
      type: String,
      enum: NOTIFICATION_TYPE_VALUES,
      required: true,
    },

    title: { type: String, required: true, trim: true },
    body: { type: String, default: '', trim: true },

    // Where tapping the notification should take the user (frontend route)
    link: { type: String, default: '' },

    // Free-form payload for deep-linking / future use
    // e.g. { groupId }, { conversationId }, { eventId }, { coachId }, { groundId }
    data: { type: mongoose.Schema.Types.Mixed, default: {} },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Fast "list my notifications, newest first" and "count my unread"
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);
