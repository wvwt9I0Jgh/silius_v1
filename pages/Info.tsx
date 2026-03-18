import React, { useState } from 'react';
import { MessageCircle, Send, Sparkles, Code, Globe, ShieldCheck } from 'lucide-react';

const INFO_NAME = 'Özgün Deniz Karan';
const WHATSAPP_NUMBER = '905394493990';

const Info: React.FC = () => {
  const [message, setMessage] = useState('Merhaba, proje hakkında bilgi almak istiyorum.');

  const openWhatsApp = () => {
    const encoded = encodeURIComponent(message || 'Merhaba, proje hakkında bilgi almak istiyorum.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen px-4 pb-24 pt-24 md:py-28 bg-[#05030A] text-text-main relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-fuchsia-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-[-20%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-black uppercase tracking-[0.25em] mb-8 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
            <Sparkles size={16} />
            Hakkımızda
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-100 to-white/60 mb-6 drop-shadow-sm">
            Silius Community
          </h1>
          <p className="text-lg md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed font-medium">
            Gece hayatını ve topluluk deneyimini <span className="text-fuchsia-400 font-bold drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]">daha güvenli</span>, 
            <span className="text-cyan-400 font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"> daha organik</span> ve etkileşimli hale getirmek için yeni nesil bir yaklaşım.
          </p>
        </div>

        {/* Features / Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-fade-in-up delay-100">
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-8 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/30 group-hover:scale-110 transition-transform">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider mb-3 text-white/90">Güvenli Deneyim</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Katılımcıların QR ile giriş yaptığı, kontrol edilebilir ve yüksek güvenlik standartlarına sahip kapalı topluluk altyapısı.
            </p>
          </div>
          
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-8 hover:bg-white/[0.04] hover:border-fuchsia-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-6 border border-fuchsia-500/30 group-hover:scale-110 transition-transform">
              <Globe size={28} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider mb-3 text-white/90">Organik Bağlar</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Aynı frekansta olan insanları algoritma kalabalığında kaybetmeden, fiziksel dünyanın merkezinde bir araya getiriyoruz.
            </p>
          </div>
          
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-8 hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Code size={28} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider mb-3 text-white/90">Modern Altyapı</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Vip pass, öncelikli rezervasyon, anlık bildirimler ve yeni nesil web teknolojileri ile kesintisiz platform performansı.
            </p>
          </div>
        </div>

        {/* Creator & Contact Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up delay-200">
          
          {/* Creator Profile - 2 cols width */}
          <div className="lg:col-span-2 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent p-10 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-400/80 mb-5 pl-1">Kurucu & Geliştirici</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6 leading-none">
                {INFO_NAME}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                Tasarım ve yazılım süreçlerinden, topluluk yönetimine kadar platformun her noktasında doğrudan bizimle iletişime geçebilirsiniz. Her türlü geri bildirim platformun ruhunu şekillendirir.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-white/30 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online & Etkileşime Açık
              </div>
            </div>
          </div>

          {/* Contact Form Box - 3 cols width */}
          <div className="lg:col-span-3 rounded-[2.5rem] border border-cyan-500/20 bg-gradient-to-b from-cyan-500/[0.08] to-transparent p-8 md:p-12 relative shadow-[0_0_50px_rgba(6,182,212,0.05)] backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-black uppercase tracking-[0.1em] flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <MessageCircle size={20} className="text-cyan-400" />
                </div>
                Doğrudan İletişim
              </h2>
            </div>

            <div className="space-y-5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="relative w-full rounded-2xl border border-white/10 bg-black/60 px-6 py-5 outline-none focus:border-cyan-400/50 text-white/90 resize-none transition-all placeholder:text-white/20"
                  placeholder="Mesajınızı yazın..."
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={openWhatsApp}
                  className="w-full sm:w-auto relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-white font-black uppercase tracking-[0.15em] text-sm shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 group/btn"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out" />
                  <Send size={18} className="relative z-10" />
                  <span className="relative z-10">WhatsApp'tan Ulaş</span>
                </button>
                <span className="text-xs text-white/40 font-medium tracking-wide">
                  Mesajlar doğrudan kurucu hattına iletilir.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Info;