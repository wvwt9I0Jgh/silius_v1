
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Send, Check, Home } from 'lucide-react';

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-main)] p-6 md:p-12 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-indigo-600/5 blur-[150px] rounded-full"></div>
      
      <button 
        onClick={() => navigate(-1)}
        className="relative z-20 flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-indigo-500/20 transition-all group backdrop-blur-xl mb-16"
      >
        <ArrowLeft size={18} className="text-rose-500 group-hover:-translate-x-2 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">GERİ DÖN</span>
      </button>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <h1 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter italic mb-8">
          BİZE <span className="text-rose-500">ULAŞIN</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left mt-16">
          <div className="space-y-12">
            <div>
              <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 opacity-50">DESTEK HATTI</h3>
              <div className="flex items-center gap-4 text-xl md:text-2xl font-black font-outfit">
                <Mail className="text-rose-500" />
                hello@silius.com
              </div>
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 opacity-50">TOPLULUK MERKEZİ</h3>
              <div className="flex items-center gap-4 text-xl md:text-2xl font-black font-outfit">
                <MessageSquare className="text-indigo-500" />
                @siliuscommunity
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 rounded-[3rem] border-2 border-indigo-500/10 space-y-6 rose-frame">
            <div className="space-y-2">
              <label className="text-[10px] font-black opacity-50 uppercase tracking-widest ml-1">İSMİNİZ</label>
              <input required type="text" className="w-full glass border border-indigo-500/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-rose-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black opacity-50 uppercase tracking-widest ml-1">MESAJINIZ</label>
              <textarea required rows={4} className="w-full glass border border-indigo-500/10 rounded-[2rem] px-6 py-4 text-sm font-bold outline-none focus:border-rose-500 resize-none"></textarea>
            </div>
            <button 
              type="submit"
              className={`w-full py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 ${sent ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-500/20'}`}
            >
              {sent ? (
                <>MESAJINIZ ALINDI <Check size={18} strokeWidth={3} /></>
              ) : (
                <>GÖNDER <Send size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
