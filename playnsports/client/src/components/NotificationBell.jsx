import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, Loader2 } from 'lucide-react';
import { useNotifications, NOTIFICATION_ICONS } from '../context/NotificationContext';

const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const NotificationBell = () => {
  const {
    notifications, unreadCount, loading, hasMore,
    fetchNotifications, markAsRead, markAllAsRead, deleteNotification,
    requestPermission,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) fetchNotifications(1);
    requestPermission();
  };

  const handleClickNotification = (n) => {
    if (!n.isRead) markAsRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleOpen}
        title="Notifications"
        className="relative p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer focus:outline-none text-gray-700 dark:text-gray-300"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-green-400 text-black text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[340px] max-h-[440px] flex flex-col bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{ animation: 'slideDown 0.2s ease forwards' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-green-500 hover:text-green-400 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-gray-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-gray-400">
                <Bell size={28} className="mb-2 opacity-40" />
                <span className="text-sm">No notifications yet</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleClickNotification(n)}
                  className={`group flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-black/5 dark:border-white/5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                    !n.isRead ? 'bg-green-400/[0.06]' : ''
                  }`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{NOTIFICATION_ICONS[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5">{n.body}</p>
                    )}
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">{timeAgo(n.createdAt)}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-green-400 mt-1" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity cursor-pointer"
                      title="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {hasMore && !loading && notifications.length > 0 && (
              <button
                onClick={() => fetchNotifications(Math.ceil(notifications.length / 20) + 1)}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-green-400 transition-colors cursor-pointer"
              >
                Load more
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
