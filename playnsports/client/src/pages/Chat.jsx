import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Chat = () => {
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedMe, setBlockedMe] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get(`${API}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(data);
      } catch (err) {
        console.error('Conversations fetch error:', err);
      }
    };
    if (token) fetchConversations();
  }, [token]);

  // Fetch messages when user selected
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/api/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(data);
        setIsBlocked(false);
        setBlockedMe(false);
      } catch (err) {
        if (err.response?.data?.blocked) {
          // Figure out who blocked whom
          const me = await axios.get(`${API}/api/users/blocked`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const iBlocked = me.data.some(u => u._id === selectedUser._id);
          setIsBlocked(iBlocked);
          setBlockedMe(!iBlocked);
        }
      }
      setLoading(false);
    };
    fetchMessages();
  }, [selectedUser, token]);

  // Socket — receive message
  useEffect(() => {
    if (!socket) return;
    socket.on('receiveMessage', (msg) => {
      if (
        selectedUser &&
        (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      // Update last message in conversations
      setConversations((prev) =>
        prev.map((c) =>
          c.user._id === msg.sender || c.user._id === msg.receiver
            ? { ...c, lastMessage: msg.content, lastMessageTime: msg.createdAt }
            : c
        )
      );
    });
    return () => socket.off('receiveMessage');
  }, [socket, selectedUser]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const { data } = await axios.post(
        `${API}/api/messages/send`,
        { receiverId: selectedUser._id, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
      socket?.emit('sendMessage', data);
    } catch (err) {
      if (err.response?.data?.blocked) {
        alert('Message send nahi hua — user blocked hai!');
      }
    }
  };

  // Block
  const handleBlock = async () => {
    if (!window.confirm(`${selectedUser?.name} ko block karna chahte ho?`)) return;
    setBlockLoading(true);
    try {
      await axios.post(
        `${API}/api/users/block/${selectedUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsBlocked(true);
      setMenuOpen(false);
    } catch (err) {
      alert('Block failed');
    }
    setBlockLoading(false);
  };

  // Unblock
  const handleUnblock = async () => {
    setBlockLoading(true);
    try {
      await axios.post(
        `${API}/api/users/unblock/${selectedUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsBlocked(false);
      // Reload messages
      const { data } = await axios.get(`${API}/api/messages/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data);
    } catch (err) {
      alert('Unblock failed');
    }
    setBlockLoading(false);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-[calc(100vh-65px)] bg-[#0a0a0a] text-gray-900 dark:text-white">

      {/* Sidebar — Conversations */}
      <div className="w-80 border-r border-black/10 dark:border-white/10 flex flex-col">
        <div className="p-4 border-b border-black/10 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
              <span className="text-4xl">💬</span>
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user._id}
                onClick={() => setSelectedUser(conv.user)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:bg-white/5 transition-all text-left ${
                  selectedUser?._id === conv.user._id ? 'bg-black/10 dark:bg-white/10' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-sm font-bold text-green-400 flex-shrink-0">
                  {conv.user.avatar ? (
                    <img src={conv.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    conv.user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{conv.user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-[#111]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-sm font-bold text-green-400">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedUser.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedUser.name}</p>
                  {(isBlocked || blockedMe) && (
                    <p className="text-xs text-red-400">
                      {isBlocked ? '🚫 Blocked' : '⛔ You are blocked'}
                    </p>
                  )}
                </div>
              </div>

              {/* 3 Dots Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-full hover:bg-black/10 dark:bg-white/10 transition-all text-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                >
                  ⋮
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-[#ffffff] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden">
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:bg-white/5 hover:text-gray-900 dark:text-white transition-all"
                    >
                      🚩 Report
                    </button>
                    <div className="h-px bg-black/5 dark:bg-white/5" />
                    <button
                      onClick={isBlocked ? handleUnblock : handleBlock}
                      disabled={blockLoading}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      🚫 {blockLoading ? 'Loading...' : isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                  <span className="text-4xl">👋</span>
                  <p className="text-sm">Say hello to {selectedUser.name}!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender === user._id || msg.sender?._id === user._id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-green-500 text-black rounded-br-sm'
                          : 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-sm'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-black/60' : 'text-gray-500'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input or Blocked Banner */}
            {isBlocked ? (
              <div className="flex items-center justify-center gap-3 py-4 px-6 border-t border-black/10 dark:border-white/10 bg-[#111]">
                <span className="text-gray-500 text-sm">🚫 You blocked this user</span>
                <button
                  onClick={handleUnblock}
                  disabled={blockLoading}
                  className="text-xs text-green-400 border border-green-500/30 px-3 py-1 rounded-lg hover:bg-green-500/10 transition-all"
                >
                  {blockLoading ? '...' : 'Unblock'}
                </button>
              </div>
            ) : blockedMe ? (
              <div className="flex items-center justify-center py-4 px-6 border-t border-black/10 dark:border-white/10 bg-[#111]">
                <span className="text-gray-500 text-sm">⛔ You cannot send messages to this user</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10 bg-[#111]">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-5 py-3 rounded-xl transition-all text-sm"
                >
                  Send
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
            <span className="text-6xl">💬</span>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Select a conversation</p>
            <p className="text-sm">Choose from your existing chats</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;