
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { LayoutDashboard, Users, Heart, User as UserIcon, LogOut, Bell, Zap, Globe, MapPin, Shield, FileText } from 'lucide-react';
import { db } from '../db';
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

  useEffect(() => {
    loadNotifications();
    loadCMSPages();
    const interval = setInterval(loadNotifications, 60000); // Her 60 saniyede kontrol (30'dan 60'a çıkarıldı)
    return () => clearInterval(interval);
  }, []); // user.id dependency'sini kaldır - gereksiz re-fetch önlenir

  const loadCMSPages = async () => {
    try {
      const pages = await db.getCMSPages();
      // Sadece yayınlanmış ve menüde gösterilecek sayfaları filtrele
      const menuPages = (pages as CMSPage[]).filter(p => p.is_published && p.show_in_menu);
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

  const navItems = [
    { path: '/home', icon: LayoutDashboard, label: 'Akış' },
    { path: '/users', icon: Users, label: 'Kişiler' },
    { path: '/friends', icon: Heart, label: 'Çevrem' },
    { path: '/profile', icon: UserIcon, label: 'Ben' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[95%] max-w-3xl">
      <div className="glass px-4 md:px-6 py-3 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center gap-2 md:gap-3 border shadow-2xl transition-all">
        <div className="hidden md:flex items-center gap-1 pr-4 mr-4 border-r border-slate-500/20">
          <Link to="/home" className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30">S</Link>
        </div>

        <div className="flex items-center gap-1 flex-grow justify-around md:justify-start">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 ${isActive
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-600/5'
                  }`}
              >
                <Icon size={18} strokeWidth={2.5} />
                <span className="md:inline">{item.label}</span>
              </Link>
            );
          })}

          {/* Dinamik CMS Sayfaları */}
          {cmsPages.map((page) => {
            const isActive = location.pathname === `/page/${page.slug}`;
            return (
              <Link
                key={page.id}
                to={`/page/${page.slug}`}
                className={`px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex flex-col md:flex-row items-center gap-1 md:gap-2 ${isActive
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-600/5'
                  }`}
              >
                <FileText size={18} strokeWidth={2.5} />
                <span className="md:inline">{page.title}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pl-2 md:pl-4 ml-2 md:ml-4 border-l border-slate-500/20">
          {/* Admin Panel Butonu - Sadece Adminlere Görünür */}
          {isAdmin && (
            <Link
              to="/admin"
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center hover:bg-rose-500/10 transition-all text-rose-500"
              title="Admin Panel"
            >
              <Shield size={18} />
            </Link>
          )}

          {/* Bildirim Çanı */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center hover:bg-indigo-600/10 transition-all relative"
            >
              <Bell size={18} className="text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Bildirim Paneli */}
            {showNotifications && (
              <div className="absolute bottom-full right-0 mb-2 w-72 md:w-80 glass rounded-2xl p-4 shadow-2xl max-h-96 overflow-y-auto">
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
                        className={`block p-2 rounded-xl transition-all ${notif.is_read ? 'bg-slate-500/5' : 'bg-indigo-600/10'
                          } hover:bg-indigo-600/20`}
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

          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-500/10 p-1 flex items-center justify-center overflow-hidden border border-slate-500/10">
            <img src={user.avatar} alt="me" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={onLogout}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl md:rounded-2xl transition-all"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
