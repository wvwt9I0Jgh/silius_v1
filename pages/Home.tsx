import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../database';
import { Event, User } from '../types';
import { Plus, MapPin, Calendar, Search, Zap, X, TrendingUp, Sparkles, Image as ImageIcon, Camera, Loader2, ArrowRight, Music, Waves, Home as HomeIcon, Footprints, PartyPopper, Beer, Coffee, AlertTriangle } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

interface HomeProps {
  user: User;
}

type SortOption = 'created_desc' | 'popular' | 'date_desc' | 'date_asc' | 'vibe_score';

const CATEGORIES = [
  { id: 'all', label: 'HEPSİ', icon: Sparkles, color: 'indigo' },
  { id: 'club', label: 'CLUB', icon: Music, color: 'fuchsia' },
  { id: 'rave', label: 'RAVE', icon: Zap, color: 'violet' },
  { id: 'pub', label: 'PUB', icon: Beer, color: 'amber' },
  { id: 'coffee', label: 'COFFEE', icon: Coffee, color: 'orange' },
  { id: 'beach', label: 'SAHİL PARTİSİ', icon: Waves, color: 'cyan' },
  { id: 'house', label: 'EV PARTİSİ', icon: HomeIcon, color: 'rose' },
  { id: 'street', label: 'SOKAK PARTİSİ', icon: Footprints, color: 'amber' },
];

interface EventWithParticipants extends Event {
  participantCount: number;
  liveCount: number;
  ownerVibeScore?: number;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [events, setEvents] = useState<EventWithParticipants[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOption>('created_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [vibeLimit, setVibeLimit] = useState({ canCreate: true, remaining: 3, resetTime: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    date: '',
    image: '',
    category: 'club' as Event['category']
  });

  // Galeri fotoğrafları state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Gece yarısına kalan süreyi hesapla
  const calculateTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  // Countdown başlat
  const startCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setCountdown(calculateTimeUntilMidnight());

