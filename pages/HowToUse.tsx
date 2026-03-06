import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ArrowDownRight, Fingerprint, Zap, Radar, QrCode } from 'lucide-react';

const HowToUse: React.FC = () => {
  const { user } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#03000a] text-white selection:bg-cyan-400 selection:text-black overflow-hidden font-sans">
      
      {/* Gritty Noise Overlay */}
      <div className="fixed inset-0 opacity-[0.06] pointer-events-none mix-blend-screen z-[100]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Dynamic Cursor Light */}
      <div 
        className="fixed w-[600px] h-[600px] rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0 opacity-30 bg-fuchsia-600/20"
        style={{
          left: mousePos.x - 300,
          top: mousePos.y - 300,
          transition: 'calc(0.1s) linear',
        }}
      />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between p-6">
        <Link to="/" className="group flex items-center gap-3 text-white uppercase font-black text-xs tracking-[0.3em] hover:text-cyan-400 transition-colors">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sisteme Dön</span>
        </Link>
        <div className="text-white/30 font-mono text-[10px] tracking-widest uppercase">
          SİLİUS_PROTOKOL_// v1.0.0
        </div>
      </nav>

      {/* Marquee Banner */}
      <div className="relative z-10 w-full overflow-hidden bg-fuchsia-500 py-3 rotate-[-1deg] scale-105 shadow-[0_0_40px_rgba(217,70,239,0.3)]">
        <div className="flex w-max animate-marquee font-black font-outfit uppercase tracking-tighter text-black text-2xl whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="mx-4">SİSTEM NASIL KULLANILIR</span>
              <span className="mx-4 opacity-30">///</span>
              <span className="mx-4">NO FAKE VIBES</span>
              <span className="mx-4 opacity-30">///</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-20">
        
        {/* Header Section */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-black font-outfit uppercase leading-[0.8] tracking-tighter mix-blend-difference mb-6">
              VİBE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                MANİFESTOSU.
              </span>
            </h1>
          </div>
          <div className="lg:col-span-4 pb-4">
            <div className="border-l-2 border-fuchsia-500 pl-6 space-y-4">
              <Fingerprint className="text-fuchsia-500 rotate-90" size={32} />
              <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed">
                Silius sıradan bir bilet satış platformu değil. Gerçek bağlantılar kurman ve anı yaşaman için tasarlandı. <strong>Algoritmaları unut, sokağa çık.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Info Grid - Diagonal & Asymmetric */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Silius Nedir? */}
          <div className="space-y-6 group hover-trigger">
            <h2 className="text-[10rem] font-black font-outfit text-white/[0.03] leading-none absolute -z-10 -ml-12 -mt-16 group-hover:text-cyan-400/[0.05] transition-colors duration-700">01</h2>
            <div className="flex items-center gap-4">
              <span className="bg-white text-black px-3 py-1 font-black uppercase text-xs tracking-widest">Soru 01</span>
              <div className="h-[1px] flex-1 bg-white/20 group-hover:bg-cyan-400/50 transition-colors" />
            </div>
            <h3 className="text-4xl font-outfit font-black uppercase tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              Bu Ne Baş Ağrısı?
            </h3>
            <p className="text-white/60 leading-relaxed text-lg pb-4">
              Muğla'daki gerçek etkinlikleri, gizli partileri ve local mekanları aynı frekansta atan insanlarla birleştiren spesifik bir radar. Boş kaydırma (scrolling) döngülerinden çıkıp gerçek ana odaklanan bir ekosistem.
            </p>
          </div>

          {/* Neden Kullanmalısın? */}
          <div className="space-y-6 md:mt-24 group hover-trigger">
            <h2 className="text-[10rem] font-black font-outfit text-white/[0.03] leading-none absolute -z-10 -ml-12 -mt-16 group-hover:text-fuchsia-500/[0.05] transition-colors duration-700">02</h2>
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/20 group-hover:bg-fuchsia-500/50 transition-colors" />
              <span className="bg-[#03000a] border border-white/20 text-white px-3 py-1 font-black uppercase text-xs tracking-widest group-hover:border-fuchsia-500 transition-colors">Neden Kullanılır?</span>
            </div>
            <h3 className="text-4xl font-outfit font-black uppercase tracking-tight text-white group-hover:text-fuchsia-500 transition-colors md:text-right">
              Çünkü Ritmi <br/>Kırmak İstersin.
            </h3>
            <p className="text-white/60 leading-relaxed text-lg pb-4 md:text-right">
              Bilet sıraları yok, onaylamalarla ilgili bekleyiş yok. Günlük sınırlı limitin (3 etkinlik) var. Çünkü burası <em>herkese açık bir çöplük değil,</em> gerçekten orada olmak isteyenlerin mekanı.
            </p>
          </div>
        </div>

        {/* HOW TO SECTION */}
        <section className="mt-40 relative">
          {/* Accent Line */}
          <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-[1px] bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent opacity-30" />
          
          <div className="text-center mb-20 relative">
            <span className="absolute left-1/2 -top-12 -translate-x-1/2 text-[8rem] font-black font-outfit text-white/[0.02] tracking-tighter whitespace-nowrap mix-blend-overlay">PROTOKOL</span>
            <h2 className="text-5xl md:text-6xl font-black font-outfit uppercase tracking-tighter inline-block relative border-b-4 border-cyan-400 pb-2">
              Nasıl İşler?
            </h2>
          </div>

          <div className="space-y-16 max-w-4xl mx-auto">
            
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:even:flex-row-reverse group">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 z-10 text-white text-xl font-black group-hover:bg-cyan-400 group-hover:text-black group-hover:scale-110 transition-all shadow-[0_0_0_0_rgba(34,211,238,0)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                1
              </div>
              <div className="flex-1 bg-white/[0.02] border border-white/5 p-8 hover:bg-white/[0.04] transition-colors rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-40 transition-opacity">
                  <Radar size={100} />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-widest text-cyan-400 mb-3">Radara Gir</h4>
                <p className="text-white/60 text-lg leading-relaxed relative z-10">
                  Sisteme kayıt ol ve bugünün "Vibeler" haritasını incele. Etkinlikleri harita veya liste üzerinden keşfet. Her şey canlıdır.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:flex-row-reverse group">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 z-10 text-white text-xl font-black group-hover:bg-fuchsia-500 group-hover:text-white group-hover:scale-110 transition-all shadow-[0_0_0_0_rgba(217,70,239,0)] group-hover:shadow-[0_0_30px_rgba(217,70,239,0.4)]">
                2
              </div>
              <div className="flex-1 bg-white/[0.02] border border-white/5 p-8 hover:bg-white/[0.04] transition-colors rounded-3xl relative overflow-hidden md:text-right">
                <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-40 transition-opacity rotate-12">
                  <QrCode size={100} />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-widest text-fuchsia-500 mb-3">Tek Tık, QR Kod</h4>
                <p className="text-white/60 text-lg leading-relaxed relative z-10">
                  Etkinliğe "Katıl" dediğin an kişisel bir QR kod üretilir. Günlük 3 limitini unutma, gerçekten gideceğin yere katıl. Kapıda telefonu göster ve içeri dal.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-center group">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 z-10 text-white text-xl font-black group-hover:bg-yellow-400 group-hover:text-black group-hover:scale-110 transition-all shadow-[0_0_0_0_rgba(250,204,21,0)] group-hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                3
              </div>
              <div className="flex-1 bg-white/[0.02] border border-white/5 p-8 hover:bg-white/[0.04] transition-colors rounded-3xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-40 transition-opacity">
                  <Zap size={100} />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-widest text-yellow-400 mb-3">Vibe'ı Büyüt</h4>
                <p className="text-white/60 text-lg leading-relaxed relative z-10">
                  Sadece parti değil; kafeler, publar, atölyeler... Mekana gidince Check-in yapıp Vibe Score kazan. Profilini yükselt, arkadaşlarınla topluluğa hükmet.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* CTA BÖLÜMÜ */}
        <section className="mt-40 mb-20 text-center relative z-20">
           <Link to={user ? "/vibeler" : "/auth"} className="relative inline-flex items-center justify-center group">
             <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-fuchsia-500 bg-[length:200%_auto] blur-2xl opacity-60 group-hover:opacity-100 animate-gradient-x transition-opacity duration-500" />
             <div className="relative flex items-center gap-4 px-12 py-6 bg-white text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 w-full sm:w-auto overflow-hidden">
               <span className="relative z-10 flex items-center gap-3">
                 SİSTEME GİRİŞ YAP <ArrowDownRight size={24} className="group-hover:rotate-[-45deg] transition-transform" />
               </span>
               <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-0" />
             </div>
          </Link>
        </section>

      </main>

      {/* Global & Scoped Styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default HowToUse;