import Message from '../models/Message.js';
import User from '../models/User.js';

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    // Block check — dono side
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const iBlockedThem = sender.blockedUsers?.includes(receiverId);
    const theyBlockedMe = receiver.blockedUsers?.includes(senderId.toString());

    if (iBlockedThem || theyBlockedMe) {
      return res.status(403).json({
        message: 'Cannot send message. User is blocked.',
        blocked: true
      });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    // Block check
    const me = await User.findById(myId);
    const other = await User.findById(userId);

    if (!other) {
      return res.status(404).json({ message: 'User not found' });
    }

    const iBlockedThem = me.blockedUsers?.includes(userId);
    const theyBlockedMe = other.blockedUsers?.includes(myId.toString());

    if (iBlockedThem || theyBlockedMe) {
      return res.status(403).json({
        message: 'Cannot view messages. User is blocked.',
        blocked: true
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all conversations (inbox)
export const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;
    const me = await User.findById(myId);

    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Unique conversations
    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      const otherId =
        msg.sender._id.toString() === myId.toString()
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      // Skip blocked users
      if (me.blockedUsers?.map(id => id.toString()).includes(otherId)) continue;

      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({
          user: msg.sender._id.toString() === myId.toString() ? msg.receiver : msg.sender,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
        });
      }
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

