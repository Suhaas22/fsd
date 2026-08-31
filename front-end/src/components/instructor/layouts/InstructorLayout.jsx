import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MessageSquare, 
  BarChart3, 
  ShieldAlert,
  Building2, 
  User, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useState } from "react";
import { cn } from "../../../utils/cn";

const navigation = [
  { name: "Instructor", items: [
    { name: "Dashboard", href: "/instructor", icon: LayoutDashboard },
    { name: "My Courses", href: "/instructor/courses", icon: BookOpen },
    { name: "Students", href: "/instructor/students", icon: Users },
    { name: "Reviews", href: "/instructor/reviews", icon: MessageSquare },
    { name: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
  ]},

  { name: "Account", items: [
    { name: "Profile", href: "/instructor/profile", icon: User },
    { name: "Notifications", href: "/instructor/notifications", icon: Bell },
    { name: "Settings", href: "/instructor/settings", icon: Settings },
  ]}
];

export function InstructorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-navy-50/50 flex text-navy-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-navy-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-navy-200/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:block flex flex-col shadow-sm",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center h-16 px-6 shrink-0 border-b border-navy-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-navy-900 tracking-tight">Edu<span className="text-primary-600">LMS</span></span>
          </div>
          <button 
            className="ml-auto lg:hidden text-navy-500 hover:text-navy-900 hover:bg-navy-100 p-1.5 rounded-md transition-colors"
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-8">
          {navigation.map((group, idx) => (
            <div key={idx} className="px-4">
              <h3 className="mb-3 px-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">
                {group.name}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/instructor' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                        isActive 
                          ? "bg-primary-50 text-primary-700 font-semibold" 
                          : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-600 rounded-r-full" />
                      )}
                      <item.icon className={cn(
                        "w-5 h-5 transition-colors", 
                        isActive ? "text-primary-600" : "text-navy-400 group-hover:text-navy-600"
                      )} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-navy-200/60 bg-navy-50/50">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-navy-100/80 transition-colors cursor-pointer mb-2">
            <Avatar fallback="SJ" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" />
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium text-navy-900 truncate">Dr. Sarah Jenkins</span>
              <span className="text-xs text-navy-500 truncate">Lead Instructor</span>
            </div>
          </div>
          <Link to="/login" className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-navy-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile menu trigger button */}
        <div className="lg:hidden p-4 pb-0 flex items-center">
          <button 
            className="text-navy-600 hover:text-navy-900 bg-white border border-navy-200 p-2 rounded-lg shadow-sm"
            onClick={() => setSidebarOpen(true)}
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
