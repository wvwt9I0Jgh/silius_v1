import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import {
  LayoutDashboard,
  Users,
  Heart,
  User as UserIcon,
  LogOut,
  Bell,
  Shield,
  FileText,
  QrCode,
  Compass
} from 'lucide-react';
import { db } from '../database';
import { CMSPage } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cmsPages, setCmsPages] = useState<CMSPage[]>([]);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [desktopHovered, setDesktopHovered] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadCMSPages();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.innerWidth < 768) {
      setDesktopCollapsed(false);
      return;
    }

    setDesktopCollapsed(false);
    const timer = window.setTimeout(() => {
      setDesktopCollapsed(true);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const loadCMSPages = async () => {
    try {
      const pages = await db.getCMSPages();
      const menuPages = (pages as CMSPage[]).filter((p) => p.is_published && p.show_in_menu);
      setCmsPages(menuPages);
    } catch {
      // Sessizce devam et
    }
  };

  const loadNotifications = async () => {
    try {
      const count = await db.getUnreadNotificationCount(user.id);
      setUnreadCount(count);

      if (showNotifications) {
        const notifs = await db.getNotifications(user.id);
        setNotifications(notifs);
      }
    } catch {
      // Sessizce devam et
    }
  };

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      const notifs = await db.getNotifications(user.id);
      setNotifications(notifs);
    }
  };

  const handleMarkAllRead = async () => {
    await db.markAllNotificationsAsRead(user.id);
    setUnreadCount(0);
    await loadNotifications();
  };

  const isAdmin = user.role === 'admin';
  const isDesktopCompact = desktopCollapsed && !desktopHovered;

  const desktopNavItems = [
    { path: '/home', icon: LayoutDashboard, label: 'Akış' },
    { path: '/users', icon: Users, label: 'Kişiler' },
    { path: '/friends', icon: Heart, label: 'Çevrem' },
    { path: '/profile', icon: UserIcon, label: 'Ben' },
    { path: '/my-qr', icon: QrCode, label: "QR'ım" },
  ];

  const mobileBottomNavItems = [
    { path: '/home', icon: LayoutDashboard, label: 'Akış' },
    { path: '/users', icon: Users, label: 'Kişiler' },
    { path: '/friends', icon: Heart, label: 'Çevrem' },
    { path: '/my-qr', icon: QrCode, label: "QR'ım" },
  ];

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 right-4 z-[160] flex items-center justify-between pointer-events-none">
        <Link
          to="/profile"
          className="pointer-events-auto relative w-12 h-12 rounded-2xl border border-white/20 bg-bg-surface/80 backdrop-blur-xl p-1 overflow-hidden"
          aria-label="Profile git"
        >
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            alt="profile"
            className="w-full h-full object-cover rounded-xl"
          />
        </Link>

        <div className="pointer-events-auto relative flex flex-col items-end gap-2">
          <button
            onClick={handleNotificationClick}
            className="w-12 h-12 rounded-2xl border border-white/15 bg-bg-surface/80 backdrop-blur-xl text-text-main flex items-center justify-center relative"
            aria-label="Bildirimler"
          >
            <Bell size={18} className="text-text-main/80" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onLogout}
            className="w-12 h-10 rounded-xl border border-white/15 bg-bg-surface/80 backdrop-blur-xl text-text-main/80 hover:text-rose-300 hover:border-rose-500/40 flex items-center justify-center transition-all"
            aria-label="Çıkış yap"
          >
            <LogOut size={16} />
          </button>

          {showNotifications && (
            <div className="absolute top-[calc(100%+10px)] right-0 w-[86vw] max-w-sm glass rounded-2xl p-4 shadow-2xl z-[180] border border-indigo-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black uppercase text-xs">Bildirimler</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Tümünü Oku
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Bildirim yok</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notif: any) => (
                      <Link
                        key={notif.id}
                        to={notif.link || '/home'}
                        onClick={() => { db.markNotificationAsRead(notif.id); setShowNotifications(false); }}
                        className={`block p-2 rounded-xl transition-all ${notif.is_read ? 'bg-slate-500/5' : 'bg-indigo-600/10'} hover:bg-indigo-600/20`}
                      >
                        <div className="flex items-start gap-2">
                          {notif.from_user && (
                            <img
                              src={notif.from_user.avatar}
                              alt={notif.from_user.username}
                              className="w-7 h-7 rounded-full"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold">{notif.title}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{notif.message}</p>
                            <p className="text-[9px] text-slate-400 mt-1">
                              {new Date(notif.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      <nav
        className={`hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-[140] transition-all duration-500 ${isDesktopCompact ? 'w-[92px]' : 'w-[96%] max-w-5xl'}`}
        onMouseEnter={() => setDesktopHovered(true)}
        onMouseLeave={() => setDesktopHovered(false)}
      >
        <div className="glass px-4 py-3 rounded-[2.5rem] flex items-center justify-between gap-3 border shadow-2xl transition-all overflow-visible">
          <div className="flex items-center gap-1 pr-4 mr-4 border-r border-slate-500/20">
            <Link to="/home" className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30">S</Link>
          </div>

          <div className={`flex items-center gap-1 flex-grow justify-start min-w-0 transition-all duration-300 ${isDesktopCompact ? 'max-w-0 opacity-0 pointer-events-none overflow-hidden' : 'max-w-[1200px] opacity-100'}`}>
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex flex-row items-center gap-2 shrink-0 ${isActive
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-600/5'
                    }`}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {cmsPages.map((page) => {
              const isActive = location.pathname === `/page/${page.slug}`;
              return (
                <Link
                  key={page.id}
                  to={`/page/${page.slug}`}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex-row items-center gap-2 hidden md:flex ${isActive
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
                    : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-600/5'
                    }`}
                >
                  <FileText size={18} strokeWidth={2.5} />
                  <span>{page.title}</span>
                </Link>
              );
            })}
          </div>

          <div className={`flex items-center gap-2 pl-4 ml-4 border-l border-slate-500/20 shrink-0 transition-all duration-300 ${isDesktopCompact ? 'max-w-0 opacity-0 pointer-events-none overflow-hidden' : 'max-w-[420px] opacity-100'}`}>
            {isAdmin && (
              <Link
                to="/admin"
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-rose-500/10 transition-all text-rose-500"
                title="Admin Panel"
              >
                <Shield size={18} />
              </Link>
            )}

            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-600/10 transition-all relative"
              >
                <Bell size={18} className="text-slate-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute bottom-full right-0 mb-2 w-80 glass rounded-2xl p-4 shadow-2xl max-h-96 overflow-y-auto z-[160] border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black uppercase text-xs">Bildirimler</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        Tümünü Oku
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Bildirim yok</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notif: any) => (
                        <Link
                          key={notif.id}
                          to={notif.link || '/home'}
                          onClick={() => { db.markNotificationAsRead(notif.id); setShowNotifications(false); }}
                          className={`block p-2 rounded-xl transition-all ${notif.is_read ? 'bg-slate-500/5' : 'bg-indigo-600/10'} hover:bg-indigo-600/20`}
                        >
                          <div className="flex items-start gap-2">
                            {notif.from_user && (
                              <img
                                src={notif.from_user.avatar}
                                alt={notif.from_user.username}
                                className="w-7 h-7 rounded-full"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold">{notif.title}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2">{notif.message}</p>
                              <p className="text-[9px] text-slate-400 mt-1">
                                {new Date(notif.created_at).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/profile"
              className="w-10 h-10 rounded-2xl bg-slate-500/10 p-1 flex items-center justify-center overflow-hidden border border-slate-500/10"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                alt="me"
                className="w-full h-full object-cover rounded-xl"
              />
            </Link>

            <button
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
            >
              <LogOut size={20} strokeWidth={2.5} />
            </button>
          </div>

          {isDesktopCompact && (
            <div className="absolute left-[74px] top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-indigo-300/70 pointer-events-none">
              Menü
            </div>
          )}
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-[170] w-[94%] max-w-md">
        <div className="rounded-[2rem] border border-white/10 bg-[#050713]/90 backdrop-blur-2xl px-3 py-2 flex items-center justify-between shadow-[0_12px_40px_rgba(2,6,23,0.65)]">
          {mobileBottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive
                  ? 'bg-indigo-600 text-white shadow-[0_8px_22px_rgba(79,70,229,0.5)]'
                  : 'text-text-main/75 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon size={21} strokeWidth={2.5} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
