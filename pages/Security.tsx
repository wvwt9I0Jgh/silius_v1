
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, EyeOff } from 'lucide-react';

const Security: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] transition-colors duration-500 p-6 md:p-12 relative overflow-hidden text-[var(--text-main)]">
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/5 blur-[150px] rounded-full"></div>
      
      <button 
        onClick={() => navigate(-1)}
        className="relative z-20 flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-indigo-500/20 transition-all group backdrop-blur-xl mb-16"
      >
        <ArrowLeft size={18} className="text-rose-500 group-hover:-translate-x-2 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">GERİ DÖN</span>
      </button>

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter italic mb-8">
          VERİ <span className="text-rose-500">GÜVENLİĞİ</span>
        </h1>
        
        <div className="space-y-12">
          <div className="glass-card p-8 md:p-12 rounded-[3rem] border-2 border-indigo-500/10 rose-frame">
            <div className="flex items-center gap-4 mb-8">
              <ShieldCheck className="text-rose-500" size={32} />
              <h2 className="text-2xl font-black uppercase tracking-tighter">SILUS KORUMASI</h2>
            </div>
            <div className="space-y-6 opacity-70 font-medium">
              <p>Verileriniz, fütüristik şifreleme yöntemleriyle sadece yerel cihazınızda ve güvenli maskelenmiş oturumlarda saklanır.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="p-6 glass rounded-2xl border border-indigo-500/10">
                  <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest mb-3">
                    <Lock size={14} className="text-rose-500" /> ŞİFRELEME
                  </div>
                  <p className="text-xs">Uçtan uca maskeleme protokolü ile şifreleriniz asla düz metin olarak barındırılmaz.</p>
                </div>
                <div className="p-6 glass rounded-2xl border border-indigo-500/10">
                  <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest mb-3">
                    <EyeOff size={14} className="text-rose-500" /> GİZLİLİK
                  </div>
                  <p className="text-xs">Kullanıcı profilleri sadece bağlı olduğunuz viberlar tarafından görüntülenebilir.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
