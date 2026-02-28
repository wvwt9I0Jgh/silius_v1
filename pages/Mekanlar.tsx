import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../database';
import { Event } from '../types';
import { MapPin, Calendar, ArrowRight, Loader2, Sparkles, Sun, Moon, Home } from 'lucide-react';

const Mekanlar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    db.getEvents()
      .then(data => setEvents(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('silius_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('silius_theme', newMode ? 'dark' : 'light');
  };

  const categories: Record<string, string> = {
    party: 'indigo', social: 'rose', coffee: 'amber', study: 'emerald', sport: 'blue', game: 'purple'
  };

  return (
    <div className={`min-h-screen pt-32 px-6 pb-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Home Button */}
      <Link 
        to="/"
        className={`fixed top-6 left-6 md:top-8 md:left-12 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-slate-800/80 backdrop-blur-md border border-white/10' : 'bg-white/80 backdrop-blur-md border border-slate-200'}`}
      >
        <Home size={18} className="text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-widest">Ana Sayfa</span>
      </Link>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className={`fixed top-6 right-6 md:top-8 md:right-12 z-[200] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-90 group ${isDarkMode ? 'bg-slate-800/80 backdrop-blur-md border border-white/10' : 'bg-white/80 backdrop-blur-md border border-slate-200'}`}
      >
        {isDarkMode ? (
          <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon size={20} className="text-indigo-600 group-hover:-rotate-12 transition-transform" />
        )}
      </button>
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center text-center mb-24">
          <div className="mb-6 inline-flex p-3 bg-white/5 rounded-full">
             <MapPin className="text-indigo-500 animate-bounce" />
          </div>
          <h1 className="text-6xl md:text-9xl font-black font-outfit uppercase italic mb-8">
            Popüler <span className="text-indigo-500">Mekanlar</span>
          </h1>
          <p className="text-xl opacity-60 max-w-2xl">
            Şehrindeki en popüler buluşma noktaları, sessiz çalışma alanları ve eğlence merkezleri.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
          </div>
        ) : events.length === 0 ? (
          <div className={`rounded-[3rem] p-24 text-center ${isDarkMode ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-200'}`}>
             <Sparkles size={64} className="mx-auto mb-8 text-amber-500 opacity-50" />
             <h2 className={`text-4xl font-black font-outfit uppercase italic mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Henüz Vibe Yok</h2>
             <Link to="/auth" className="inline-block mt-8 px-8 py-3 bg-indigo-600 rounded-full font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors">
               İlk Vibe'ı Oluştur
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {events.map((event) => {
              const color = categories[event.category] || 'gray';
              return (
                <Link
                  key={event.id}
                  to="/auth"
                  className={`group block rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2 ${isDarkMode ? 'bg-slate-900 border border-white/5' : 'bg-white border border-slate-200'}`}
                >
                  <div className="h-72 overflow-hidden relative">
                    <img 
                      src={event.image || `https://source.unsplash.com/800x600/?${event.category}`} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-90"></div>
                    <div className={`absolute top-6 left-6 px-4 py-2 bg-${color}-500/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-${color}-200 border border-${color}-500/30`}>
                      {event.category}
                    </div>
                  </div>
                  
                  <div className="p-8 relative -mt-20 z-10">
                    <h3 className="text-3xl font-black font-outfit uppercase italic mb-4 leading-none group-hover:text-indigo-400 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 mb-8">
                       <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                          <MapPin size={16} className={`text-${color}-500`} />
                          {event.location}
                       </div>
                       <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                          <Calendar size={16} className={`text-${color}-500`} />
                          {new Date(event.date).toLocaleDateString('tr-TR')}
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                       <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">İncele</span>
                       <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                          <ArrowRight size={16} />
                       </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mekanlar;
