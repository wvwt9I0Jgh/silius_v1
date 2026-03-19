import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Zap, Shield, MapPin, Globe, X, ChevronRight, Plus, ScanLine, Ticket, Volume2, Fingerprint, Users, Menu
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Admin logic
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const hashPassword = async (password: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

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

        if (usersRes.status === 'fulfilled' && usersRes.value.count !== null) userCount = usersRes.value.count;
        if (eventsRes.status === 'fulfilled' && eventsRes.value.count !== null) eventCount = eventsRes.value.count;
        if (participantsRes.status === 'fulfilled' && participantsRes.value.count !== null) participantCount = participantsRes.value.count;

        const totalVibeScore = (eventCount * 10) + (participantCount * 5);

        const formatNumber = (num: number) => {
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
          return `${num}`;
        };

        setStats({
          users: formatNumber(userCount ?? 0),
          events: formatNumber(eventCount ?? 0),
          vibeScore: formatNumber(totalVibeScore ?? 0)
        });
      } catch (err) {
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

  const handleAdminLogin = async () => {
    setLoadingAdmin(true);
    try {
      const inputHash = await hashPassword(adminPassword);
      const { data: isValid, error } = await supabase.rpc('verify_admin_password', { input_hash: inputHash });
      if (error) throw error;
      if (isValid) {
        localStorage.setItem('silius_admin_auth', 'true');
        setShowAdminModal(false);
        setAdminPassword('');
        setAuthError('');
        navigate('/admin');
      } else {
        setAuthError('Hatalı şifre');
      }
    } catch {
      setAuthError('Bağlantı hatası, tekrar dene');
    } finally {
      setLoadingAdmin(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden bg-bg-deep text-text-main selection:bg-fuchsia-500 selection:text-text-main">

      {/* Extreme Gritty Noise Overlay */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none mix-blend-screen z-[100]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bg-surface/80 backdrop-blur-xl" onClick={() => setShowAdminModal(false)} />
          <div className="relative w-full max-w-sm rounded-[2rem] p-8 border shadow-[0_0_50px_rgba(217,70,239,0.3)] bg-[#0a0514] border-fuchsia-500/30">
            <button onClick={() => setShowAdminModal(false)} className="absolute top-6 right-6 text-text-main/50 hover:text-text-main"><X size={24} /></button>
            <div className="text-left mb-8">
              <div className="w-12 h-12 bg-fuchsia-500 rounded-lg flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(217,70,239,0.5)]">
                <Shield className="text-text-main" size={24} />
              </div>
              <h3 className="font-outfit text-2xl font-black uppercase tracking-widest text-text-main">Yönetici</h3>
              <p className="text-text-main/50 text-sm mt-1">Sistem erişimi gerekiyor.</p>
            </div>
            <div className="space-y-4">
              <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} placeholder="Erişim Kodu" className="w-full px-5 py-4 bg-bg-surface border border-white/10 rounded-xl outline-none focus:border-fuchsia-500 text-text-main placeholder:text-text-main/30 font-mono transition-colors tracking-widest" autoFocus />
              {authError && <p className="text-fuchsia-500 text-xs font-bold uppercase tracking-widest">{authError}</p>}
              <button onClick={handleAdminLogin} disabled={loadingAdmin} className="w-full py-4 bg-white text-bg-deep font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-fuchsia-400 transition-colors">
                {loadingAdmin ? 'ONAYLANIYOR...' : 'SİSTEME GİR'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cyber-Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 20 ? 'py-4 bg-bg-deep/80 backdrop-blur-2xl border-b border-white/5' : 'py-6 bg-transparent'}`}>
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
          <button onClick={handleLogoClick} className="flex items-center gap-3 group relative">
            <div className="absolute inset-0 bg-fuchsia-500 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity" />
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center relative z-10">
              <ScanLine size={20} className="text-bg-deep" />
            </div>
            <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-text-main">Silius</span>
          </button>

          <div className="hidden md:flex items-center gap-6 border border-white/10 bg-text-main/5 px-6 py-2.5 rounded-full backdrop-blur-md">
            {[
              { name: 'Nasıl Kullanılır?', path: '/nasil-kullanilir' },
              { name: 'Radar', path: '/vibeler' },
              { name: 'Topluluk', path: '/topluluk' },
              { name: 'Mekanlar', path: '/mekanlar' },
              { name: 'Galerimiz', path: '/galerimiz' },
            ].map(link => (
              <Link key={link.name} to={link.path} className="text-[11px] font-bold tracking-[0.2em] text-text-main/50 hover:text-text-main uppercase transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden w-11 h-11 rounded-full border border-fuchsia-500/40 bg-bg-surface/70 backdrop-blur-md flex items-center justify-center text-fuchsia-400"
              aria-label="Menüyü aç"
            >
              <Menu size={18} />
            </button>
            <Link to={user ? "/home" : "/auth"} className="relative group px-6 py-3 overflow-hidden rounded-full border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 text-[11px] font-bold uppercase tracking-[0.2em] hover:text-text-main transition-colors flex items-center gap-2">
              <span className="absolute inset-0 bg-fuchsia-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10">{user ? 'RADARA DÖN' : 'Kayıt / Giriş'}</span>
            </Link>
          </div>
        </div>
      </nav>

      {showMobileMenu && (
        <div className="fixed inset-0 z-[120] md:hidden">
          <button
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
            aria-label="Menüyü kapat"
          />
          <aside className="absolute top-0 left-0 h-full w-[82%] max-w-sm bg-[#070311] border-r border-fuchsia-500/25 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-black uppercase tracking-[0.25em] text-fuchsia-400">Menü</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="w-10 h-10 rounded-full border border-white/15 text-text-main/70 flex items-center justify-center"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Nasıl Kullanılır?', path: '/nasil-kullanilir' },
                { name: 'Radar', path: '/vibeler' },
                { name: 'Topluluk', path: '/topluluk' },
                { name: 'Mekanlar', path: '/mekanlar' },
                { name: 'Info', path: '/info' },
                { name: 'Galerimiz', path: '/galerimiz' },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className="block rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-bold uppercase tracking-[0.2em] text-text-main/80"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <Link
              to={user ? '/home' : '/auth'}
              onClick={() => setShowMobileMenu(false)}
              className="mt-auto rounded-2xl bg-fuchsia-500 text-white text-center py-4 font-black uppercase tracking-[0.22em]"
            >
              {user ? 'Radara Dön' : 'Kayıt / Giriş'}
            </Link>
          </aside>
        </div>
      )}

      {/* Cyber-Rave Hero */}
      <header className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-bg-deep">
        {/* Abstract light pools */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="max-w-[1400px] w-full mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
           <div className="flex flex-col items-start gap-8 z-20">
              <div className="inline-flex items-center gap-3 px-4 py-2 border border-fuchsia-500/30 bg-fuchsia-500/10 backdrop-blur-md rounded-full text-xs font-bold text-fuchsia-400 tracking-[0.2em] uppercase origin-left animate-[scaleIn_0.5s_ease-out]">
                <span className="w-2 h-2 rounded-full bg-fuchsia-500" style={{ boxShadow: '0 0 10px #d946ef' }} />
                Silius Club Access // Beta
              </div>
              
              <h1 className="text-[4.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[9rem] font-black font-outfit uppercase leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/10 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] relative">
                <span className="block hover:translate-x-2 transition-transform duration-500 cursor-default">GECEYİ</span>
                <span className="block text-fuchsia-500 drop-shadow-[0_0_40px_rgba(217,70,239,0.4)] hover:translate-x-4 transition-transform duration-500 cursor-default">YAŞA.</span>
              </h1>
              
              <p className="max-w-md text-lg md:text-xl text-text-main/60 font-light leading-relaxed border-l-2 border-cyan-500 pl-6">
                Şehrin yeraltı ritmine katıl. Gizli mekanlar, özel partiler ve seninle aynı frekansta olan insanlar. Algoritmalara değil, <span className="text-cyan-400 font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">bass'a güven.</span>
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4 w-full sm:w-auto">
<Link to={user ? "/home" : "/auth"} className="relative group overflow-hidden rounded-2xl bg-fuchsia-600 text-white px-8 py-5 flex items-center justify-center gap-4 font-black tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:shadow-[0_0_50px_rgba(217,70,239,0.8)] flex-1 sm:flex-none">
                     <div className="absolute inset-0 bg-fuchsia-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                   <Ticket size={24} className="relative z-10 group-hover:-rotate-12 transition-transform" />
                   <span className="relative z-10">Listeye Gir</span>
                </Link>


              </div>
           </div>
           
           <div className="relative h-[500px] lg:h-[700px] w-full mt-10 lg:mt-0 perspective-1000">
              {/* Chaotic Brutalist Collage */}
              <div className="absolute top-0 right-0 w-[85%] h-[75%] bg-slate-900 border border-white/10 overflow-hidden transform rotate-y-[10deg] rotate-z-[4deg] shadow-[0_30px_60px_rgba(0,0,0,0.8)] animate-float z-10">
                <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&q=80" className="w-full h-full object-cover mix-blend-luminosity opacity-70 filter contrast-125 hover:scale-110 hover:opacity-100 transition-all duration-1000" alt="Rave" />
                <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/50 mix-blend-overlay pointer-events-none" />
                <div className="absolute top-4 right-4 bg-bg-surface/50 backdrop-blur-md px-3 py-1 font-mono text-[10px] text-fuchsia-400 border border-fuchsia-500/30">REC // 04:23 AM</div>
              </div>
              
              <div className="absolute bottom-4 left-0 lg:-left-10 w-[70%] h-[55%] bg-bg-deep border border-cyan-500/40 overflow-hidden transform -rotate-y-[10deg] -rotate-z-[3deg] shadow-[0_0_40px_rgba(34,211,238,0.15)] animate-float animation-delay-2000 p-6 flex flex-col justify-end z-20">
                 <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale filter contrast-150" alt="DJ" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#03000a] via-[#03000a]/50 to-transparent pointer-events-none" />
                 <div className="relative z-10 border-l-4 border-cyan-400 pl-5">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     <span className="text-text-main/60 font-bold tracking-widest text-[10px] uppercase font-mono">Live Session</span>
                   </div>
                   <h3 className="text-text-main font-black text-3xl uppercase tracking-tighter leading-none">Underground <br/>Warehouse</h3>
                   <div className="flex items-center gap-4 mt-4">
                     <div className="flex -space-x-3">
                        {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#03000a] bg-slate-800 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=rave${i}`} className="w-full h-full object-cover" /></div>)}
                        <div className="w-10 h-10 rounded-full border-2 border-[#03000a] bg-cyan-500 flex items-center justify-center text-xs font-black text-[#03000a] tracking-tighter">+84</div>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-[20%] -left-10 w-24 h-24 bg-rose-500 rounded-full blur-[40px] opacity-30 animate-pulse animation-delay-1000 z-0" />
              <BarcodeDecor className="absolute -right-8 bottom-1/4 transform rotate-90 text-text-main/20 hidden lg:block" />
           </div>
        </div>
      </header>

      {/* Manifesto / Stats Marquee */}
      <div className="w-full relative overflow-hidden bg-fuchsia-600 py-6 transform -skew-y-2 origin-left border-y border-bg-surface shadow-[0_0_50px_rgba(217,70,239,0.2)] z-20 my-10">
        <div className="inline-flex animate-[marquee_20s_linear_infinite] whitespace-nowrap items-center w-[200%]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-16 px-8">
              <span className="text-bg-deep font-black font-outfit text-5xl uppercase tracking-tighter mix-blend-overlay">SIRADANLIĞI REDDET</span>
              <X size={40} className="text-bg-deep opacity-30" />
              <span className="text-bg-deep font-black font-outfit text-5xl uppercase tracking-tighter drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]">{stats.users} RAVER</span>
              <X size={40} className="text-bg-deep opacity-30" />
              <span className="text-bg-deep font-black font-outfit text-5xl uppercase tracking-tighter mix-blend-overlay">GİZLİ MEKANLAR</span>
              <X size={40} className="text-bg-deep opacity-30" />
              <span className="text-bg-deep font-black font-outfit text-5xl uppercase tracking-tighter drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]">{stats.events} PARTİ</span>
              <X size={40} className="text-bg-deep opacity-30" />
            </div>
          ))}
        </div>
      </div>

      {/* RİTMİ YAKALA Section - Raw Brutalism Discover */}
      <section id="discover" className="py-24 md:py-40 relative bg-bg-deep z-10">
        {/* Subtle grid in background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="max-w-[1400px] mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
            
            <div className="w-full lg:w-1/3 lg:sticky lg:top-40 space-y-10">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-[2px] w-8 bg-cyan-400" />
                  <span className="text-cyan-400 font-bold tracking-[0.3em] text-xs uppercase font-mono">Radar Sistemi</span>
                </div>
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black font-outfit uppercase leading-[0.85] tracking-tighter text-text-main">
                  RİTMİ <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 animate-gradient-x">YAKALA.</span>
                </h2>
              </div>
              
              <p className="text-text-main/60 text-lg font-light leading-relaxed border-l border-white/20 pl-6 py-2">
                Sadece davetlilerin bildiği ev partileri, terkedilmiş depolardaki raveler ve şehrin en iyi club geceleri. Hepsi tek bir radarın ucunda. <b className="text-text-main font-medium">Bilet almak için sırada bekleme, QR ile direkt mekana dal.</b>
              </p>
              
              <div className="space-y-8 pt-4">
                {[
                  { title: "BİLET DERDİ YOK", desc: "Kapıda bekleme, oluşturulan QR kod ile direkt giriş yap.", icon: Fingerprint, color: "text-cyan-400" },
                  { title: "KABİLENİ BUL", desc: "Algoritma değil, seninle aynı BPM'de atan insanlarla eşleş.", icon: Users, color: "text-fuchsia-400" },
                  { title: "CANLI HARİTA", desc: "Şu an şehrin kalbi nerede atıyor anında radarında gör.", icon: MapPin, color: "text-emerald-400" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                     <div className={`p-4 bg-white/[0.02] border border-white/5 rounded-xl group-hover:bg-white/[0.05] group-hover:border-white/20 transition-all duration-300 md:group-hover:scale-110 ${item.color}`}>
                       <item.icon size={28} strokeWidth={1.5} />
                     </div>
                     <div className="pt-1 w-full">
                       <h4 className="font-black text-text-main text-lg tracking-wider uppercase mb-1">{item.title}</h4>
                       <p className="text-sm text-text-main/50 leading-relaxed group-hover:text-text-main/80 transition-colors">{item.desc}</p>
                       <div className={`h-[1px] w-0 bg-current mt-4 group-hover:w-full transition-all duration-500 opacity-20 ${item.color}`} />
                     </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 auto-rows-min mt-10 lg:mt-0">
               {/* Bento Box 1 - Techno/Acid */}
               <Link to="/mekanlar" className="aspect-square bg-[#07051a] overflow-hidden relative group border border-white/5 hover:border-cyan-500/50 transition-colors block cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-80 transition-all duration-[1.5s] mix-blend-screen filter contrast-125 grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[black] via-[#03000a]/80 to-transparent" />
                  
                  <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-start opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                     <div className="w-8 h-8 rounded-full border border-cyan-500 flex items-center justify-center backdrop-blur-md">
                        <ArrowRight size={14} className="text-cyan-400 rotate-45" />
                     </div>
                     <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-widest font-mono">Erişim: Açık</span>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                     <h3 className="text-3xl md:text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-3">Karanlık<br/>Odalar</h3>
                     <div className="w-full h-[1px] bg-text-main/10 relative overflow-hidden mb-3">
                       <div className="absolute inset-y-0 left-0 w-full bg-cyan-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
                     </div>
                     <p className="text-cyan-400 text-xs font-bold tracking-[0.2em] font-mono">TECHNO & ACID / ENDÜSTRİYEL</p>
                  </div>
               </Link>

               {/* Bento Box 2 - Invite Only House */}
               <Link to="/mekanlar" className="aspect-square bg-[#07051a] overflow-hidden relative group border border-white/5 hover:border-fuchsia-500/50 transition-colors md:translate-y-16 block cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 group-hover:opacity-90 transition-all duration-[1.5s] mix-blend-screen filter contrast-125 saturate-150 grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[black] via-[#03000a]/80 to-transparent" />
                  
                  <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-start opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                     <div className="w-8 h-8 rounded-full border border-fuchsia-500 flex items-center justify-center backdrop-blur-md">
                        <ArrowRight size={14} className="text-fuchsia-400 rotate-45" />
                     </div>
                     <span className="px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 text-[10px] font-bold uppercase tracking-widest font-mono">Sadece Davetiye</span>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                     <h3 className="text-3xl md:text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-3">Özel Ev<br/>Partileri</h3>
                     <div className="w-full h-[1px] bg-text-main/10 relative overflow-hidden mb-3">
                       <div className="absolute inset-y-0 left-0 w-full bg-fuchsia-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
                     </div>
                     <p className="text-fuchsia-400 text-xs font-bold tracking-[0.2em] font-mono">GİZLİ LOKASYONLAR</p>
                  </div>
               </Link>

               {/* Bento Box 3 - Wide (Open Air) */}
               <Link to="/mekanlar" className="md:col-span-2 h-[300px] md:h-[350px] bg-[#07051a] overflow-hidden relative group border border-white/5 hover:border-emerald-500/50 transition-colors md:mt-16 block cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-100 transition-all duration-[2s] mix-blend-luminosity grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[black] via-[#03000a]/80 to-transparent md:w-[70%]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[black] to-transparent md:hidden" />
                  
                  <div className="absolute bottom-8 left-8 md:top-1/2 md:-translate-y-1/2 md:max-w-md">
                     <div className="inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-[0.3em] uppercase font-mono mb-6 backdrop-blur-md">Açık Hava & Sokak</div>
                     <h3 className="text-4xl md:text-5xl font-black text-text-main uppercase tracking-tighter leading-[0.9] mb-4 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">Şehri Uykusundan <br/><span className="text-emerald-400">Uyandır.</span></h3>
                     <p className="text-text-main/50 text-sm md:text-base font-light hidden md:block">Güneşin doğuşunu sahilde karşılamak veya şehrin sokaklarında block party ruhunu yaşamak isteyenler için.</p>
                  </div>
                  
                  <div className="absolute right-8 bottom-8 md:top-1/2 md:-translate-y-1/2 w-16 h-16 rounded-full border-2 border-emerald-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500 bg-bg-surface/40 backdrop-blur-md">
                     <ArrowRight size={24} className="text-emerald-400" />
                  </div>
               </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 🎶 Parti Kategorileri - Underground Cyber-Rave Redesign */}
      <section className="py-32 relative overflow-hidden bg-bg-deep border-t border-fuchsia-500/10">
        {/* Gritty Noise & Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Abstract Neon Glows */}
        <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] rounded-full bg-fuchsia-600/10 blur-[150px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-[-10%] w-[800px] h-[800px] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen pointer-events-none" />

        <div className="w-full max-w-[1400px] mx-auto px-6 mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="relative">
            {/* Architectural Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-12 bg-gradient-to-r from-fuchsia-500 to-cyan-500" />
              <span className="text-fuchsia-400 font-bold tracking-[0.3em] text-xs uppercase font-outfit block">Parti Zamanı</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter text-text-main leading-[0.9] relative group">
              <span className="block opacity-40 transform translate-y-4 group-hover:translate-y-2 group-hover:opacity-20 transition-all duration-500">PARTİ</span>
              <span className="relative z-10 block text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">KATEGORİLERİ</span>
            </h2>
          </div>
          
          <Link to="/mekanlar" className="relative group overflow-hidden rounded-full p-[1px] shrink-0 self-start md:self-auto mt-4 md:mt-0">
            <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-fuchsia-500 bg-[length:200%_auto] animate-gradient-x opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-slate-950 px-8 py-4 rounded-full flex items-center gap-3 transition-all group-hover:bg-transparent duration-300">
              <span className="font-outfit font-bold text-text-main uppercase tracking-widest text-sm">Tümünü Gör</span>
              <ArrowRight size={16} className="text-cyan-400 group-hover:translate-x-1 group-hover:text-text-main transition-all" />
            </div>
          </Link>
        </div>

        <div className="w-full max-w-[1400px] mx-auto px-6 relative z-10">
          {/* Brutalist Accordion Grid */}
          <div className="flex flex-col md:flex-row w-full h-[800px] md:h-[600px] gap-3 md:gap-4 transition-all duration-700">
            {[
              { name: 'Club Night', sub: 'Her Gece', img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1200', textColors: 'text-fuchsia-400', gradient: 'from-fuchsia-600 to-purple-900', borderHover: 'group-hover:border-fuchsia-500/50' },
              { name: 'Rave', sub: 'Underground', img: 'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=1200', textColors: 'text-cyan-400', gradient: 'from-cyan-500 to-blue-900', borderHover: 'group-hover:border-cyan-400/50' },
              { name: 'Sahil', sub: 'Gündüz & Gece', img: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=1200', textColors: 'text-amber-400', gradient: 'from-amber-500 to-orange-900', borderHover: 'group-hover:border-amber-400/50' },
              { name: 'Ev Partisi', sub: 'Özel Davet', img: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1200', textColors: 'text-rose-400', gradient: 'from-rose-500 to-red-900', borderHover: 'group-hover:border-rose-400/50' },
              { name: 'Sokak', sub: 'Açık Hava', img: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?q=80&w=1200', textColors: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-900', borderHover: 'group-hover:border-emerald-400/50' },
            ].map((cat, i) => (
              <Link 
                to="/mekanlar" 
                key={i} 
                className={`group relative flex-1 hover:flex-[3] md:hover:flex-[4] transition-[flex] duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900 shadow-2xl ${cat.borderHover}`}
              >
                {/* Background Image with intense zoom effect */}
                <img 
                  src={cat.img} 
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 group-hover:rotate-1 opacity-50 md:opacity-30 group-hover:opacity-100 grayscale-[30%] group-hover:grayscale-0" 
                />
                
                {/* Layered Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#03000a] via-[#03000a]/50 to-transparent md:opacity-90 group-hover:opacity-[0.85] transition-opacity duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} mix-blend-color opacity-0 group-hover:opacity-40 transition-opacity duration-700`} />

                {/* Vertical Text (Default state on desktop) */}
                <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                  <span className="text-text-main font-outfit font-black text-3xl uppercase tracking-[0.2em] -rotate-90 whitespace-nowrap opacity-40 group-hover:opacity-0 transition-all duration-300">
                    {cat.name}
                  </span>
                </div>

                {/* Content (Visible on mobile, revealed on hover entirely for desktop) */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end transform md:translate-y-8 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-75">
                  <div className="overflow-hidden mb-1">
                    <span className={`${cat.textColors} font-bold font-outfit tracking-[0.3em] text-xs md:text-sm uppercase block transform md:translate-y-full group-hover:translate-y-0 transition-transform duration-700 delay-150`}>
                      {cat.sub}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl lg:text-6xl font-black font-outfit text-text-main uppercase tracking-tighter leading-none mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,1)]">
                    {cat.name.split(' ').map((word, idx) => (
                      <span key={idx} className="block">{word}</span>
                    ))}
                  </h3>
                  
                  <div className={`w-0 h-1 bg-gradient-to-r ${cat.gradient} group-hover:w-full transition-all duration-1000 delay-300 mb-6`} />
                  
                  <div className="flex items-center gap-3 transform md:translate-y-8 group-hover:translate-y-0 transition-all duration-700 delay-300 opacity-0 group-hover:opacity-100">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md bg-text-main/5">
                      <ArrowRight size={16} className={cat.textColors} />
                    </div>
                    <span className="text-text-main/80 font-medium text-sm tracking-wide uppercase">Keşfet</span>
                  </div>
                </div>
                
                {/* Mobile specific persistent content so it's not totally blank before tap */}
                <div className="absolute right-6 bottom-6 md:hidden opacity-100 group-hover:opacity-0 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-text-main/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Plus size={20} className="text-text-main" />
                  </div>
                </div>
                <div className="absolute left-6 bottom-6 md:hidden opacity-100 group-hover:opacity-0 transition-opacity">
                   <h3 className="text-2xl font-black font-outfit text-text-main uppercase tracking-tighter">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 relative bg-bg-deep flex items-center justify-center overflow-hidden border-t border-fuchsia-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,70,239,0.15)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 bg-text-main/5 rounded-full mb-8 backdrop-blur-sm">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-[10px] font-bold text-text-main/50 tracking-widest uppercase">Girişler Açık</span>
          </div>
          <h2 className="text-[5rem] md:text-[10rem] lg:text-[12rem] font-black font-outfit uppercase tracking-tighter leading-[0.8] text-text-main opacity-90 mb-12 drop-shadow-[0_0_50px_rgba(217,70,239,0.3)] hover:scale-105 transition-transform duration-700 cursor-default">
            SAHNEYE<br/>ÇIK
          </h2>
          
          <Link to={user ? "/home" : "/auth"} className="relative group inline-flex items-center justify-center">
               <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative flex items-center gap-4 px-12 py-6 rounded-2xl bg-fuchsia-600 text-white font-black uppercase tracking-widest hover:bg-fuchsia-500 transition-colors duration-300 w-full sm:w-auto justify-center z-10 hover:shadow-[0_0_40px_rgba(217,70,239,0.8)] shadow-[0_0_20px_rgba(217,70,239,0.4)]">
               <span>Sisteme Bağlan</span>
               <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
             </div>
          </Link>
        </div>
      </section>

      {/* Extreme Minimal Footer */}
      <footer className="bg-bg-deep border-t border-white/5 pt-20 pb-10 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ScanLine size={24} className="text-text-main" />
                <span className="text-3xl font-black font-outfit uppercase tracking-tighter text-text-main">Silius</span>
              </div>
              <p className="text-text-main/40 text-sm max-w-sm font-light">İstanbul un yeraltı ritmi. Algoritmaları unut, müziğe güven. Sadece davetli olanların bildiği dünyayı keşfet.</p>
            </div>
            
            <div className="flex gap-16">
              <div className="space-y-4">
                <h4 className="text-text-main/30 font-bold uppercase tracking-widest text-[10px] font-mono">Keşfet</h4>
                <ul className="space-y-3">
                  <li><Link to="/vibeler" className="text-text-main/70 hover:text-cyan-400 hover:tracking-widest transition-all text-sm uppercase">Radar</Link></li>
                  <li><Link to="/mekanlar" className="text-text-main/70 hover:text-cyan-400 hover:tracking-widest transition-all text-sm uppercase">Mekanlar</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-text-main/30 font-bold uppercase tracking-widest text-[10px] font-mono">Sistem</h4>
                <ul className="space-y-3">
                  <li><Link to="/nasil-kullanilir" className="text-text-main/70 hover:text-fuchsia-400 hover:tracking-widest transition-all text-sm uppercase">Nasıl Kullanılır?</Link></li>
                  <li><Link to="/about" className="text-text-main/70 hover:text-fuchsia-400 hover:tracking-widest transition-all text-sm uppercase">Manifesto</Link></li>
                  <li><Link to="/info" className="text-text-main/70 hover:text-fuchsia-400 hover:tracking-widest transition-all text-sm uppercase">Info</Link></li>
                  <li><Link to="/galerimiz" className="text-text-main/70 hover:text-fuchsia-400 hover:tracking-widest transition-all text-sm uppercase">Galerimiz</Link></li>
                  <li><Link to="/cookie-policy" className="text-text-main/70 hover:text-fuchsia-400 hover:tracking-widest transition-all text-sm uppercase">Çerez Politikası</Link></li>
                  <li><Link to="/guidelines" className="text-text-main/70 hover:text-fuchsia-400 hover:tracking-widest transition-all text-sm uppercase">Kurallar</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-text-main/30 text-xs font-mono uppercase tracking-widest">
            <p>© 2026 SILIUS CLUB. NO RIGHTS RESERVED.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-text-main transition-colors">INSTAGRAM</a>
              <a href="#" className="hover:text-text-main transition-colors">SOUNDCLOUD</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotateY(10deg) rotateZ(4deg); }
          50% { transform: translateY(-15px) rotateY(12deg) rotateZ(5deg); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hover\:paused:hover { animation-play-state: paused; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// SVG Icon Components for extreme aesthetics
const BarcodeDecor = ({ className = "" }) => (
  <svg width="100" height="40" viewBox="0 0 100 40" fill="currentColor" className={className}>
    <rect x="0" y="0" width="4" height="40" />
    <rect x="8" y="0" width="2" height="40" />
    <rect x="14" y="0" width="8" height="40" />
    <rect x="26" y="0" width="4" height="40" />
    <rect x="34" y="0" width="2" height="40" />
    <rect x="40" y="0" width="12" height="40" />
    <rect x="56" y="0" width="2" height="40" />
    <rect x="62" y="0" width="6" height="40" />
    <rect x="72" y="0" width="14" height="40" />
    <rect x="90" y="0" width="4" height="40" />
    <rect x="98" y="0" width="2" height="40" />
  </svg>
);

export default Landing;
