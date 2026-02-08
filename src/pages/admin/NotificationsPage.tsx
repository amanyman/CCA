import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types/notification';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AdminNotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data as Notification[]);
      setIsLoading(false);
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) await markAsRead(notification.id);

    if (notification.referral_id) {
      navigate(`/admin/referrals/${notification.referral_id}`);
    } else if (notification.type === 'new_agency') {
      navigate('/admin/agencies');
    } else if (notification.type === 'new_support_request') {
      navigate('/admin/support-requests');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <AdminLayout title="Notifications">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading notifications..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Notifications">
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'unread' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            filtered.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`w-full text-left px-6 py-4 transition-colors ${
                  !notification.is_read
                    ? 'bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100/60'
                    : 'hover:bg-slate-50 border-l-4 border-l-transparent opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notification.is_read && (
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`${!notification.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                      {notification.title}
                    </div>
                    <p className={`text-sm mt-0.5 ${!notification.is_read ? 'text-slate-700' : 'text-slate-500'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(notification.created_at)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
