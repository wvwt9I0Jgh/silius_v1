import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { db } from '../database';
import { useAuth } from '../context/AuthContext';
import { Loader2, Calendar, ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

type CheckInStatus = 'pending' | 'success' | 'already' | 'error';

// Statik barkod deseni (her render'da değişmemesi için sabitlendik)
const BARCODE_WIDTHS = Array.from({ length: 40 }, (_, i) => (i * 7 + 3) % 2 === 0 ? 'w-1' : 'w-2');

const Barcode: React.FC = () => (
  <div className="flex gap-1 h-12 w-full justify-center overflow-hidden opacity-80">
    {BARCODE_WIDTHS.map((w, i) => (
      <div key={i} className={`h-full bg-slate-900 ${w}`} />
    ))}
  </div>
);

const CheckInPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>('pending');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [liveCount, setLiveCount] = useState(0);

  // Etkinliği ve anlık canlı katılımcı sayısını yükle
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (error || !data) {
          toast.error('Etkinlik bulunamadı');
          navigate('/');
          return;
        }

        setEvent(data);

        // Canlı katılımcı sayısını çek
        const count = await db.getLiveParticipantCount(data.id);
        setLiveCount(count);

        // Kullanıcı zaten check-in yaptıysa direkt "already" göster
        if (user) {
          const alreadyCheckedIn = await db.isUserCheckedIn(data.id, user.id);
          if (alreadyCheckedIn) {
            setCheckInStatus('already');
          }
        }
      } catch (err) {
        console.error('CheckInPage fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, navigate]);

  const handleEntry = async () => {
    if (!user) {
      navigate(`/auth?redirect=/checkin/${eventId}`);
      return;
    }
    if (!event) return;

    setProcessing(true);
    try {
      const result = await db.checkInToEvent(event.id, user.id);

      if (result.success) {
        if (result.points > 0) {
          // Yeni katılım: canlı sayacı arttır
          const updatedCount = await db.getLiveParticipantCount(event.id);
          setLiveCount(updatedCount);
          setCheckInStatus('success');
          setPointsEarned(result.points);
          toast.success(`Canlıya katıldın! +${result.points} Vibe Puanı`);
        } else {
          setCheckInStatus('already');
          toast.success('Zaten canlıdasın!');
        }
      } else {
        setCheckInStatus('error');
        toast.error(result.message);
      }
    } catch (err) {
      console.error('CheckIn error:', err);
      toast.error('Bir hata oluştu, tekrar dene.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date);
  const isJoined = checkInStatus === 'success' || checkInStatus === 'already';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative w-full max-w-sm md:max-w-xl animate-scale-in">
        {/* Bilet */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

          {/* Sol taraf — Etkinlik bilgisi */}
          <div className="relative h-48 md:h-auto md:w-2/3 bg-slate-900 text-white p-6 md:p-8 flex flex-col justify-between overflow-hidden">
            {event.image && (
              <div className="absolute inset-0 opacity-40">
                <img src={event.image} alt="" className="w-full h-full object-cover grayscale mix-blend-overlay" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/80 to-indigo-900/80" />

            <div className="relative z-10 space-y-1">
              <h3 className="text-xs font-bold tracking-[0.2em] text-purple-300 uppercase">Silius Ticket</h3>
              <h1 className="text-3xl md:text-5xl font-black font-outfit uppercase leading-none">{event.title}</h1>
              <p className="text-fuchsia-200 uppercase tracking-widest text-xs font-bold">{{ club: 'Club Night', rave: 'Rave', pub: 'Pub Night', coffee: 'Coffee Meet', beach: 'Sahil Partisi', house: 'Ev Partisi', street: 'Sokak Partisi', other: 'Etkinlik' }[event.category] || event.category}</p>
            </div>

            {/* Canlı katılımcı sayısı */}
            {liveCount > 0 && (
              <div className="relative z-10 mt-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <Users size={12} className="text-green-400" />
                  <span className="text-green-400 font-bold text-xs">{liveCount} kişi şu an canlıda</span>
                </div>
              </div>
            )}

            <div className="relative z-10 mt-4 md:mt-0 flex items-center gap-2 text-sm font-bold text-slate-300">
              <Calendar size={16} />
              <span>{eventDate.toLocaleDateString('tr-TR')}</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full" />
              <span>{eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Delik efektleri */}
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full z-20 hidden md:block" />
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full z-20 hidden md:block" />
          </div>

          {/* Sağ taraf — Bilet koçanı */}
          <div className="md:w-1/3 bg-slate-100 p-6 md:p-8 flex flex-col items-center justify-between border-t-2 md:border-t-0 md:border-l-2 border-dashed border-slate-300 relative">
            <div className="absolute -left-3 top-0 md:hidden w-6 h-6 bg-slate-950 rounded-full translate-y-[-50%]" />
            <div className="absolute -right-3 top-0 md:hidden w-6 h-6 bg-slate-950 rounded-full translate-y-[-50%]" />

            <div className="text-center w-full">
              <h2 className="text-2xl font-black text-slate-900 -rotate-2 md:rotate-0">BİLET</h2>
              <p className="text-xs font-mono text-slate-500 mt-1 uppercase">ID: {event.id.slice(0, 8)}</p>
            </div>

            <div className="w-full my-4">
              <Barcode />
            </div>

            {/* Aksiyon alanı */}
            <div className="w-full space-y-2">
              {checkInStatus === 'success' ? (
                <>
                  <div className="bg-green-100 border-2 border-green-500 text-green-700 p-3 rounded-xl text-center font-black">
                    CANLIYA KATILDIN
                    <div className="flex items-center justify-center gap-1 text-xs font-medium text-green-600 mt-1">
                      <CheckCircle2 size={12} /> +{pointsEarned} Vibe Puanı
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center py-1"
                  >
                    Etkinliği Gör →
                  </button>
                </>
              ) : checkInStatus === 'already' ? (
                <>
                  <div className="bg-indigo-100 border-2 border-indigo-500 text-indigo-700 p-3 rounded-xl text-center font-black">
                    ZATEN CANLİDASIN
                  </div>
                  <button
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center py-1"
                  >
                    Etkinliği Gör →
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEntry}
                    disabled={processing}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/30 disabled:opacity-60"
                  >
                    {processing
                      ? <Loader2 size={18} className="animate-spin" />
                      : <>{user ? 'CANLIYA KATIL' : 'GİRİŞ YAP'} <ArrowRight size={18} /></>
                    }
                  </button>
                  {user
                    ? <p className="text-[10px] text-center text-slate-500 font-medium">Butona basarak etkinliğe canlı katılmış olursun.</p>
                    : <p className="text-[10px] text-center text-slate-500 font-medium">Giriş yaparak katıl, +1 Vibe Puanı kazan.</p>
                  }
                </>
              )}
            </div>
          </div>
        </div>

        {/* Alt not */}
        <div className="mt-8 text-center text-slate-500/60 pb-8 space-y-2">
          <p className="text-xs uppercase tracking-widest font-medium">Silius Community Platform</p>
          <button onClick={() => navigate('/home')} className="hover:text-white transition-colors text-xs underline">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
