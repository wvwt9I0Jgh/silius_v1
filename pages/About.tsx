
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Heart, Sun, Moon, Users, ShieldCheck, Radio } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const About: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] transition-colors duration-500 p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[150px] rounded-full"></div>
      
      <div className="flex justify-between items-center mb-16 relative z-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-indigo-500/20 transition-all group backdrop-blur-xl"
        >
          <ArrowLeft size={18} className="text-rose-500 group-hover:-translate-x-2 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main">GERİ DÖN</span>
        </button>

        <button onClick={toggleTheme} className="p-3 rounded-full hover:bg-text-main/10 text-text-main/50 hover:text-text-main transition-colors">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter italic mb-6">
          SILIUS <span className="text-rose-500">NEDİR?</span>
        </h1>

        <p className="max-w-3xl text-base md:text-xl opacity-80 leading-relaxed mb-12">
          Silius, insanları sadece dijitalde tutmak yerine güvenli ve gerçek ortamlarda bir araya getirmek için tasarlanmış topluluk odaklı bir etkinlik platformudur.
          Burada amaç sadece etkinlik listelemek değil; doğru insanı doğru vibe ile buluşturmak, katılımı şeffaflaştırmak ve etkinlik deneyimini baştan sona kolaylaştırmaktır.
        </p>
        
        <div className="space-y-10 opacity-90 text-base md:text-lg font-medium leading-relaxed">
          <section className="glass-card rounded-[2rem] border border-indigo-500/10 p-6 md:p-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-4">Nasıl Çalışır?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2">1. Keşfet</p>
                <p className="text-sm opacity-80">Şehrindeki etkinlikleri kategorilere göre tararsın ve topluluğun ritmini görürsün.</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">2. Katıl</p>
                <p className="text-sm opacity-80">Tek dokunuşla katılırsın, detayları takip eder ve etkinliğe hazırlığını tamamlarsın.</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">3. Canlı Ol</p>
                <p className="text-sm opacity-80">Check-in ile canlıya geçer, o an içeride kaç kişi olduğunu gerçek zamanlı görürsün.</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="glass-card p-8 rounded-[2.5rem] border-2 border-indigo-500/10 hover:rose-frame transition-all">
              <Zap className="text-rose-500 mb-6" size={40} />
              <h3 className="font-black uppercase tracking-widest text-sm mb-4">MİSYONUMUZ</h3>
              <p className="text-sm">
                Her kullanıcının saniyeler içinde kendine uygun bir vibe bulabileceği, güvenli ve canlı bir topluluk deneyimi oluşturmak.
                Etkinlik oluşturmayı, katılmayı ve etkileşimi teknik olarak sadeleştirirken sosyal olarak güçlendirmek.
              </p>
            </div>
            <div className="glass-card p-8 rounded-[2.5rem] border-2 border-indigo-500/10 hover:rose-frame transition-all">
              <Heart className="text-indigo-600 mb-6" size={40} />
              <h3 className="font-black uppercase tracking-widest text-sm mb-4">VİZYONUMUZ</h3>
              <p className="text-sm">
                İnsanların sadece ekranlarda değil, gerçek hayatta da güçlü bağlar kurduğu; şehir kültürünü canlı, erişilebilir ve sürdürülebilir hale getiren bir ekosistem olmak.
              </p>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card rounded-[2rem] border border-indigo-500/10 p-6">
              <Users className="text-rose-500 mb-4" size={24} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2">Topluluk</h3>
              <p className="text-sm opacity-80">Katılım sayıları ve canlı durumları görünür olduğu için kullanıcı deneyimi daha şeffaf ilerler.</p>
            </div>
            <div className="glass-card rounded-[2rem] border border-indigo-500/10 p-6">
              <ShieldCheck className="text-emerald-500 mb-4" size={24} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2">Güven</h3>
              <p className="text-sm opacity-80">Profil, katılım ve etkinlik akışı kontrollü bir yapıda çalışır; topluluk kuralları öne çıkar.</p>
            </div>
            <div className="glass-card rounded-[2rem] border border-indigo-500/10 p-6">
              <Radio className="text-indigo-500 mb-4" size={24} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2">Canlılık</h3>
              <p className="text-sm opacity-80">Canlı check-in sistemi, etkinliğin gerçek zamanlı nabzını gösterir ve katılımı dinamikleştirir.</p>
            </div>
          </section>

          <section className="glass-card rounded-[2rem] border border-rose-500/20 p-6 md:p-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-rose-500 mb-3">Neden Silius?</h2>
            <p className="text-sm md:text-base opacity-80">
              Çünkü Silius, etkinlik deneyimini sadece "duyuru" seviyesinde bırakmaz. Öncesinde keşif, sırasında canlı görünürlük,
              sonrasında ise topluluk etkileşimi sunarak uçtan uca bir deneyim sağlar.
              Bu sayede hem etkinlik sahipleri hem katılımcılar için daha net, daha güvenli ve daha kaliteli bir sosyal akış oluşur.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
