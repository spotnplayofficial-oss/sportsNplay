import User from '../models/User.js';

// Block user
export const blockUser = async (req, res) => {
  try {
    const blocker = await User.findById(req.user._id);
    const blockeeId = req.params.id;

    if (blocker.blockedUsers.includes(blockeeId)) {
      return res.status(400).json({ message: 'Already blocked' });
    }

    blocker.blockedUsers.push(blockeeId);
    await blocker.save(); 

    res.json({ message: 'User blocked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const blocker = await User.findById(req.user._id);
    blocker.blockedUsers = blocker.blockedUsers.filter(
      id => id.toString() !== req.params.id
    );
    await blocker.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', 'name avatar');
    res.json(user.blockedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};