import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, Chrome, ArrowLeft, Fingerprint, AtSign, Sparkles } from 'lucide-react';

const Auth: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    kvkkConsent: false
  });
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  useEffect(() => {
    setMounted(true);
    // OAuth hata mesajını sessionStorage'dan kontrol et
    const oauthError = sessionStorage.getItem('silius_oauth_error');
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      sessionStorage.removeItem('silius_oauth_error');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        // Ad/Soyad validasyonu
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('Ad ve soyad alanları zorunludur.');
          setIsLoading(false);
          return;
        }
        // Kullanıcı adı validasyonu
        if (!formData.username.trim()) {
          setError('Kullanıcı adı zorunludur.');
          setIsLoading(false);
          return;
        }
        // E-posta format validasyonu
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Geçerli bir e-posta adresi girin.');
          setIsLoading(false);
          return;
        }
        if (!formData.kvkkConsent) {
          setError('KVKK onayı zorunludur. Lütfen kuralları okuyup onaylayın.');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Şifre en az 6 karakter olmalıdır.');
          setIsLoading(false);
          return;
        }

        const { error: signUpError } = await signUp(formData.email, formData.password, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
          bio: "Silius'ta yeni bir macera başlıyor...",
          kvkkConsent: true,
          kvkkConsentDate: new Date().toISOString()
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('Bu e-posta zaten kullanımda.');
          } else {
            setError(signUpError.message || 'Kayıt başarısız.');
          }
        } else {
          // Kayıt başarılı - profil tamamlama sayfasına yönlendir
          navigate('/profile-setup');
        }
      } else {
        const { error: signInError } = await signIn(formData.email, formData.password);
        if (signInError) {
          // Ağ hatalarını ayırt et
          const errorMessage = signInError.message?.toLowerCase() || '';
          if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('internet')) {
            setError('İnternet bağlantınızı kontrol edin. Sunucuya ulaşılamıyor.');
          } else if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid_credentials')) {
            setError('E-posta veya şifre hatalı.');
          } else if (errorMessage.includes('email not confirmed')) {
            setError('E-posta adresinizi doğrulamanız gerekiyor. Lütfen e-posta kutunuzu kontrol edin.');
          } else if (errorMessage.includes('too many requests')) {
            setError('Çok fazla deneme yaptınız. Lütfen biraz bekleyin.');
          } else {
            setError(signInError.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
          }
        }
      }
    } catch (err: any) {
      // Ağ hataları burada da yakalanabilir
      const errorMessage = err?.message?.toLowerCase() || '';
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('internet')) {
        setError('İnternet bağlantınızı kontrol edin. Sunucuya ulaşılamıyor.');
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#03000a] transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'} selection:bg-fuchsia-500 selection:text-white`}>

      {/* Extreme Gritty Noise Overlay & Grid */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none mix-blend-screen z-[100]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-[1400px] min-h-[90vh] md:h-[800px] grid md:grid-cols-2 relative z-10 p-4 md:p-8 gap-8">

        {/* Left Panel - Brutalist Visual */}
        <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden bg-slate-900 border border-white/10 order-2 md:order-1 group">
          {/* Grayscale background image with cyber-filter */}
          <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&q=80" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity filter contrast-150 grayscale group-hover:scale-105 transition-transform duration-[2s]" alt="Rave" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03000a] via-[#03000a]/50 to-[#03000a]/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 mix-blend-overlay" />

          <div className="relative z-10 relative">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md rounded-none text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Sistem Aktif
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-white font-outfit leading-[0.8] tracking-tighter mb-6 uppercase">
              GECEYE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400 drop-shadow-[0_0_20px_rgba(217,70,239,0.5)]">SİZ.</span>
            </h1>
            <p className="text-white/50 text-lg font-light max-w-sm border-l-2 border-fuchsia-500 pl-4 py-2">
              Sadece davetlilerin bildiği yeraltı dünyasına erişim sağla. Algoritmalara değil, <b className="text-white">müziğe güven.</b>
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 mt-auto">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#03000a] bg-slate-800 bg-cover`} style={{ backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=rave${i * 123})` }}></div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#03000a] bg-cyan-500 flex items-center justify-center text-xs font-black text-[#03000a]">
                +4k
              </div>
            </div>
            <div className="text-xs font-bold text-white/40 tracking-widest uppercase font-mono">
              <span className="text-cyan-400">4,250+</span> Raver
            </div>
          </div>
        </div>

        {/* Right Panel - Terminal Form */}
        <div className="relative flex flex-col justify-center p-6 md:p-16 order-1 md:order-2 bg-[#03000a] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

          <button
            onClick={() => navigate('/')}
            className="absolute top-6 right-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/50 hover:text-white transition-colors uppercase group z-20"
          >
            <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            İptal
          </button>

          <div className="max-w-md w-full mx-auto space-y-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white font-outfit tracking-tighter uppercase mb-2">
                {isRegister ? 'Listeye Gir' : 'Sisteme Bağlan'}
              </h2>
              <p className="text-white/40 text-sm font-mono tracking-widest uppercase">
                {isRegister ? 'Kimlik oluşturuluyor...' : 'Erişim bekleniyor...'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">

              {isRegister && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input type="text" name="firstName" placeholder="Ad" required={isRegister} value={formData.firstName} onChange={handleChange}
                      className="w-full bg-black border border-white/10 rounded-none pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 focus:bg-white/5 transition-all text-sm font-bold font-mono uppercase tracking-widest"
                    />
                  </div>
                  <div className="group relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input type="text" name="lastName" placeholder="Soyad" required={isRegister} value={formData.lastName} onChange={handleChange}
                      className="w-full bg-black border border-white/10 rounded-none pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 focus:bg-white/5 transition-all text-sm font-bold font-mono uppercase tracking-widest"
                    />
                  </div>
                </div>
              )}

              {isRegister && (
                <div className="group relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input type="text" name="username" placeholder="Kullanıcı Adı" required={isRegister} value={formData.username} onChange={handleChange}
                    className="w-full bg-black border border-white/10 rounded-none pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 focus:bg-white/5 transition-all text-sm font-bold font-mono uppercase tracking-widest"
                  />
                </div>
              )}

              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-fuchsia-500 transition-colors" size={18} />
                <input type="email" name="email" placeholder="E-posta Adresi" required value={formData.email} onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-none pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500 focus:bg-white/5 transition-all text-sm font-bold font-mono tracking-widest"
                />
              </div>

              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-fuchsia-500 transition-colors" size={18} />
                <input type="password" name="password" placeholder="Şifre" required value={formData.password} onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-none pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500 focus:bg-white/5 transition-all text-sm font-bold font-mono tracking-widest"
                />
              </div>

              {isRegister && (
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative mt-1">
                    <input type="checkbox" checked={formData.kvkkConsent} onChange={(e) => setFormData({ ...formData, kvkkConsent: e.target.checked })} className="peer sr-only" />
                    <div className="w-5 h-5 rounded-none border border-white/20 peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-all flex items-center justify-center">
                      {formData.kvkkConsent && <div className="w-2 h-2 bg-black rounded-none"></div>}
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors leading-relaxed font-mono uppercase tracking-widest">
                    <span className="text-cyan-400 font-bold border-b border-cyan-400/30">Kuralları</span> okudum, yeraltı sistemine onayım var. Kuralların dışına çıkarsam sistemden banlanacağımı kabul ediyorum.
                  </span>
                </label>
              )}

              {error && (
                <div className={`p-4 rounded-none text-xs font-bold uppercase tracking-widest flex items-baseline gap-3 ${error.includes('başarılı') ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500' : 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500'}`}>
                  {error.includes('başarılı') ? <Sparkles size={16} className="shrink-0 relative top-0.5" /> : <Fingerprint size={16} className="shrink-0 relative top-0.5" />}
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="relative group w-full bg-white text-black py-5 font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 overflow-hidden rounded-none hover:bg-cyan-400"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                <span className="relative z-10 transition-transform group-hover:-translate-x-2">{isLoading ? 'İşleniyor...' : (isRegister ? 'Kimlik Doğrula' : 'Sisteme Gir')}</span>
                {!isLoading && <ArrowRight size={18} className="relative z-10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute right-8" />}
              </button>

              <div className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] font-mono">Yoksa</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <button type="button" onClick={() => signInWithGoogle()} className="w-full bg-black border border-white/10 text-white hover:border-white/40 py-4 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 rounded-none">
                <Chrome size={16} className="text-white/50" />
                Google Protokolü İle Gir
              </button>

            </form>

            <div className="text-center pt-8 border-t border-white/5">
              <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-white/40 hover:text-white text-[10px] font-bold tracking-[0.2em] uppercase transition-colors group">
                {isRegister ? 'Zaten listeye kayıtlı mısın? ' : 'Listede adın yok mu? '}
                <span className="text-fuchsia-400 group-hover:text-fuchsia-300 ml-2 border-b border-fuchsia-400/30 pb-0.5">{isRegister ? 'Sisteme Bağlan' : 'Kayıt Ol'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;
