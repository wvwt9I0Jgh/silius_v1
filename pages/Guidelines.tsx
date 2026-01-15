
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Scale, ZapOff } from 'lucide-react';

const Guidelines: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] transition-colors duration-500 p-6 md:p-12 relative overflow-hidden text-[var(--text-main)]">
      <div className="absolute top-[20%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      
      <button 
        onClick={() => navigate(-1)}
        className="relative z-20 flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-indigo-500/20 transition-all group backdrop-blur-xl mb-16"
      >
        <ArrowLeft size={18} className="text-rose-500 group-hover:-translate-x-2 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">GERİ DÖN</span>
      </button>

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter italic mb-8">
          TOPLULUK <span className="text-rose-500">İLKELERİ</span>
        </h1>
        
        <div className="grid grid-cols-1 gap-6">
          {[
            { 
              title: "POZİTİF FREKANS", 
              desc: "Silius'ta her viber saygılı ve enerjik olmalıdır. Negatiflik siber filtrelere takılır.",
              icon: CheckCircle2,
              color: "text-rose-500"
            },
            { 
              title: "GÜVENLİ VIBE", 
              desc: "Etkinliklerde güvenliğiniz önceliğimizdir. Her zaman toplu alanları tercih edin.",
              icon: AlertTriangle,
              color: "text-indigo-600"
            }
          ].map((rule, i) => (
            <div key={i} className="glass-card p-8 md:p-10 rounded-[2.5rem] border-2 border-indigo-500/10 flex flex-col md:flex-row gap-8 items-center hover:rose-frame transition-all">
              <div className={`p-5 bg-rose-500/10 rounded-2xl ${rule.color}`}>
                <rule.icon size={36} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-sm mb-3">{rule.title}</h3>
                <p className="opacity-70 text-sm font-medium leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guidelines;
