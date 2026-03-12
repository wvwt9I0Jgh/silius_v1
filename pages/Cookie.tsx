import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cookie as CookieIcon, ShieldCheck, Eye, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CookiePolicy: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] transition-colors duration-500 p-6 md:p-12 relative overflow-hidden text-text-main pb-32">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 blur-[150px] rounded-full"></div>
      
      <div className="flex justify-between items-center mb-12 relative z-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-orange-500/20 transition-all group backdrop-blur-xl hover:bg-orange-500/10"
        >
          <ArrowLeft size={18} className="text-orange-500 group-hover:-translate-x-2 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main">GERİ DÖN</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
            <CookieIcon size={48} className="text-orange-500" />
            <h1 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter">
            ÇEREZ <span className="text-orange-500">POLİTİKASI</span>
            </h1>
        </div>
        
        <div className="space-y-8 text-lg font-medium leading-relaxed opacity-90">
          <p>
            Silius olarak ziyaretçilerimizin gizliliğine ve güvenliğine önem veriyoruz. Bu Çerez Politikası, silius.app ve uygulamaları üzerinden hangi verilerin toplandığını ve bu bilgilerin nasıl kullanıldığını detaylandırmaktadır.
          </p>

          <div className="glass-card p-8 rounded-[2rem] border border-orange-500/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3"><Eye className="text-orange-400"/> 1. Çerez (Cookie) Nedir?</h2>
            <p className="text-sm text-text-muted">
              Çerezler, ziyaret ettiğiniz web siteleri tarafından bilgisayarınıza veya mobil cihazınıza tarayıcınız aracılığıyla kaydedilen küçük metin dosyalarıdır. Çerezler, bir sitenin daha verimli çalışmasını sağlamak, kullanıcı deneyimini özelleştirmek ve site sahiplerine platform hakkında analitik bilgi sunmak için kullanılır.
            </p>
          </div>

          <div className="glass-card p-8 rounded-[2rem] border border-orange-500/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3"><Layers className="text-orange-400"/> 2. Hangi Çerezleri Kullanıyoruz?</h2>
            <ul className="list-disc pl-5 space-y-3 text-sm text-text-muted">
              <li><strong className="text-text-main">Zorunlu Çerezler:</strong> Platformumuzun çalışması için temel işlevleri yerine getiren çerezlerdir (Oturum yönetimi, güvenlik doğrulamaları vb.). Bunlar olmadan Silius düzgün çalışmaz.</li>
              <li><strong className="text-text-main">Performans ve Analiz Çerezleri:</strong> Ziyaretçilerin platformu nasıl kullandığını anlamamızı sağlar. Hangi sayfaların daha çok ziyaret edildiğini analiz ederek performansı artırırız.</li>
              <li><strong className="text-text-main">İşlevsellik Çerezleri:</strong> Dil tercihleriniz, tema seçimi (aydınlık/karanlık mod) gibi tercihlerinizi hatırlamamızı sağlar.</li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-[2rem] border border-orange-500/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3"><ShieldCheck className="text-orange-400"/> 3. Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
            <p className="text-sm text-text-muted">
              Çoğu web tarayıcısı çerezleri otomatik olarak kabul edecek şekilde yapılandırılmıştır. Tarayıcınızın ayarlarını değiştirerek çerezleri reddedebilir veya bir çerez gönderildiğinde uyarı verecek şekilde ayarlayabilirsiniz. Ancak çerezleri devre dışı bırakmanın platformumuzun bazı işlevlerini (örneğin otomatik giriş, karanlık mod tercihi vb.) çalışmaz hale getirebileceğini unutmayın.
            </p>
          </div>

          <p className="text-sm opacity-60 italic mt-12 text-center">
            Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')} <br/>
            Bu politika periyodik olarak güncellenebilir. Değişiklikler yayınlandığı andan itibaren geçerli olur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;