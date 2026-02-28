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
        if (!formData.kvkkConsent) {
          setError('KVKK metnini okuyup onaylamalısınız.');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Şifre en az 6 karakter olmalıdır.');
          setIsLoading(false);
          return;
        }

        const { error: signUpError } = await signUp(formData.email, formData.password, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
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
          setError('Kayıt başarılı! E-posta kutunuzu kontrol edin.');
          setTimeout(() => setIsRegister(false), 2000);
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
    <div className={`min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-bg-deep transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-900/30 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-900/20 blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-violet-900/10 blur-[80px] animate-floating"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-[1200px] h-[90vh] md:h-[800px] grid md:grid-cols-2 relative z-10 p-4 md:p-8">

        {/* Left Panel - Visual/Brand */}
        <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden rounded-[2.5rem] bg-bg-surface glass-morphism border border-white/5 order-2 md:order-1">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-0"></div>

          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>

          <div className="relative z-10 transform transition-all duration-700 hover:translate-x-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-rose-500/20 mb-8 border border-white/10">
              <Sparkles className="text-white w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-6xl font-black text-text-main font-outfit leading-[0.9] tracking-tighter mb-6">
              TOPLULUĞUN<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">YENİ NESİL</span><br />
              GÜCÜ.
            </h1>
            <p className="text-text-muted text-lg max-w-sm font-medium leading-relaxed">
              Silius ile keşfet, bağlan ve etkileşime geç. Gerçek zamanlı sosyalleşmenin dijital hali.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 mt-12">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-12 h-12 rounded-full border-2 border-bg-deep bg-slate-800 bg-cover`} style={{ backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123})` }}></div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-bg-deep bg-bg-surface flex items-center justify-center text-xs font-bold text-text-main">
                +2k
              </div>
            </div>
            <div className="text-sm font-bold text-slate-400">
              <span className="text-text-main">2,450+</span> Aktif Üye
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="relative flex flex-col justify-center p-6 md:p-16 order-1 md:order-2">

          <button
            onClick={() => navigate('/')}
            className="absolute top-0 right-4 md:right-12 flex items-center gap-2 text-xs font-bold tracking-widest text-text-muted hover:text-text-main transition-colors uppercase group"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Ana Sayfaya Dön
          </button>

          <div className="max-w-md w-full mx-auto space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-text-main font-outfit tracking-tighter">
                {isRegister ? 'ARAMIZA KATIL' : 'TEKRAR HOŞGELDİN'}
              </h2>
              <p className="text-text-muted text-sm font-medium">
                {isRegister ? 'Hemen ücretsiz hesabını oluştur ve topluluğa katıl.' : 'Hesabına erişmek için bilgilerinle giriş yap.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">

              {isRegister && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="group relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
                    <input type="text" name="firstName" placeholder="Ad" required={isRegister} value={formData.firstName} onChange={handleChange}
                      className="w-full bg-bg-deep/50 border border-text-main/10 rounded-2xl pl-12 pr-4 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all text-sm font-bold font-outfit"
                    />
                  </div>
                  <div className="group relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
                    <input type="text" name="lastName" placeholder="Soyad" required={isRegister} value={formData.lastName} onChange={handleChange}
                      className="w-full bg-bg-deep/50 border border-text-main/10 rounded-2xl pl-12 pr-4 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all text-sm font-bold font-outfit"
                    />
                  </div>
                </div>
              )}

              {isRegister && (
                <div className="group relative animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
                  <input type="text" name="username" placeholder="Kullanıcı Adı" required={isRegister} value={formData.username} onChange={handleChange}
                    className="w-full bg-bg-deep/50 border border-text-main/10 rounded-2xl pl-12 pr-4 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all text-sm font-bold font-outfit"
                  />
                </div>
              )}

              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input type="email" name="email" placeholder="E-posta Adresi" required value={formData.email} onChange={handleChange}
                  className="w-full bg-bg-deep/50 border border-text-main/10 rounded-2xl pl-12 pr-4 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all text-sm font-bold font-outfit"
                />
              </div>

              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input type="password" name="password" placeholder="Şifre" required value={formData.password} onChange={handleChange}
                  className="w-full bg-bg-deep/50 border border-text-main/10 rounded-2xl pl-12 pr-4 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all text-sm font-bold font-outfit"
                />
              </div>

              {isRegister && (
                <label className="flex items-start gap-3 cursor-pointer group animate-in fade-in slide-in-from-bottom-6 duration-500 delay-150">
                  <div className="relative">
                    <input type="checkbox" checked={formData.kvkkConsent} onChange={(e) => setFormData({ ...formData, kvkkConsent: e.target.checked })} className="peer sr-only" />
                    <div className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all flex items-center justify-center">
                      {formData.kvkkConsent && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors leading-tight">
                    <span className="text-rose-500 font-bold">KVKK & Gizlilik</span> şartlarını okudum, anladım ve kişisel verilerimin işlenmesini onaylıyorum. Silius topluluk kurallarına uyacağımı taahhüt ediyorum.
                  </span>
                </label>
              )}

              {error && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${error.includes('başarılı') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {error.includes('başarılı') ? <Sparkles size={16} /> : <Fingerprint size={16} />}
                  {error}
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:to-rose-400 text-white rounded-2xl py-4 font-black text-sm tracking-uppercase shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                {isLoading ? 'İşleniyor...' : (isRegister ? 'Hesap Oluştur' : 'Giriş Yap')}
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-bg-deep px-2 text-text-muted font-bold tracking-widest">veya</span></div>
              </div>

              <button type="button" onClick={() => signInWithGoogle()} className="w-full bg-text-main text-bg-deep hover:opacity-90 rounded-2xl py-4 font-black text-sm tracking-uppercase shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                <Chrome size={18} className="text-rose-600" />
                Google İle Devam Et
              </button>

            </form>

            <div className="text-center">
              <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-text-muted hover:text-text-main text-xs font-bold tracking-widest uppercase transition-colors">
                {isRegister ? 'Zaten hesabın var mı? ' : 'Hesabın yok mu? '}
                <span className="text-rose-500 hover:underline decoration-2 underline-offset-4">{isRegister ? 'Giriş Yap' : 'Kayıt Ol'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;
