import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Star, Zap, Shield, Heart, Users,
  MapPin, Globe, Moon, Sun, X, Calendar, Music, Coffee, ChevronRight, BookOpen, Compass, Smile
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('connect');

  // Admin logic
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    users: '...',
    events: '...',
    vibeScore: '...'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, eventsRes, participantsRes] = await Promise.allSettled([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('event_participants').select('*', { count: 'exact', head: true })
        ]);

        let userCount = 0;
        let eventCount = 0;
        let participantCount = 0;

        if (usersRes.status === 'fulfilled' && usersRes.value.count !== null) {
          userCount = usersRes.value.count;
        }
        if (eventsRes.status === 'fulfilled' && eventsRes.value.count !== null) {
          eventCount = eventsRes.value.count;
        }
        if (participantsRes.status === 'fulfilled' && participantsRes.value.count !== null) {
          participantCount = participantsRes.value.count;
        }

        // Toplam vibe puanı = etkinlik sayısı * 10 + katılım sayısı * 5
        const totalVibeScore = (eventCount * 10) + (participantCount * 5);

        const formatNumber = (num: number) => {
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
          return `${num}`;
        };

        setStats({
          users: formatNumber(userCount),
          events: formatNumber(eventCount),
          vibeScore: formatNumber(totalVibeScore)
        });
      } catch (err) {
        console.warn('Stats yüklenemedi:', err);
        setStats({ users: '0', events: '0', vibeScore: '0' });
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setShowAdminModal(true);
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 2000);
  };

  const handleAdminLogin = () => {
    setLoadingAdmin(true);
    setTimeout(() => {
      if (adminPassword === 'Allah4848') {
        localStorage.setItem('silius_admin_auth', 'true');
        setShowAdminModal(false);
        navigate('/admin');
      } else {
        setAuthError('Hatalı şifre');
      }
      setLoadingAdmin(false);
    }, 800);
  };

  const features = {
    connect: {
      title: "Gerçek Bağlar Kur",
      desc: "Algoritmalar değil, ortak ilgi alanları sizi bir araya getirir.",
      icon: Users,
      color: "from-indigo-500 to-blue-500",
      stats: "15k+ Kullanıcı"
    },
    discover: {
      title: "Şehri Keşfet",
      desc: "Gizli mekanlar, pop-up etkinlikler ve yerel topluluklar.",
      icon: MapPin,
      color: "from-rose-500 to-orange-500",
      stats: "120+ Mekan"
    },
    vibe: {
      title: "Vibele",
      desc: "Ruh haline uygun müzik, ortam ve insanları bul.",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      stats: "Sınırsız Vibe"
    }
  };

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden transition-colors duration-500 bg-bg-deep text-text-main">

      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] mix-blend-screen opacity-40 animate-pulse ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-400'}`} />
        <div className={`absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full blur-[140px] mix-blend-screen opacity-30 animate-blob ${isDarkMode ? 'bg-rose-600' : 'bg-rose-400'}`} />
        <div className={`absolute -bottom-32 left-1/3 w-96 h-96 rounded-full blur-[120px] mix-blend-screen opacity-40 animate-pulse delay-1000 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-400'}`} />

        {/* Grid Pattern */}
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20`} />
        <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]`} />
      </div>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAdminModal(false)} />
          <div className="relative w-full max-w-sm rounded-3xl p-8 border shadow-2xl overflow-hidden bg-bg-surface border-white/10">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
            <button onClick={() => setShowAdminModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-current"><X size={20} /></button>

            <div className="text-center mb-8 mt-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="font-outfit text-xl font-bold">Yönetici Girişi</h3>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Erişim Şifresi"
                className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-rose-500/50 transition-all bg-bg-deep/50 border-white/10 text-text-main placeholder:text-text-muted"
                autoFocus
              />
              {authError && <p className="text-rose-500 text-xs font-semibold text-center">{authError}</p>}
              <button
                onClick={handleAdminLogin}
                disabled={loadingAdmin}
                className="w-full py-3 bg-bg-deep text-text-main rounded-xl font-bold hover:bg-bg-surface transition-colors disabled:opacity-50"
              >
                {loadingAdmin ? 'Doğrulanıyor...' : 'Giriş Yap'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 20 ? 'py-4 bg-slate-950/50 backdrop-blur-xl border-b border-white/5' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button onClick={handleLogoClick} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles size={16} className="text-white" fill="white" />
            </div>
            <span className="text-xl font-black font-outfit tracking-tight text-text-main">Silius</span>
          </button>

          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
            {[
              { name: 'Keşfet', path: '/vibeler' },
              { name: 'Topluluk', path: '/topluluk' },
              { name: 'Mekanlar', path: '/mekanlar' },
            ].map(link => (
              <Link key={link.name} to={link.path} className="px-5 py-2 rounded-full text-sm font-semibold transition-all text-text-muted hover:text-text-main hover:bg-white/10">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2.5 rounded-full transition-colors bg-white/5 hover:bg-white/10 text-indigo-500 dark:text-amber-300">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <Link to="/home" className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-white/10 flex items-center gap-2">
                Uygulamaya Git <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/auth" className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-white/10 flex items-center gap-2">
                Giriş Yap <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-sm font-bold animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Beta v2.4 Yayında
            </div>

            <h1 className="text-6xl md:text-8xl font-black font-outfit leading-[0.95] tracking-tight">
              <span className="block text-slate-400/50">YENİ NESİL</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 animate-gradient-x">SOSYALİK</span>
            </h1>

            <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-lg text-text-muted">
              Silius, seni algoritmalarla değil, <span className="text-indigo-500">gerçek hislerle</span> eşleştirir. Şehrin ritmini yakala, kabileni bul.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {user ? (
                <Link to="/home" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center gap-3 transition-all hover:-translate-y-1 shadow-xl shadow-indigo-600/30">
                  Uygulamaya Git <Zap className="fill-current" size={18} />
                </Link>
              ) : (
                <Link to="/auth" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center gap-3 transition-all hover:-translate-y-1 shadow-xl shadow-indigo-600/30">
                  Hemen Katıl <Zap className="fill-current" size={18} />
                </Link>
              )}
              <button className="px-8 py-4 rounded-2xl font-bold border flex items-center gap-3 transition-all hover:-translate-y-1 border-white/10 hover:bg-white/5 bg-white/5">
                Nasıl Çalışır?
              </button>
            </div>

            <div className="flex items-center gap-4 pt-8 opacity-70">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-deep overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold border-bg-deep bg-bg-surface">+2k</div>
              </div>
              <div className="text-sm font-medium">Bu hafta <span className="text-rose-500 font-bold">1,240</span> kişi katıldı</div>
            </div>
          </div>

          <div className="relative h-[600px] hidden lg:block perspective-1000">
            {/* 3D Floating Cards Effect */}
            <div className="absolute top-10 right-10 w-80 h-[450px] bg-slate-900 rounded-[2rem] border border-white/10 shadow-2xl transform rotate-y-12 rotate-z-6 animate-float z-10 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&fit=crop" className="w-full h-2/3 object-cover" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">NEON</span>
                  <Star className="text-yellow-400 fill-current" size={16} />
                </div>
                <h3 className="text-white font-bold text-xl font-outfit">Gece Sürüşü</h3>
                <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
                  <MapPin size={14} /> Beşiktaş Sahil
                </div>
              </div>
            </div>

            <div className="absolute top-32 left-0 w-72 h-[400px] bg-white rounded-[2rem] shadow-2xl transform -rotate-y-12 -rotate-z-3 animate-float animation-delay-2000 z-20 overflow-hidden border border-slate-100">
              <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&fit=crop" className="w-full h-2/3 object-cover" />
              <div className="p-6">
                <h3 className="text-slate-900 font-bold text-xl font-outfit">Haftasonu Koşusu</h3>
                <div className="flex -space-x-2 mt-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-8 h-8 rounded-full border border-white" />
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" className="w-8 h-8 rounded-full border border-white" />
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" className="w-8 h-8 rounded-full border border-white" />
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 rounded-full blur-[80px] opacity-40 animate-pulse" />
            <div className="absolute bottom-0 left-20 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-40 animate-pulse animation-delay-1000" />
          </div>

        </div>
      </header>

      {/* Keşfetmeye Başla Section - Redesigned */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Left Content */}
            <div className="lg:col-span-5 space-y-10 relative z-10">
              <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-[2px] bg-rose-500"></span>
                  <span className="text-rose-500 font-bold tracking-widest text-sm uppercase font-outfit">Keşfetmeye Başla</span>
                </div>

                <h2 className="text-5xl md:text-7xl font-black font-outfit leading-[0.9]">
                  Sınırlarını <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400 animate-gradient-x">Zorla.</span>
                </h2>
              </div>

              <p className="text-xl text-text-muted leading-relaxed font-light">
                Her gün aynı yerlere gitmekten sıkılmadın mı? Silius ile şehrinde daha önce fark etmediğin <span className="text-text-main font-bold text-indigo-400">vibe noktalarını</span> keşfet.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Kişiselleştirilmiş Öneriler", icon: Sparkles, color: "text-amber-400" },
                  { title: "Anlık Etkinlik Bildirimleri", icon: Zap, color: "text-indigo-400" },
                  { title: "Güvenli Topluluk Deneyimi", icon: Shield, color: "text-emerald-400" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-default">
                    <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color} group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 shadow-lg`}>
                      <item.icon size={22} />
                    </div>
                    <span className="text-lg font-medium text-text-main group-hover:translate-x-2 transition-transform">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visuals - Bento Style */}
            <div className="lg:col-span-7 relative perspective-1000">
              {/* Decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 to-rose-500/20 rounded-full blur-[100px] animate-pulse" />

              <div className="grid grid-cols-2 gap-6 transform rotate-y-6 rotate-z-2 transition-transform duration-500 hover:rotate-0">
                <div className="space-y-6 mt-12">
                  <div className="h-64 rounded-[2.5rem] bg-indigo-500/10 border border-white/5 overflow-hidden relative group shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <span className="text-white font-bold text-xl font-outfit">Neon Geceler</span>
                      <div className="h-1 w-8 bg-indigo-500 mt-2 rounded-full" />
                    </div>
                  </div>
                  <div className="h-48 rounded-[2.5rem] bg-rose-500/10 border border-white/5 overflow-hidden relative group shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1514525253440-b393452e3726?w=600&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <span className="text-white font-bold text-xl font-outfit">Şehir Işıkları</span>
                      <div className="h-1 w-8 bg-rose-500 mt-2 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-48 rounded-[2.5rem] bg-purple-500/10 border border-white/5 overflow-hidden relative group shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=600&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <span className="text-white font-bold text-xl font-outfit">Sörf & Sahil</span>
                      <div className="h-1 w-8 bg-purple-500 mt-2 rounded-full" />
                    </div>
                  </div>
                  <div className="h-64 rounded-[2.5rem] bg-emerald-500/10 border border-white/5 overflow-hidden relative group shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?w=600&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <span className="text-white font-bold text-xl font-outfit">Doğa Yürüyüşü</span>
                      <div className="h-1 w-8 bg-emerald-500 mt-2 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Modern Slider */}
      <section className="py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex items-end justify-between">
          <div>
            <span className="text-indigo-500 font-bold tracking-widest text-xs uppercase mb-3 block font-outfit">Kendini Bul</span>
            <h2 className="text-4xl md:text-5xl font-black font-outfit">Popüler Kategoriler</h2>
          </div>
          <Link to="/mekanlar" className="group flex items-center gap-3 text-text-muted hover:text-white transition-colors px-6 py-3 rounded-full border border-white/5 hover:bg-white/5">
            <span className="font-bold">Tümünü Gör</span>
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-12 px-6 no-scrollbar snap-x scroll-padding-x-6">
            {[
              { name: 'Müzik & Sanat', img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae', count: '120+ Etkinlik', color: 'bg-rose-500' },
              { name: 'Kahve & Sohbet', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf', count: '85+ Mekan', color: 'bg-amber-500' },
              { name: 'Spor & Outdoor', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b', count: '45+ Grup', color: 'bg-emerald-500' },
              { name: 'Teknoloji', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c', count: '20+ Workshop', color: 'bg-blue-500' },
              { name: 'Oyun', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc', count: 'Turnuvalar', color: 'bg-purple-500' },
              { name: 'Eğitim', img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', count: 'Seminerler', color: 'bg-cyan-500' },
              { name: 'Gezi', img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828', count: 'Turlar', color: 'bg-orange-500' },
            ].map((cat, i) => (
              <Link to="/mekanlar" key={i} className="relative flex-none w-[245px] h-[350px] rounded-[2.5rem] overflow-hidden group snap-center cursor-pointer shadow-xl border border-white/5">
                <div className="absolute inset-0 bg-slate-900 animate-pulse" /> {/* Placeholder */}
                <img src={`${cat.img}?w=600&q=80`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                <div className="absolute top-6 right-6">
                  <div className={`w-3 h-3 rounded-full ${cat.color} shadow-[0_0_15px_rgba(255,255,255,0.5)]`} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-3xl font-black font-outfit text-white mb-2 leading-none">{cat.name}</h3>
                  <div className="h-1 w-0 bg-white transition-all duration-500 group-hover:w-full mb-4 opacity-50" />
                  <p className="text-sm text-white/90 font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2">
                    {cat.count} <ArrowRight size={12} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-black font-outfit mb-8 tracking-tight leading-[1.1]">
            Hazır mısın? <br />
            <span className="relative inline-block mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 animate-gradient-x">Hikayeni Başlat.</span>
              <div className="absolute -bottom-4 left-0 right-0 h-4 bg-gradient-to-r from-rose-500 to-indigo-500 blur-xl opacity-30" />
            </span>
          </h2>

          <p className="text-xl md:text-2xl font-light opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Binlerce kişi Silius'ta <span className="text-indigo-400 font-medium">yeni arkadaşlar ediniyor</span>, etkinlikler düzenliyor ve hayatı <span className="text-rose-400 font-medium">dolu dolu yaşıyor.</span>
          </p>

          <div className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            {user ? (
              <Link to="/home" className="relative inline-flex items-center gap-4 px-12 py-6 bg-text-main text-bg-deep rounded-full font-bold text-xl hover:scale-105 transition-all shadow-2xl">
                <span>Uygulamaya Git</span>
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link to="/auth" className="relative inline-flex items-center gap-4 px-12 py-6 bg-text-main text-bg-deep rounded-full font-bold text-xl hover:scale-105 transition-all shadow-2xl">
                <span>Ücretsiz Hesap Oluştur</span>
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {/* Trust Indicators (Marquee) */}
          <div className="mt-24 w-screen relative left-1/2 -translate-x-1/2 overflow-hidden border-y border-white/10 py-12 bg-black/40 backdrop-blur-md transform -skew-y-2 origin-left">
            <div className="inline-flex animate-marquee whitespace-nowrap items-center hover:paused">
              {[...Array(1)].map((_, i) => (
                <div key={i} className="flex items-center gap-24 px-8">
                  <div className="flex items-end gap-3 group">
                    <span className="text-7xl md:text-8xl font-black font-outfit text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.6)] group-hover:drop-shadow-[0_0_40px_rgba(99,102,241,0.9)] transition-all duration-300 italic">
                      {stats.users}
                    </span>
                    <span className="text-base font-bold tracking-widest text-indigo-400 mb-5 uppercase italic">Kullanıcı</span>
                  </div>

                  <Zap size={18} className="text-yellow-400/60" />

                  <div className="flex items-end gap-3 group">
                    <span className="text-7xl md:text-8xl font-black font-outfit text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] group-hover:drop-shadow-[0_0_40px_rgba(168,85,247,0.9)] transition-all duration-300 italic">
                      {stats.events}
                    </span>
                    <span className="text-base font-bold tracking-widest text-purple-400 mb-5 uppercase italic">Vibe</span>
                  </div>

                  <Zap size={18} className="text-yellow-400/60" />

                  <div className="flex items-end gap-3 group">
                    <span className="text-7xl md:text-8xl font-black font-outfit text-white drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] group-hover:drop-shadow-[0_0_40px_rgba(244,63,94,0.9)] transition-all duration-300 italic">
                      {stats.vibeScore}
                    </span>
                    <span className="text-base font-bold tracking-widest text-rose-400 mb-5 uppercase italic">Toplam Puan</span>
                  </div>

                  <Zap size={18} className="text-yellow-400/60" />
                </div>
              ))}
            </div>

            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
          </div>
        </div>

        {/* Expanded Footer */}
        <div className="max-w-7xl mx-auto px-6 mt-32 border-t border-opacity-10 dark:border-white/10 border-black/10 pt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" fill="white" />
                </div>
                <span className="text-xl font-black font-outfit">Silius</span>
              </div>
              <p className="text-sm opacity-60 leading-relaxed">
                Yeni nesil sosyalleşme platformu. Şehrin ritmini yakala, gerçek bağlar kur.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6">Keşfet</h4>
              <ul className="space-y-4 text-sm opacity-60">
                <li><Link to="/vibeler" className="hover:text-indigo-500 hover:opacity-100 transition-all">Vibeler</Link></li>
                <li><Link to="/mekanlar" className="hover:text-indigo-500 hover:opacity-100 transition-all">Mekanlar</Link></li>
                <li><Link to="/topluluk" className="hover:text-indigo-500 hover:opacity-100 transition-all">Topluluklar</Link></li>
                <li><Link to="/events" className="hover:text-indigo-500 hover:opacity-100 transition-all">Etkinlikler</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Kurumsal</h4>
              <ul className="space-y-4 text-sm opacity-60">
                <li><Link to="/about" className="hover:text-indigo-500 hover:opacity-100 transition-all">Hakkımızda</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-500 hover:opacity-100 transition-all">İletişim</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Yasal</h4>
              <ul className="space-y-4 text-sm opacity-60">
                <li><Link to="/privacy" className="hover:text-indigo-500 hover:opacity-100 transition-all">Gizlilik Politikası</Link></li>
                <li><Link to="/terms" className="hover:text-indigo-500 hover:opacity-100 transition-all">Kullanım Koşulları</Link></li>
                <li><Link to="/guidelines" className="hover:text-indigo-500 hover:opacity-100 transition-all">Topluluk Kuralları</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-opacity-10 dark:border-white/10 border-black/10 pt-8 flex flex-col md:flex-row justify-between items-center opacity-60 text-sm">
            <p>© 2024 Silius Platform. Tüm hakları saklıdır.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              {/* Social Icons Placeholder */}
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors"><Globe size={14} /></div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors"><MapPin size={14} /></div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotateY(12deg) rotateZ(6deg); }
          50% { transform: translateY(-20px) rotateY(12deg) rotateZ(6deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .hover\:paused:hover { animation-play-state: paused; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Landing;
