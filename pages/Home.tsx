
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import { Event, User } from '../types';
import { Plus, MapPin, Calendar, Search, Zap, Coffee, Users as UsersIcon, X, TrendingUp, Brain, Trophy, Gamepad2, Sparkles, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';

interface HomeProps {
  user: User;
}

type SortOption = 'newest' | 'oldest' | 'popular';

const CATEGORIES = [
  { id: 'all', label: 'HEPSİ', icon: Sparkles },
  { id: 'party', label: 'ENERJİ', icon: Zap },
  { id: 'coffee', label: 'HUZUR', icon: Coffee },
  { id: 'social', label: 'SOSYAL', icon: UsersIcon },
  { id: 'study', label: 'ODAK', icon: Brain },
  { id: 'sport', label: 'HAREKET', icon: Trophy },
  { id: 'game', label: 'OYUN', icon: Gamepad2 },
];

interface EventWithParticipants extends Event {
  participantCount: number;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [events, setEvents] = useState<EventWithParticipants[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    image: '',
    category: 'party' as Event['category']
  });

  // Cache keys
  const EVENTS_CACHE_KEY = 'silius_events_cache';
  const EVENTS_CACHE_EXPIRY = 'silius_events_expiry';
  const CACHE_DURATION = 2 * 60 * 1000; // 2 dakika

  const loadEvents = async (useCache = true) => {
    // Önce cache'den yükle
    if (useCache) {
      try {
        const expiry = localStorage.getItem(EVENTS_CACHE_EXPIRY);
        const cached = localStorage.getItem(EVENTS_CACHE_KEY);
        if (cached && expiry && Date.now() < parseInt(expiry)) {
          const cachedEvents = JSON.parse(cached);
          setEvents(cachedEvents);
          setIsLoading(false);

          // Arka planda güncelle
          loadEvents(false);
          return;
        }
      } catch { }
    }

    setIsLoading(true);
    try {
      const eventsData = await db.getEvents();

      // Participant sayılarını paralel olarak al
      const countPromises = eventsData.map(e => db.getParticipantCount(e.id));
      const counts = await Promise.all(countPromises);

      const eventsWithCounts = eventsData.map((event, index) => ({
        ...event,
        participantCount: counts[index]
      }));

      setEvents(eventsWithCounts);

      // Cache'e kaydet
      try {
        localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(eventsWithCounts));
        localStorage.setItem(EVENTS_CACHE_EXPIRY, String(Date.now() + CACHE_DURATION));
      } catch { }
    } catch (error) {
      console.error('Events load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const defaultImages: Record<string, string> = {
        party: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format',
        coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format',
        social: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format',
        study: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format',
        sport: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format',
        game: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format',
        other: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format'
      };

      const savedEvent = await db.saveEvent({
        ...newEvent,
        user_id: user.id,
        image: newEvent.image || defaultImages[newEvent.category] || defaultImages.other
      });

      if (savedEvent) {
        console.log('✅ Event created:', savedEvent.id);
        // Oluşturan kişiyi otomatik katılımcı yap
        await db.joinEvent(savedEvent.id);
        await loadEvents();
        setShowCreateModal(false);
        setNewEvent({ title: '', description: '', location: '', date: '', image: '', category: 'party' });
      } else {
        console.error('🔴 Event creation failed - no data returned');
        alert('Etkinlik oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('🔴 Event create error:', error);
      alert('Hata: ' + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredAndSortedEvents = [...events]
    .filter(e => filter === 'all' || e.category === filter)
    .filter(e => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'popular') return b.participantCount - a.participantCount;
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const getCategoryInfo = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId) || CATEGORIES[1];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black font-outfit uppercase tracking-tighter italic">
              VIBE <span className="text-rose-500">AKIŞI</span>
            </h1>
            <p className="opacity-60 font-medium tracking-tight">Selam {user.firstName}! Topluluk bugün seninle.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-rose-500" size={18} />
              <input
                type="text"
                placeholder="Vibe ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 glass rounded-2xl pl-12 pr-6 py-3 text-sm outline-none font-medium transition-all focus:border-rose-500"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full md:w-auto px-6 py-3 bg-rose-500 text-white hover:bg-rose-600 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-rose-500/20 uppercase text-xs tracking-widest active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              YENİ VIBE OLUŞTUR
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide md:pb-0">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`px-6 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2 ${filter === cat.id
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/20 scale-105'
                    : 'glass text-slate-500 hover:text-rose-500 border-indigo-500/20'
                    }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 glass p-1.5 rounded-2xl shrink-0">
            <span className="hidden md:block text-[10px] font-black opacity-40 uppercase tracking-[0.2em] ml-3">Sırala:</span>
            <div className="flex gap-1">
              {[
                { id: 'newest', label: 'Yeni', icon: Calendar },
                { id: 'oldest', label: 'Eski', icon: Calendar },
                { id: 'popular', label: 'Popüler', icon: TrendingUp }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortOrder(opt.id as SortOption)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${sortOrder === opt.id
                    ? 'bg-rose-500/10 text-rose-500 shadow-sm border border-rose-500/30'
                    : 'text-slate-500 hover:text-rose-500'
                    }`}
                >
                  <opt.icon size={12} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAndSortedEvents.length === 0 ? (
            <div className="col-span-full py-32 text-center glass-card rounded-[3rem] border-dashed border-2">
              <Sparkles className="mx-auto mb-6 text-rose-500 opacity-50" size={48} />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Henüz vibe bulunamadı</h3>
              <p className="opacity-50 mt-2">İlk vibe'ı sen başlatmaya ne dersin?</p>
            </div>
          ) : (
            filteredAndSortedEvents.map((event, index) => {
              const catInfo = getCategoryInfo(event.category);
              const isRose = index % 2 === 1;
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className={`group glass-card rounded-[2.5rem] overflow-hidden flex flex-col ${isRose ? 'rose-frame' : 'border-indigo-500/10'} hover:translate-y-[-8px]`}
                >
                  <div className="h-64 relative overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 flex items-center gap-2 shadow-xl">
                      <catInfo.icon size={12} className={isRose ? 'text-rose-500' : 'text-indigo-600'} />
                      <span className="text-slate-900 dark:text-white">{catInfo.label}</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black font-outfit leading-tight mb-4 group-hover:text-rose-500 transition-colors uppercase tracking-tight">
                      {event.title}
                    </h3>
                    <p className="opacity-70 text-sm leading-relaxed mb-6 line-clamp-2 font-medium">{event.description}</p>
                    <div className="mt-auto pt-6 border-t border-slate-500/10 flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex items-center gap-3 opacity-60">
                        <MapPin size={14} className={isRose ? 'text-rose-500' : 'text-indigo-600'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3 opacity-60">
                        <Calendar size={14} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{event.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative w-full max-w-2xl glass-card rounded-[3rem] p-8 md:p-12 border-2 border-indigo-500/20 shadow-2xl overflow-y-auto scrollbar-hide max-h-[90vh]">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-3xl md:text-4xl font-black font-outfit tracking-tighter uppercase italic">
                YENİ BİR <span className="text-rose-500">VIBE</span> BAŞLAT
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-500/10 rounded-full opacity-50 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-8">
              {/* Resim Seçme Alanı */}
              <div className="space-y-4">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Kapak Fotoğrafı</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-48 md:h-64 rounded-[2.5rem] border-2 border-dashed border-indigo-500/20 hover:border-rose-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
                >
                  {newEvent.image ? (
                    <>
                      <img src={newEvent.image} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <ImageIcon size={48} className="text-rose-500" />
                      <span className="font-black text-[10px] uppercase tracking-widest">RESİM SEÇ VEYA SÜRÜKLE</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Vibe Adı *</label>
                  <input type="text" required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full glass rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:border-rose-500 outline-none" placeholder="Örn: Gece Koşusu" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Kategori *</label>
                  <select value={newEvent.category} onChange={e => setNewEvent({ ...newEvent, category: e.target.value as any })} className="w-full glass rounded-[1.5rem] px-6 py-4 text-sm font-bold appearance-none cursor-pointer focus:border-rose-500 outline-none">
                    <option value="party">⚡ Enerji</option>
                    <option value="coffee">☕ Huzur</option>
                    <option value="social">🤝 Sosyal</option>
                    <option value="study">🧠 Odak</option>
                    <option value="sport">🏆 Hareket</option>
                    <option value="game">🎮 Oyun</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Konum *</label>
                  <input type="text" required value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full glass rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:border-rose-500 outline-none" placeholder="Nerede buluşuyoruz?" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Tarih *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full glass rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:border-rose-500 outline-none"
                  />
                </div>
              </div>
              <textarea required rows={4} value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className="w-full glass rounded-[2rem] px-6 py-4 text-sm font-bold resize-none focus:border-rose-500 outline-none" placeholder="Bu vibe'ın ruhu nedir?" />
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-8 py-5 glass rounded-[1.5rem] font-black opacity-40 uppercase text-xs tracking-widest hover:opacity-100 transition-all">VAZGEÇ</button>
                <button type="submit" disabled={isCreating} className="flex-[2] px-8 py-5 bg-rose-500 text-white hover:bg-rose-600 rounded-[1.5rem] font-black shadow-xl shadow-rose-500/20 uppercase text-xs tracking-widest active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'VIBE\'I YAYINLA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