    countdownRef.current = setInterval(() => {
      setCountdown(calculateTimeUntilMidnight());
    }, 1000);
  };

  // Cleanup countdown
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Limit modal açıldığında countdown başlat
  useEffect(() => {
    if (showLimitModal) {
      startCountdown();
    } else if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  }, [showLimitModal]);

  // Günlük limit kontrolü
  const checkVibeLimit = async () => {
    const limit = await db.checkDailyVibeLimit(user.id);
    setVibeLimit(limit);
    return limit;
  };

  // Modal açma fonksiyonu - limit kontrolü ile
  const openCreateModal = async () => {
    const limit = await checkVibeLimit();
    if (!limit.canCreate) {
      setShowLimitModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  // Cache keys
  const EVENTS_CACHE_KEY = 'silius_events_cache';
  const EVENTS_CACHE_EXPIRY = 'silius_events_expiry';
  const CACHE_DURATION = 2 * 60 * 1000; // 2 dakika

  const loadEvents = async (useCache = true) => {
    if (useCache) {
      try {
        const expiry = localStorage.getItem(EVENTS_CACHE_EXPIRY);
        const cached = localStorage.getItem(EVENTS_CACHE_KEY);
        if (cached && expiry && Date.now() < parseInt(expiry)) {
          const cachedEvents = JSON.parse(cached);
          setEvents(cachedEvents);
          setIsLoading(false);
          // Arka planda güncelle — ama yeniden loading gösterme
          setTimeout(() => loadEvents(false), 3000);
          return;
        }
      } catch { }
    }

    // Cache yoksa veya süresi geçmişse yeni veri al — sadece ilk yüklemede loading göster
    if (useCache) setIsLoading(true);
    try {
      // Get events with owner vibe scores
      let eventsData: Event[] = [];
      let vibeScoreMap: Record<string, number> = {};

      try {
        const eventsWithScores = await db.getEventsWithOwnerVibeScores();
        if (eventsWithScores && eventsWithScores.length > 0) {
          eventsData = eventsWithScores.map(e => e.event);
          eventsWithScores.forEach(e => {
            vibeScoreMap[e.event.id] = e.ownerVibeScore;
          });
        } else {
          // Fallback to regular getEvents if new function returns empty
          console.log('⚠️ getEventsWithOwnerVibeScores returned empty, using fallback');
          eventsData = await db.getEvents();
        }
      } catch (vibeError) {
        console.error('Vibe score fetch failed, using fallback:', vibeError);
        eventsData = await db.getEvents();
      }

      const countPromises = eventsData.map(e => db.getParticipantCount(e.id));
      const liveCountPromises = eventsData.map(e => db.getLiveParticipantCount(e.id));
      const [counts, liveCounts] = await Promise.all([
        Promise.all(countPromises),
        Promise.all(liveCountPromises),
      ]);

      const eventsWithCounts = eventsData.map((event, index) => ({
        ...event,
        participantCount: counts[index],
        liveCount: liveCounts[index],
        ownerVibeScore: vibeScoreMap[event.id] || 0
      }));

      setEvents(eventsWithCounts);

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

  // Galeri fotoğrafları ekleme
  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files) as File[];
    fileArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    // Input'u resetle (aynı dosyayı tekrar seçebilsin)
    e.target.value = '';
  };

  // Galeri fotoğrafı sil
  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Konum kontrolü - ev/sokak partisinde sadece adres yeterli, diğerlerinde ilçe+mekan gerekli
    const isManualCategory = newEvent.category === 'house' || newEvent.category === 'street';
    if (!newEvent.location) {
      alert(isManualCategory ? 'Lütfen bir adres girin.' : 'Lütfen bir ilçe ve mekan seçin.');
      return;
    }
    if (!isManualCategory && (!newEvent.latitude || !newEvent.longitude)) {
      alert('Lütfen bir ilçe ve mekan seçin.');
      return;
    }
    
    setIsCreating(true);

    try {
      const defaultImages: Record<string, string> = {
        club: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=800&auto=format',
        rave: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format',
        pub: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format',
        coffee: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format',
        beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format',
        house: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format',
        street: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format',
        other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format'
      };

      const savedEvent = await db.saveEvent({
        ...newEvent,
        user_id: user.id,
        image: newEvent.image || defaultImages[newEvent.category] || defaultImages.other,
        latitude: newEvent.latitude,
        longitude: newEvent.longitude
      });

      if (savedEvent) {
        // Galeri fotoğraflarını tek tek kaydet (bulk insert büyük base64 verilerde başarısız olabiliyor)
        if (galleryImages.length > 0) {
          let savedCount = 0;
          for (const img of galleryImages) {
            try {
              const result = await db.addGalleryPhoto(savedEvent.id, img);
              if (result) savedCount++;
            } catch (galleryErr) {
              console.error('Galeri fotoğrafı kaydedilemedi:', galleryErr);
            }
          }
          if (savedCount < galleryImages.length) {
            console.warn(`Galeri: ${galleryImages.length} fotoğraftan ${savedCount} tanesi kaydedildi.`);
          }
        }

        await db.joinEvent(savedEvent.id);
        await loadEvents();
        await checkVibeLimit(); // Limiti güncelle
        setShowCreateModal(false);
        setNewEvent({ title: '', description: '', location: '', latitude: undefined, longitude: undefined, date: '', image: '', category: 'club' });
        setGalleryImages([]);
      } else {
        alert('Etkinlik oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
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
      // Güvenli tarih dönüştürme fonksiyonu
      const getTime = (dateStr?: string) => {
        if (!dateStr) return 0;
        return new Date(dateStr).getTime();
      };

      if (sortOrder === 'popular') {
        return (b.participantCount || 0) - (a.participantCount || 0);
      }
      if (sortOrder === 'vibe_score') {
        return (b.ownerVibeScore || 0) - (a.ownerVibeScore || 0);
      }
      if (sortOrder === 'date_asc') {
        // Bugünün tarihine en yakın etkinlikler önce (mutlak fark)
        const now = Date.now();
        const diffA = Math.abs(getTime(a.date) - now);
        const diffB = Math.abs(getTime(b.date) - now);
        return diffA - diffB;
      }
      if (sortOrder === 'date_desc') {
        // En uzak tarih önce
        return getTime(b.date) - getTime(a.date);
      }

      // Default: created_desc (YENİ)
      return getTime(b.created_at) - getTime(a.created_at);
    });

  const getCategoryInfo = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId) || CATEGORIES[1];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-deep">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-bg-deep overflow-hidden">
      {/* Background - Party/Rave Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-fuchsia-900/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute top-[30%] right-[30%] w-[30%] h-[30%] rounded-full bg-violet-900/15 blur-[80px] animate-pulse delay-500"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        {/* Scan line effect */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.01)_2px,rgba(255,255,255,0.01)_4px)]"></div>
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 py-8 pb-32 relative z-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Topluluk Akışı</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-outfit text-text-main tracking-tighter leading-[0.9]">
              PARTY <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400">ZONE</span>
            </h1>
            <p className="text-slate-500 font-bold mt-4 max-w-md">Hoş geldin, {user.firstName}. Bugün gecenin ritmini yakala ve parti arkadaşlarını bul.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group md:w-80">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>
              <div className="relative flex items-center bg-bg-surface rounded-xl border border-white/10 group-focus-within:border-indigo-500/50 transition-colors">
                <Search className="ml-4 text-slate-500 group-focus-within:text-white transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Parti veya mekan ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none py-4 px-4 text-text-main placeholder:text-text-muted focus:outline-none text-sm font-bold font-outfit tracking-wide"
                />
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className={`px-6 py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-105 active:scale-95 uppercase text-xs tracking-widest whitespace-nowrap ${vibeLimit.canCreate
                  ? 'bg-white text-slate-950 hover:bg-rose-50'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed hover:scale-100'
                }`}
            >
              <Plus size={18} strokeWidth={3} />
              <span>YENİ PARTİ {vibeLimit.remaining < 3 && `(${vibeLimit.remaining}/3)`}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide mask-linear-fade">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = filter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2 ${isActive
                    ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-lg shadow-fuchsia-500/30 translate-y-[-2px]'
                    : 'bg-white/5 border-white/5 text-text-muted hover:text-text-main hover:bg-white/10'
                    }`}
                >
                  <Icon size={14} className={isActive ? 'animate-bounce-slight' : ''} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 bg-bg-surface/50 p-1.5 rounded-xl border border-white/5 self-start md:self-auto flex-wrap">
            {[
              { id: 'created_desc', label: 'YENİ', icon: Sparkles },
              { id: 'popular', label: 'POPÜLER', icon: TrendingUp },
              { id: 'vibe_score', label: 'EN VİBELİ', icon: Zap },
              { id: 'date_asc', label: 'TARİH', icon: Calendar },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortOrder(opt.id as SortOption)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${sortOrder === opt.id
                  ? opt.id === 'vibe_score'
                    ? 'bg-gradient-to-r from-rose-500/20 to-indigo-500/20 text-rose-400 border border-rose-500/20'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                  : 'text-text-muted hover:text-text-main'
                  }`}
              >
                <opt.icon size={12} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
          {filteredAndSortedEvents.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center relative overflow-hidden rounded-[3rem] bg-white/5 border border-white/5 border-dashed">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-600">
                <Sparkles size={32} />
              </div>
              <h3 className="text-3xl font-black text-text-main font-outfit mb-3 uppercase tracking-tight">FREKANS YOK</h3>
              <p className="text-slate-500 mb-8 max-w-sm font-medium">Bu kategoride henüz bir parti yaratılmamış. İlk kıvılcımı sen çak.</p>
              <button onClick={openCreateModal} className="text-fuchsia-500 font-black uppercase text-xs tracking-widest hover:underline underline-offset-4">
                + PARTİ OLUŞTUR {vibeLimit.remaining < 3 && `(${vibeLimit.remaining}/3)`}
              </button>
            </div>
          ) : (
            filteredAndSortedEvents.map((event, index) => {
              const catInfo = getCategoryInfo(event.category);
              const isEven = index % 2 === 0;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              const isExpired = eventDate < today;
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className={`group relative flex flex-col bg-bg-surface border rounded-[2.5rem] overflow-hidden transition-all duration-500 ${isExpired ? 'border-red-500/30 opacity-70 grayscale-[40%]' : 'border-white/5 hover:border-fuchsia-500/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-fuchsia-500/10'}`}
                >
                  {/* Image Container */}
                  <div className="h-64 relative overflow-hidden">
                    <div className="absolute inset-0 bg-fuchsia-900/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <img
                      src={event.image}
                      alt={event.title}
                      className={`w-full h-full object-cover transition-transform duration-700 ${isExpired ? 'grayscale' : 'group-hover:scale-110 group-hover:filter group-hover:contrast-125'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent opacity-80"></div>

                    {/* Devre Dışı overlay */}
                    {isExpired && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3 px-8 py-5 bg-red-500/20 border-2 border-red-500/50 rounded-3xl backdrop-blur-md">
                          <AlertTriangle size={32} className="text-red-400" />
                          <span className="text-red-400 font-black text-xl uppercase tracking-[0.3em]">DEVRE DIŞI</span>
                          <span className="text-red-300/70 text-[10px] font-bold uppercase tracking-widest">Bu etkinliğin tarihi geçmiştir</span>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 z-20">
                      <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                        <catInfo.icon size={12} className="text-rose-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{catInfo.label}</span>
                      </div>
                    </div>

                    {/* Canlı katılımcı göstergesi */}
                    {event.liveCount > 0 && !isExpired && (
                      <div className="absolute top-4 right-4 z-20">
                        <div className="px-3 py-1.5 bg-green-500/90 backdrop-blur-md rounded-lg border border-green-400/30 flex items-center gap-2 shadow-lg shadow-green-500/30">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">
                            {event.liveCount} CANLI
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8 pt-2 flex flex-col flex-grow relative z-20">
                    <h3 className="text-2xl font-black font-outfit text-text-main leading-tight mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-400 group-hover:to-cyan-400 transition-all uppercase tracking-tight">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-4 mb-6 opacity-60">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar size={14} className="text-rose-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">{event.location}</span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed mb-6">
                      {event.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-surface bg-slate-800 bg-cover relative z-10" style={{ backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id + i})` }}></div>
                        ))}
                        {event.participantCount > 0 && (
                          <div className="w-8 h-8 rounded-full border-2 border-bg-surface bg-slate-800 flex items-center justify-center text-[9px] font-bold text-white relative z-20">
                            +{event.participantCount}
                          </div>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Limit Warning Modal */}
        {showLimitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-deep/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div
              className="relative w-full max-w-md bg-bg-surface rounded-[3rem] p-8 md:p-12 border border-rose-500/20 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none"></div>

              <div className="relative z-10">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="absolute top-0 right-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>

                {/* Warning Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
                  <Zap size={40} className="text-rose-500" />
                </div>

                <h2 className="text-2xl md:text-3xl font-black font-outfit tracking-tighter uppercase text-text-main mb-4">
                  Günlük Limit Doldu!
                </h2>

                <p className="text-slate-400 mb-8 font-medium">
                  Bugün için <span className="text-rose-400 font-bold">3 vibe</span> oluşturma hakkınızı kullandınız.
                  Yarın gece yarısında yeni vibe'lar oluşturabilirsiniz.
                </p>

                {/* Countdown Timer */}
                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
                    Yeni vibe oluşturmanıza kalan süre
                  </p>
                  <div className="flex justify-center gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 min-w-[80px] border border-white/10">
                      <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Saat</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 min-w-[80px] border border-white/10">
                      <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Dakika</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 min-w-[80px] border border-white/10">
                      <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Saniye</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
                >
                  Anladım
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
            <div
              className="relative w-full max-w-2xl bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl overflow-y-auto scrollbar-hide max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[80px] pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <h2 className="text-3xl md:text-4xl font-black font-outfit tracking-tighter uppercase italic text-text-main">
                    YENİ <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">PARTİ</span> YARAT
                  </h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-8">
                    <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kapak Görseli</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative h-48 md:h-64 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-rose-500/50 hover:bg-white/5 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
                    >
                      {newEvent.image ? (
                        <>
                          <img src={newEvent.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt="Preview" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="text-white" size={20} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                          <ImageIcon size={32} className="text-rose-500" />
                          <span className="font-black text-[10px] text-white uppercase tracking-widest">Görsel Yükle</span>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                  </div>

                  {/* Galeri Fotoğrafları */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Galeri Fotoğrafları</label>
                      <span className="text-[10px] font-bold text-slate-600">{galleryImages.length} fotoğraf eklendi</span>
                    </div>
                    
                    {/* Eklenen galeri fotoğrafları önizleme */}
                    {galleryImages.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {galleryImages.map((img, index) => (
                          <div key={index} className="relative group/gallery aspect-square rounded-2xl overflow-hidden border border-white/10">
                            <img src={img} className="w-full h-full object-cover" alt={`Galeri ${index + 1}`} />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X size={14} className="text-white" />
                            </button>
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded-lg text-[9px] font-bold text-white">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Galeri fotoğraf ekleme butonu */}
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="relative h-24 rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-white/5 transition-all cursor-pointer overflow-hidden flex items-center justify-center gap-3 group"
                    >
                      <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-indigo-500" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Galeriye Fotoğraf Ekle</span>
                      </div>
                      <input 
                        type="file" 
                        ref={galleryInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        multiple 
                        onChange={handleGalleryFilesChange} 
                      />
                    </div>
                    <p className="text-[9px] text-slate-600 ml-1">istediğin kadar fotoğraf ekleyebilirsin - vibe detaylarında galeri olarak gözükecek</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Başlık</label>
                      <input type="text" required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="w-full bg-bg-deep/50 border border-white/10 rounded-2xl px-6 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-rose-500/50 transition-all text-sm font-bold"
                        placeholder="Etkinlik Adı"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                      <div className="relative">
                        <select value={newEvent.category} onChange={e => setNewEvent({ ...newEvent, category: e.target.value as any })}
                          className="w-full bg-bg-deep/50 border border-white/10 rounded-2xl px-6 py-4 text-text-main appearance-none cursor-pointer focus:outline-none focus:border-fuchsia-500/50 transition-all text-sm font-bold"
                        >
                          <option value="club" className="bg-slate-900">🎵 Club</option>
                          <option value="rave" className="bg-slate-900">⚡ Rave</option>
                          <option value="pub" className="bg-slate-900">🍺 Pub</option>
                          <option value="coffee" className="bg-slate-900">☕ Coffee</option>
                          <option value="beach" className="bg-slate-900">🏖️ Sahil Partisi</option>
                          <option value="house" className="bg-slate-900">🏠 Ev Partisi</option>
                          <option value="street" className="bg-slate-900">🎉 Sokak Partisi</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ArrowRight size={14} className="text-slate-500 rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarih */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tarih</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="date"
                        required
                        value={newEvent.date}
                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-bg-deep/50 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-rose-500/50 transition-all text-sm font-bold [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Konum Seçici - İlçe + Mekan Seçimi */}
                  <LocationPicker
                    address={newEvent.location}
                    onAddressChange={(addr) => setNewEvent(prev => ({ ...prev, location: addr }))}
                    latitude={newEvent.latitude}
                    longitude={newEvent.longitude}
                    onCoordinatesChange={(lat, lng, mapAddress) => setNewEvent(prev => ({ ...prev, latitude: lat, longitude: lng, location: mapAddress || prev.location }))}
                    addressRequired={true}
                    partyCategory={newEvent.category}
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Açıklama</label>
                    <textarea required rows={4} value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full bg-bg-deep/50 border border-white/10 rounded-[2rem] px-6 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-rose-500/50 transition-all text-sm font-bold resize-none"
                      placeholder="Detaylardan bahset..."
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                      İPTAL
                    </button>
                    <button type="submit" disabled={isCreating} className="flex-1 bg-gradient-to-r from-fuchsia-600 to-violet-500 hover:to-fuchsia-400 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-fuchsia-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'YAYINLA'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
