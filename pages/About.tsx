
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Zap, Heart, Home, Sun, Moon } from 'lucide-react';
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
        <h1 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter italic mb-8">
          SILUS <span className="text-rose-500">NEDİR?</span>
        </h1>
        
        <div className="space-y-12 opacity-80 text-lg md:text-xl font-medium leading-relaxed">
          <p>
            Silus, sadece bir etkinlik platformu değil, bir <span className="text-rose-500 font-bold italic">toplumsal enerji</span> birleşimidir. 
            Dijital dünyanın getirdiği yalnızlığı, fiziksel dünyanın gerçekliğiyle harmanlamak için tasarlandı.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="glass-card p-8 rounded-[2.5rem] border-2 border-indigo-500/10 hover:rose-frame transition-all">
              <Zap className="text-rose-500 mb-6" size={40} />
              <h3 className="font-black uppercase tracking-widest text-sm mb-4">MİSYONUMUZ</h3>
              <p className="text-sm">Canı sıkılan herkesin saniyeler içinde kendine uygun bir "Vibe" bulabileceği dinamik bir topluluk.</p>
            </div>
            <div className="glass-card p-8 rounded-[2.5rem] border-2 border-indigo-500/10 hover:rose-frame transition-all">
              <Heart className="text-indigo-600 mb-6" size={40} />
              <h3 className="font-black uppercase tracking-widest text-sm mb-4">VİZYONUMUZ</h3>
              <p className="text-sm">İnsanların birbirleriyle sadece ekranlarda değil, gerçek hayatta ve en fütüristik ortamlarda bağ kurması.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
