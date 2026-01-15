import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Star, Zap, Shield, Heart, Users, Mail, Sun, Moon, X, Lock, Loader2 } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Admin giriş modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Admin şifresi
  const ADMIN_PASSWORD = 'Allah4848';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Tarayıcıdan tema tercihini al
    const savedTheme = localStorage.getItem('silius_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('silius_theme', newMode ? 'dark' : 'light');
  };

  // Silius logosuna tıklandığında
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // 3 kez tıklandığında admin modal'ı aç
    if (newCount >= 3) {
      setShowAdminModal(true);
      setClickCount(0);
    }

    // 2 saniye sonra sayacı sıfırla
    setTimeout(() => setClickCount(0), 2000);
  };

  const handleAdminLogin = () => {
    setIsLoggingIn(true);
    setAdminError('');

    setTimeout(() => {
      if (adminPassword === ADMIN_PASSWORD) {
        // Admin olarak işaretle (localStorage'a kaydet)
        localStorage.setItem('silius_admin_auth', 'true');
        setShowAdminModal(false);
        navigate('/admin');
      } else {
        setAdminError('Şifre yanlış!');
      }
      setIsLoggingIn(false);
    }, 500);
  };

  return (
    <div className={`relative min-h-screen overflow-x-hidden selection:bg-indigo-500/30 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* Admin Giriş Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowAdminModal(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-rose-500" size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Admin Girişi</h2>
              <p className="text-sm opacity-60 mt-1">Yönetici şifresini girin</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => {
                    setAdminPassword(e.target.value);
                    setAdminError('');
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="Şifre"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-rose-500 transition-colors"
                  autoFocus
                />
              </div>

              {adminError && (
                <p className="text-rose-500 text-sm text-center font-bold">{adminError}</p>
              )}

              <button
                onClick={handleAdminLogin}
                disabled={isLoggingIn || !adminPassword}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Giriş Yap'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 md:top-8 md:right-12 z-[200] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-90 group ${isDarkMode ? 'bg-slate-800/80 backdrop-blur-md border border-white/10' : 'bg-white/80 backdrop-blur-md border border-slate-200'}`}
      >
        {isDarkMode ? (
          <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon size={20} className="text-indigo-600 group-hover:-rotate-12 transition-transform" />
        )}
      </button>

      {/* Header Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${isDarkMode ? 'bg-slate-950/80 border-white/10' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className={`text-2xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'} hover:text-rose-500 transition-colors cursor-pointer`}
          >
            Silius
          </button>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/vibeler" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}>
              Vibeler
            </Link>
            <Link to="/topluluk" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}>
              Topluluk
            </Link>
            <Link to="/mekanlar" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}>
              Mekanlar
            </Link>
            <Link to="/about" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}>
              Hakkımızda
            </Link>
            <Link to="/auth" className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors">
              Giriş
            </Link>
          </nav>
        </div>
      </header>

      {/* Background Ambience & Hero Video */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}
        >
          <source src="https://videos.pexels.com/video-files/3045163/3045163-uhd_2560_1440_24fps.mp4" type="video/mp4" />
        </video>

        {/* Fallback Image */}
        <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop')] bg-cover bg-center ${isDarkMode ? 'opacity-10' : 'opacity-5'}`}></div>

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-slate-950 via-slate-950/80 to-slate-950' : 'from-slate-50 via-slate-50/80 to-slate-50'}`}></div>

        {/* Glowing orbs */}
        <div className={`absolute top-[10%] left-[10%] w-96 h-96 blur-[150px] rounded-full animate-pulse ${isDarkMode ? 'bg-indigo-600/20' : 'bg-indigo-600/10'}`}></div>
        <div className={`absolute bottom-[10%] right-[10%] w-96 h-96 blur-[150px] rounded-full animate-pulse ${isDarkMode ? 'bg-rose-600/20' : 'bg-rose-600/10'}`}></div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 w-full">
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">

          <div className={`transition-all duration-700 ${scrollY > 50 ? 'opacity-0 -translate-y-10' : 'opacity-100'}`}>
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-bold uppercase tracking-[0.3em] mb-12">
              <Sparkles size={14} className="text-amber-400" />
              <span>Hayatın Her Anı İçin Bir Topluluk</span>
            </div>
          </div>

          <div className="relative text-center mb-16 z-20">
            <h1 className="text-7xl md:text-[10rem] font-black font-outfit leading-[0.8] tracking-tighter uppercase italic drop-shadow-2xl"
              style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
              <span className="block mb-2">ANI</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500">
                PAYLAŞ
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-2xl text-center max-w-2xl mb-12 font-medium leading-relaxed text-slate-300 relative z-20">
            Silius'ta her frekansın bir yeri var. İster sabahın ilk ışıklarında bir çalışma grubu,
            ister gecenin karanlığında bir dans pisti. <span className="text-indigo-400 font-bold">Gerçek bağlar burada kurulur.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 relative z-20">
            <Link
              to="/auth"
              className="px-10 py-5 bg-white text-black hover:bg-slate-200 rounded-full font-black text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
            >
              HEMEN KATIL <ArrowRight size={20} />
            </Link>
            <Link
              to="/vibeler"
              className="px-10 py-5 border border-white/20 hover:bg-white/10 backdrop-blur-md rounded-full font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-105"
            >
              VIBELARI KEŞFET
            </Link>
          </div>
        </section>

        {/* Marquee Section */}
        <div className="py-24 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-rose-600/30 backdrop-blur-sm border-y border-white/20 overflow-hidden relative z-20 -rotate-1 shadow-[0_10px_100px_rgba(99,102,241,0.3)]">
          <div className="animate-marquee whitespace-nowrap flex gap-20 items-center w-full">
            <div className="flex gap-20 min-w-full items-center justify-around animate-marquee">
              <span className="text-6xl md:text-9xl font-black font-outfit text-white uppercase italic drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-110 transition-transform">KAHVE SOHBETLERİ</span>
              <span className="text-6xl md:text-9xl font-black font-outfit text-indigo-300 uppercase italic drop-shadow-[0_0_30px_rgba(99,102,241,0.8)] hover:scale-110 transition-transform">ÇALIŞMA GRUPLARI</span>
              <span className="text-6xl md:text-9xl font-black font-outfit text-white uppercase italic drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-110 transition-transform">NEON GECELERİ</span>
              <span className="text-6xl md:text-9xl font-black font-outfit text-rose-300 uppercase italic drop-shadow-[0_0_30px_rgba(244,63,94,0.8)] hover:scale-110 transition-transform">SESSİZ OKUMALAR</span>
              <span className="text-6xl md:text-9xl font-black font-outfit text-white uppercase italic drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-110 transition-transform">YÜRÜYÜŞ ROTALARI</span>
              {/* Duplicate for seamless loop */}
              <span className="text-6xl md:text-9xl font-black font-outfit text-white uppercase italic drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-110 transition-transform">KAHVE SOHBETLERİ</span>
              <span className="text-6xl md:text-9xl font-black font-outfit text-indigo-300 uppercase italic drop-shadow-[0_0_30px_rgba(99,102,241,0.8)] hover:scale-110 transition-transform">ÇALIŞMA GRUPLARI</span>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

              <div className="col-span-1 lg:col-span-4 lg:sticky lg:top-32 h-fit">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop"
                  alt="Social Life"
                  className="w-full h-80 object-cover rounded-[2rem] mb-8 opacity-80 hover:opacity-100 transition-opacity"
                />
                <div className="inline-block px-4 py-1 mb-6 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                  Hizmetlerimiz
                </div>
                <h2 className="text-5xl md:text-7xl font-black font-outfit uppercase italic leading-[0.9] mb-8">
                  SOSYAL <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">DÜNYANI</span> <br />
                  YENİDEN <br />
                  TASARLA
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed max-w-sm">
                  Silius ile sınırları kaldır. Sadece bir uygulama değil, bir yaşam tarzı inşa ediyoruz.
                </p>
              </div>

              <div className="col-span-1 lg:col-span-8 grid gap-8">
                <div className="group relative p-10 md:p-14 rounded-[3rem] bg-indigo-900/10 border border-white/5 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-20 transition-opacity duration-700 mix-blend-overlay" />
                  <div className="relative z-10">
                    <div className="mb-8 w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                      <Users className="text-white" size={32} />
                    </div>
                    <h3 className="text-4xl font-black font-outfit uppercase italic mb-4 text-indigo-100">Arkadaş Bul</h3>
                    <p className="text-xl text-slate-400 font-light leading-relaxed">
                      Canınız sıkıldığında anında kafa dengi insanlarla tanışın. Yalnız kalmak bir seçenek değil, bir tercih olsun.
                    </p>
                  </div>
                </div>

                <div className="group relative p-10 md:p-14 rounded-[3rem] bg-rose-900/10 border border-white/5 hover:border-rose-500/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-20 transition-opacity duration-700 mix-blend-overlay" />
                  <div className="relative z-10">
                    <div className="mb-8 w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center transform group-hover:-rotate-6 transition-transform">
                      <Zap className="text-white" size={32} />
                    </div>
                    <h3 className="text-4xl font-black font-outfit uppercase italic mb-4 text-rose-100">Sınırsız Eğlence</h3>
                    <p className="text-xl text-slate-400 font-light leading-relaxed">
                      Şehrin en iyi etkinlikleri, partileri ve buluşmaları parmaklarının ucunda. Ritmi yakala.
                    </p>
                  </div>
                </div>

                <div className="group relative p-10 md:p-14 rounded-[3rem] bg-amber-900/10 border border-white/5 hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-20 transition-opacity duration-700 mix-blend-overlay" />
                  <div className="relative z-10">
                    <div className="mb-8 w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                      <Star className="text-white" size={32} />
                    </div>
                    <h3 className="text-4xl font-black font-outfit uppercase italic mb-4 text-amber-100">Topluluk</h3>
                    <p className="text-xl text-slate-400 font-light leading-relaxed">
                      İlgi alanlarına göre özelleşmiş topluluklara katıl veya kendi kabileni oluştur. Birlikte daha güçlüyüz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-32 bg-slate-900/50 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-24">
              <span className="text-rose-500 font-bold tracking-widest uppercase text-sm mb-4 block">Why Us</span>
              <h2 className="text-6xl md:text-8xl font-black font-outfit uppercase italic leading-[0.9]">
                NEDEN BİZİ <br /> SEÇMELİSİNİZ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { id: "01", title: "Maksimum Güvenlik", icon: Shield, desc: "En üst düzey güvenlik önlemleriyle, huzurla sosyalleşin. Verileriniz ve deneyiminiz bizim için kutsal.", color: 'indigo' },
                { id: "02", title: "Eğlence ve Macera", icon: Zap, desc: "Sıradanlıktan uzak, macera dolu deneyimler. Her gün yeni bir hikaye yazmaya hazır mısın?", color: 'rose' },
                { id: "03", title: "Neden Olmasın?", icon: Heart, desc: "Hayatınıza yeni bir renk katmak, konfor alanınızdan çıkmak ve gerçek potansiyelinizi keşfetmek için.", color: 'emerald' }
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02]">
                  <div className={`text-6xl font-black font-outfit text-${item.color}-500/30 mb-6`}>{item.id}</div>
                  <h3 className="text-2xl font-black font-outfit uppercase italic mb-4 flex items-center gap-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vibes Grid */}
        <section className="py-40 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-6xl md:text-9xl font-black font-outfit uppercase italic leading-none mb-6">
                HER AN <br /> <span className="text-indigo-400">BİR VIBE</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Hayat sadece partilerden ibaret değil. Silius'ta her ruh haline uygun bir topluluk seni bekliyor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Sessiz Üretim", sub: "Odak Modu", img: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&auto=format" },
                { title: "Sabah Ritüeli", sub: "Huzurlu Anlar", img: "https://images.unsplash.com/photo-1511081692775-05d0f180a065?w=800&auto=format" },
                { title: "Gece Keşfi", sub: "Yüksek Enerji", img: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format" },
                { title: "Açık Hava", sub: "Denge", img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format" }
              ].map((vibe, i) => (
                <Link to="/auth" key={i} className="group relative h-[450px] rounded-[2rem] overflow-hidden">
                  <img src={vibe.img} alt={vibe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                  <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">{vibe.sub}</span>
                    <h3 className="text-3xl font-black font-outfit uppercase italic text-white">
                      {vibe.title.split(' ')[0]} <br /> {vibe.title.split(' ')[1]}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-40 relative overflow-hidden text-center bg-indigo-900/40">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop"
              alt="Party"
              className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950"></div>
          </div>

          <div className="relative z-10 px-6">
            <h2 className="text-6xl md:text-[8rem] font-black font-outfit uppercase italic leading-[0.8] mb-12 text-white">
              SIRADAKİ <br /> BAĞLANTIN <br /> BURADA
            </h2>
            <Link
              to="/auth"
              className="inline-flex px-16 py-6 bg-white text-indigo-900 rounded-full font-black text-2xl uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl"
            >
              KEŞFETMEYE BAŞLA
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`py-24 border-t relative z-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-100 text-slate-900 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <span className={`text-3xl font-black uppercase tracking-tighter mb-6 block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Silius</span>
            <p className={`font-medium max-w-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Geleceğin sosyal ağını bugün inşa ediyoruz. Hayatın her anını anlamlı kılmak için.
            </p>
          </div>
          <div>
            <h4 className={`font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Keşfet</h4>
            <div className={`flex flex-col gap-3 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <Link to="/vibeler" className={`transition-colors ${isDarkMode ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}>Vibeler</Link>
              <Link to="/topluluk" className={`transition-colors ${isDarkMode ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}>Topluluk</Link>
              <Link to="/mekanlar" className={`transition-colors ${isDarkMode ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}>Mekanlar</Link>
            </div>
          </div>
          <div>
            <h4 className={`font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Bilgi</h4>
            <div className={`flex flex-col gap-3 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <Link to="/about" className={`transition-colors ${isDarkMode ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}>Hakkımızda</Link>
              <Link to="/contact" className={`transition-colors ${isDarkMode ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}>İletişim</Link>
              <Link to="/security" className={`transition-colors ${isDarkMode ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}>Güvenlik</Link>
            </div>
          </div>
        </div>

        <div className={`max-w-7xl mx-auto px-6 mt-20 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-slate-500 font-medium text-sm ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <span>&copy; 2024 Silius Platform. Tüm hakları saklıdır.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className={`${isDarkMode ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}>Privacy</a>
            <a href="#" className={`${isDarkMode ? 'hover:text-indigo-400' : 'hover:text-indigo-600'}`}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
