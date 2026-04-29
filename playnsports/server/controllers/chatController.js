import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

// Get or create direct conversation
const getOrCreateDirectConversation = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (userId === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot chat with yourself');
  }

  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [req.user._id, userId] },
  })
    .populate('participants', 'name avatar role')
    .populate('lastMessage');

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'direct',
      participants: [req.user._id, userId],
    });
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar role')
      .populate('lastMessage');
  }

  res.json(conversation);
});

// Get or create group conversation
const getOrCreateGroupConversation = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId).populate('members', 'name avatar');
  if (!group) { res.status(404); throw new Error('Group not found'); }

  const isMember = group.members.some(
    (m) => m._id.toString() === req.user._id.toString()
  ) || group.createdBy.toString() === req.user._id.toString();

  if (!isMember) { res.status(403); throw new Error('Not a group member'); }

  let conversation = await Conversation.findOne({ type: 'group', group: groupId })
    .populate('participants', 'name avatar role')
    .populate('lastMessage')
    .populate('group', 'name sport');

  if (!conversation) {
    const memberIds = group.members.map((m) => m._id);
    const uniqueIds = [...new Set([group.createdBy.toString(), ...memberIds.map(id => id.toString())])];
    conversation = await Conversation.create({
      type: 'group',
      group: groupId,
      participants: uniqueIds,
    });
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar role')
      .populate('lastMessage')
      .populate('group', 'name sport');
  }


    if (conversation) {
      const seen = new Set();
      const deduped = conversation.participants.filter(p => {
        const id = p._id?.toString() || p.toString();
        if (seen.has(id)) return false;
        seen.add(id); return true;
      });
      conversation.participants = deduped;
}

  res.json(conversation);
});

// Get all my conversations
const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name avatar role')
    .populate('lastMessage')
    .populate('group', 'name sport')
    .sort({ lastMessageAt: -1 });

  res.json(conversations);
});

// Get messages for a conversation
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = 50;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) { res.status(404); throw new Error('Conversation not found'); }

  const isMember = conversation.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isMember) { res.status(403); throw new Error('Not authorized'); }

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name avatar role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Mark as read
  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  // Reset unread count
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: { [`unreadCount.${req.user._id}`]: 0 },
  });

  res.json(messages.reverse());
});

// Send message (REST fallback)
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) { res.status(404); throw new Error('Conversation not found'); }

  const isMember = conversation.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isMember) { res.status(403); throw new Error('Not authorized'); }

  // Block check for direct conversations
  if (conversation.type === 'direct') {
    const otherUserId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );
    if (otherUserId) {
      const [me, other] = await Promise.all([
        User.findById(req.user._id),
        User.findById(otherUserId),
      ]);
      const iBlocked = me?.blockedUsers?.some(id => id.toString() === otherUserId.toString());
      const theyBlocked = other?.blockedUsers?.some(id => id.toString() === req.user._id.toString());
      if (iBlocked || theyBlocked) {
        res.status(403);
        throw new Error('Cannot send message. User is blocked.');
      }
    }
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text,
    readBy: [req.user._id],
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name avatar role');

  // Update conversation
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
  });

  // Increment unread for others
  for (const participantId of conversation.participants) {
    if (participantId.toString() !== req.user._id.toString()) {
      await Conversation.findByIdAndUpdate(conversationId, {
        $inc: { [`unreadCount.${participantId}`]: 1 },
      });
    }
  }

  res.json(populated);
});

export {
  getOrCreateDirectConversation,
  getOrCreateGroupConversation,
  getMyConversations,
  getMessages,
  sendMessage,
};