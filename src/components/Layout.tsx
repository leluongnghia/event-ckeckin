import React from 'react';
import { Link, useLocation, useParams, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, QrCode, Mail, Settings, LogOut, Palette, LayoutGrid, ShieldCheck, Calendar, Menu, X as CloseIcon, Info, MessageSquareWarning } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Chatbot from './Chatbot';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ADMIN_EMAILS = ['leluongnghia90@gmail.com', 'leluongnghia91@gmail.com'];

export default function Layout() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/landing');
  };

  const navItems = eventId ? [
    { name: 'Dashboard', path: `/dashboard/events/${eventId}`, icon: LayoutDashboard },
    { name: 'Khách mời', path: `/dashboard/events/${eventId}/attendees`, icon: Users },
    { name: 'Thiết kế vé', path: `/dashboard/events/${eventId}/design`, icon: Palette },
    { name: 'Check-in', path: `/dashboard/events/${eventId}/checkin`, icon: QrCode },
    { name: 'Quản lý phiên', path: `/dashboard/events/${eventId}/sessions`, icon: Calendar },
    { name: 'Gửi Email', path: `/dashboard/events/${eventId}/email`, icon: Mail },
    { name: 'Chế độ Kiosk', path: `/kiosk/${eventId}`, icon: LayoutGrid },
    { name: 'Cài đặt', path: `/dashboard/events/${eventId}/settings`, icon: Settings },
  ] : [];

  const globalItems = [
    { name: 'Sự kiện của tôi', path: '/dashboard', icon: LayoutGrid },
    { name: 'Khám phá sự kiện', path: '/', icon: Info },
    { name: 'Cấu hình chung', path: '/dashboard/settings', icon: Settings },
    { name: 'Góp ý & Báo lỗi', path: '/dashboard/feedback', icon: MessageSquareWarning },
  ];

  if (user?.email && ADMIN_EMAILS.includes(user.email)) {
    globalItems.push({ name: 'Admin Dashboard', path: '/dashboard/admin', icon: ShieldCheck });
  }

  return (
    <div className="flex h-screen bg-stone-50 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-stone-200 flex-col shrink-0">
        <div className="p-6 border-b border-stone-100">
          <Link to="/dashboard" className="text-xl font-bold text-emerald-600 flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            EventCheck
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Chung</p>
            {globalItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </div>

          {eventId && (
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Sự kiện hiện tại</p>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-stone-600 hover:bg-stone-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                  <QrCode className="w-6 h-6" />
                  EventCheck
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                  <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Chung</p>
                  {globalItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        location.pathname === item.path
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-stone-600 hover:bg-stone-100"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>

                {eventId && (
                  <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Sự kiện hiện tại</p>
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          location.pathname === item.path
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-stone-600 hover:bg-stone-100"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </nav>

              <div className="p-4 border-t border-stone-100">
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 w-full text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <header className="h-14 lg:h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm lg:text-lg font-bold text-stone-800 truncate max-w-[120px] sm:max-w-none uppercase tracking-tight">
              {[...globalItems, ...navItems].find(i => i.path === location.pathname)?.name || 'Trang chủ'}
            </h2>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-stone-900">{user?.displayName || 'User'}</p>
              <p className="text-xs text-stone-500">{user?.email}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs lg:text-base">
              {user?.displayName?.[0] || user?.email?.[0] || 'U'}
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        <div className="p-4 lg:p-8 flex-1">
          <Outlet />
        </div>
        <Chatbot />
      </main>
    </div>
  );
}
