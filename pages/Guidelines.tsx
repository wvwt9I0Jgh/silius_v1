import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Scale, ZapOff, ShieldAlert, HeartHandshake } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Guidelines: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] transition-colors duration-500 p-6 md:p-12 relative overflow-hidden text-[var(--text-main)] pb-32">
      <div className="absolute top-[20%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>

      <button
        onClick={() => navigate(-1)}
        className="relative z-20 flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-indigo-500/20 transition-all group backdrop-blur-xl mb-16"
      >
        <ArrowLeft size={18} className="text-rose-500 group-hover:-translate-x-2 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main">GERİ DÖN</span>
      </button>

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter italic mb-4">
          TOPLULUK <span className="text-rose-500">İLKELERİ</span>
        </h1>
        <p className="text-lg opacity-70 font-medium mb-12 max-w-2xl">
          Silius sadece bir uygulama değil, bir saygı ve enerji ağıdır. Gecenin ritmini bozmamak ve herkes için güvenli bir Vibe alanı yaratmak için bu kurallara uymak zorunludur.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {[
            {
              title: "1. POZİTİF FREKANS",
              desc: "Silius'ta her viber saygılı ve enerjik olmalıdır. Nefret söylemi, ayrımcılık, ırkçılık, cinsiyetçilik veya herhangi bir gruptan / kişiden nefret edilmesini teşvik eden davranışlara asla tolerans gösterilmez. Negatiflik siber filtrelere takılır ve platformdan kalıcı uzaklaştırılmaya neden olur.",
              icon: CheckCircle2,
              color: "text-rose-500"
            },
            {
              title: "2. KİŞİSEL SINIRLAR VE RIZA",
              desc: "Başkalarının fiziksel ve duygusal sınırlarına her zaman saygı gösterin. 'Hayır'ın anlamı her zaman 'Hayır'dır. Bir etkinlikte veya online sohbetlerde istenmeyen ilgi göstermek taciz olarak değerlendirilir.",
              icon: HeartHandshake,
              color: "text-fuchsia-500"
            },
            {
              title: "3. GÜVENLİ VIBE",
              desc: "Etkinliklerde güvenliğiniz önceliğimizdir. Her zaman toplu alanları tercih edin. Eğer bir etkinlikte kendinizi güvensiz hissederseniz, organizatörle veya doğrudan bizimle iletişime geçmekten çekinmeyin. Sahte etkinlik oluşturan kullanıcılar yasal olarak sorumlu tutulacaktır.",
              icon: AlertTriangle,
              color: "text-amber-500"
            },
            {
              title: "4. SPAM VE SAHTE PROFİLLER",
              desc: "Kendiniz olun. Başkalarını taklit etmek, onlara ait fotoğrafları izinsiz olarak profil fotoğrafı veya mekan fotoğrafı olarak kullanmak, platformumuzu sadece reklam ve ticari spam amacıyla kullanmak yasaktır.",
              icon: ShieldAlert,
              color: "text-indigo-600"
            },
            {
              title: "5. BİLDİRİM VE MODERASYON",
              desc: "Silius topluluğunu hep birlikte koruyoruz. Kuralları ihlal eden kişileri (ban veya şikayet sistemi üzerinden) bize bildirin. Ekibimiz bu şikayetleri dikkatle inceliyor ve gerekli durumlarda yasal adımlara başvurabiliyor.",
              icon: Scale,
              color: "text-cyan-500"
            }
          ].map((rule, i) => (
            <div key={i} className="glass-card p-8 md:p-10 rounded-[2.5rem] border-2 border-indigo-500/10 flex flex-col md:flex-row gap-8 items-start hover:rose-frame transition-all bg-white/5">
              <div className={`p-5 bg-black/20 rounded-2xl ${rule.color}`} style={{ color: rule.color.replace('text-', '') }}>
                <rule.icon size={36} className={rule.color} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-lg mb-3">{rule.title}</h3>
                <p className="opacity-80 text-sm font-medium leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 p-8 border border-rose-500/30 rounded-[2rem] bg-rose-500/5 text-center">
            <ZapOff className="text-rose-500 mx-auto mb-4" size={32} />
            <h4 className="text-xl font-black uppercase tracking-wider mb-2">İhlal Durumu</h4>
            <p className="opacity-70 text-sm">Kurallara uymayan kullanıcılar uyarısız şekilde Silius platformundan uzaklaştırılabilir. Platformumuzu güvende tutmak için sert aksiyonlar almaktan çekinmiyoruz.</p>
        </div>

      </div>
    </div>
  );
};

export default Guidelines;
