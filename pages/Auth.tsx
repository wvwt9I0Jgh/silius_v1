
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, UserPlus, Fingerprint, AtSign, Home, Loader2 } from 'lucide-react';

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
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        // Validasyonlar
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
        if (formData.username.length < 3) {
          setError('Kullanıcı adı en az 3 karakter olmalıdır.');
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
          setError('');
          setIsRegister(false);
          setError('Kayıt başarılı! E-postanıza gelen onay linkine tıklayın, sonra giriş yapın.');
        }
      } else {
        console.log('🔑 Attempting sign in...');
        const { error: signInError } = await signIn(formData.email, formData.password);
        
        if (signInError) {
          console.error('❌ Sign in error:', signInError);
          setError('E-posta veya şifre hatalı.');
        } else {
          console.log('✅ Sign in successful! Auth state will auto-redirect...');
          // Navigate YAPMA - AuthContext auth state değişimi otomatik yönlendirecek
        }
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[var(--bg-deep)] relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 md:top-10 md:left-10 z-[60] flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-indigo-500/20 transition-all group backdrop-blur-xl"
      >
        <Home size={18} className="text-rose-500 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Geri Git</span>
      </button>

      <div className="w-full max-w-xl relative z-10">
        <div className="glass-card rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 border-2 border-indigo-500/20">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-rose-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/30">
               <Fingerprint size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-outfit mb-3 tracking-tighter uppercase leading-none">
              {isRegister ? 'YENİ HESAP' : 'SILIUS GİRİŞ'}
            </h2>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center ${error.includes('başarılı') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {error}
              </div>
            )}

            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">AD</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full glass rounded-2xl px-6 py-4 text-sm font-semibold focus:border-rose-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">SOYAD</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full glass rounded-2xl px-6 py-4 text-sm font-semibold focus:border-rose-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">KULLANICI ADI</label>
                  <div className="relative">
                    <AtSign className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30 text-rose-500" size={18} />
                    <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full glass rounded-2xl pl-16 pr-6 py-4 text-sm font-semibold focus:border-rose-500 outline-none" placeholder="viber_x" />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">E-POSTA</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30 text-rose-500" size={18} />
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full glass rounded-2xl pl-16 pr-6 py-4 text-sm font-semibold focus:border-rose-500 outline-none" placeholder="vibe@silius.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">ŞİFRE</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30 text-rose-500" size={18} />
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full glass rounded-2xl pl-16 pr-6 py-4 text-sm font-semibold focus:border-rose-500 outline-none" placeholder="••••••••" />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-4 p-6 glass rounded-2xl border border-indigo-500/20">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="kvkkConsent" 
                    checked={formData.kvkkConsent}
                    onChange={(e) => setFormData({ ...formData, kvkkConsent: e.target.checked })}
                    className="w-5 h-5 mt-1 accent-rose-500 cursor-pointer"
                  />
                  <label htmlFor="kvkkConsent" className="text-xs leading-relaxed opacity-70 cursor-pointer">
                    <span className="font-bold text-rose-500">KVKK Aydınlatma Metni:</span> Kişisel verilerinizin 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işleneceğini, verilerinizin platform üyeliği ve hizmet sunumu amacıyla kullanılacağını kabul ediyorum. Verileriniz güvenli bir şekilde saklanacak ve üçüncü kişilerle paylaşılmayacaktır. ve bu platformda yaptığınız her davranış kendi şahsınıza mutakıptır kesinlikle markamızla bi alakası yoktur kişisel güvenliğiniz için doğru şartlar altında sosyelleşin ve asla taciz, nefret söylemi, taciz vb girişimlerde bulunmayın.
                  </label>
                </div>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-rose-500 text-white hover:bg-rose-600 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-rose-500/20 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isRegister ? 'KAYIT OL' : 'GİRİŞ YAP'}
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <button onClick={() => setIsRegister(!isRegister)} className="mt-8 w-full text-center opacity-50 font-black text-[10px] hover:text-rose-500 transition-colors uppercase tracking-[0.2em]">
            {isRegister ? 'ZATEN HESABIN VAR MI? GİRİŞ YAP' : 'HESABIN YOK MU? KAYIT OL'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
