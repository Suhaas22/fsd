import { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/instructor/ui/Tabs";
import { UserPlus, Star, Building2, CheckCircle, Info, Bell } from "lucide-react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications', 'instructor')
      .then(data => {
        setNotifications(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching notifications:', err);
        setLoading(false);
      });
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false, read: true })));
  };

  const getIconConfig = (type) => {
    switch (type) {
      case 'Courses':
      case 'Approvals':
        return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" };
      case 'Reviews':
        return { icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" };
      case 'Organization':
        return { icon: Building2, color: "text-purple-600", bg: "bg-purple-100" };
      case 'student':
        return { icon: UserPlus, color: "text-blue-600", bg: "bg-blue-100" };
      default:
        return { icon: Info, color: "text-navy-600", bg: "bg-navy-100" };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Notifications</h1>
        <Button variant="ghost" onClick={markAllRead} className="text-primary-600">
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-navy-200">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const { icon: Icon, color, bg } = getIconConfig(notif.type);
                const isUnread = notif.unread ?? !notif.read;
                return (
                  <Card key={notif.id} className={cn("transition-colors hover:bg-navy-50", isUnread ? "bg-primary-50/30" : "bg-white")}>
                    <CardContent className="p-4 flex gap-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", bg, color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={cn("font-medium text-sm", isUnread ? "text-navy-900 font-bold" : "text-navy-700")}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-navy-500 whitespace-nowrap ml-4">
                            {notif.date ? new Date(notif.date).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-sm text-navy-600">{notif.message || notif.desc}</p>
                      </div>
                      {isUnread && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 shrink-0"></div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-navy-200">
              <div className="w-12 h-12 rounded-full bg-navy-50 text-navy-400 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm text-navy-500">No notifications available.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
