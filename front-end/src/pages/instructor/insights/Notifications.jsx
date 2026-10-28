import { dateLabel } from '../../../utils/adminDisplay';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button } from '../../../components/common';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../../components/instructor/ui/Tabs';
import {
  UserPlus,
  Star,
  Building2,
  CheckCircle,
  Info,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { api } from '../../../utils/api';
import { useInstructor } from '../../../hooks/useInstructor';

const TABS = [
  { value: 'all', label: 'All', category: null },
  { value: 'courses', label: 'Courses', category: 'Course' },
  { value: 'reviews', label: 'Reviews', category: 'Review' },
  { value: 'system', label: 'System', category: 'System' },
];

export function Notifications() {
  const navigate = useNavigate();
  const { instructor } = useInstructor();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    const cat = TABS.find((t) => t.value === activeTab)?.category;
    const params = new URLSearchParams();
    if (cat) params.append('category', cat);
    if (instructor?.id) {
      params.append('recipientId', instructor.id);
    } else {
      params.append('role', 'instructor');
    }

    api
      .get(`/notifications?${params.toString()}`, 'instructor')
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : data?.items || data?.data?.items || data?.data || [];
        setNotifications(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab, instructor?.id]);

  const markAllRead = () => {
    api
      .patch('/notifications/mark-all-read', {}, 'instructor')
      .catch((err) => console.error('Failed to mark read on server:', err));
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false, read: true }))
    );
  };

  const handleNotificationClick = (notif) => {
    // If unread, mark read on backend
    if (!notif.read) {
      api
        .patch(`/notifications/${notif.id}/read`, {}, 'instructor')
        .catch((err) =>
          console.error('Failed to mark notification read:', err)
        );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, read: true, unread: false } : n
        )
      );
    }

    // Deep link navigation
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const getIconConfig = (category, type) => {
    const c = (category || type || '').toLowerCase();
    if (c.includes('course') || c.includes('approval')) {
      return { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' };
    }
    if (c.includes('review')) {
      return { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' };
    }
    if (c.includes('org') || c.includes('instructor')) {
      return { icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' };
    }
    if (
      c.includes('student') ||
      c.includes('learner') ||
      c.includes('enrollment')
    ) {
      return { icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    }
    return { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50' };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Studio Notifications
          </h1>
        </div>
        <Button
          variant="ghost"
          onClick={markAllRead}
          className="text-[#0056D2] hover:bg-blue-50 font-semibold text-xs"
        >
          Mark all as read
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const {
                  icon: Icon,
                  color,
                  bg,
                } = getIconConfig(notif.category, notif.type);
                const isUnread = notif.unread ?? !notif.read;
                return (
                  <Card
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'transition-all cursor-pointer hover:shadow-xs group border',
                      isUnread
                        ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/60'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/70'
                    )}
                  >
                    <CardContent className="p-4 flex gap-4 items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/50',
                          bg,
                          color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={cn(
                              'text-sm',
                              isUnread
                                ? 'text-slate-900 font-bold'
                                : 'text-slate-700 font-semibold'
                            )}
                          >
                            {notif.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap ml-4">
                            {notif.createdAt
                              ? dateLabel(notif.createdAt)
                              : notif.date
                                ? dateLabel(notif.date)
                                : notif.time || 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.desc || notif.message}
                        </p>
                      </div>

                      {/* Unread indicator or arrow */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isUnread && (
                          <div className="w-2.5 h-2.5 bg-[#0056D2] rounded-full"></div>
                        )}
                        {notif.actionUrl && (
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0056D2] transition-colors" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-500">
                No {activeTab === 'all' ? '' : activeTab + ' '}notifications
                found.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
