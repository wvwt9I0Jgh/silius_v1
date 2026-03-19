
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../database';
import { supabase } from '../lib/supabase'; // Import Supabase
import { Event, Comment, User, EventGalleryPhoto } from '../types';
import { Calendar, MapPin, Send, ArrowLeft, Heart, MessageSquare, Check, Users as UsersIcon, Share2, Zap, Loader2, Edit3, X, Save, Reply, Pin, Trash2, Sparkles, QrCode, Image as ImageIcon, ChevronLeft, ChevronRight, Camera, CheckCircle2, ArrowRight, Radio, AlertTriangle } from 'lucide-react';
import MapDisplay from '../components/MapDisplay';
import QRCode from 'react-qr-code';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import { fetchLocationPhotoUrls, geocodeAddressToCoordinates } from '../lib/googlePlaces';

interface EventDetailProps {
  user: User;
}

const EventDetail: React.FC<EventDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0); // Canlı check-in sayısı
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [isTogglingJoin, setIsTogglingJoin] = useState(false);
  const [participants, setParticipants] = useState<User[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [creator, setCreator] = useState<User | null>(null);
  const [creatorVibeScore, setCreatorVibeScore] = useState(0);

  // Vibe düzenleme
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', location: '', date: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Galeri state
  const [gallery, setGallery] = useState<EventGalleryPhoto[]>([]);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  // Realtime kanal referansı - cleanup için
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Yorum yanıtları
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [commentError, setCommentError] = useState('');

  // QR Scanner & Bilet
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<'pending' | 'success' | 'already'>('pending');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isProcessingCheckIn, setIsProcessingCheckIn] = useState(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Canlı katılımcı listesi
  const [liveParticipants, setLiveParticipants] = useState<User[]>([]);
  const [showLiveBox, setShowLiveBox] = useState(false);

  // Kullanıcının zaten check-in yapıp yapmadığını takip et
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [locationPhotos, setLocationPhotos] = useState<string[]>([]);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const loadEventData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const eventData = await db.getEventById(id);
      if (eventData) {
        setEvent(eventData);

        // Yorumları nested olarak yükle (vibe sahibi yorumları üstte)
        const [commentsData, attending, count, creatorData] = await Promise.all([
          db.getCommentsWithReplies(id, eventData.user_id),
          db.isUserParticipant(id, user.id),
          db.getParticipantCount(id),
          db.getUserById(eventData.user_id)
        ]);

        // Canlı check-in sayısını al
        const { count: checkInCount, error: checkInError } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', id)
          .eq('checked_in', true);
        if (checkInError) {
          console.warn('checked_in column may not exist yet');
        }

        // Galeri fotoğraflarını yükle
        const galleryData = await db.getEventGallery(id);
        setGallery(galleryData);

        // Kullanıcının check-in durumunu kontrol et
        const checkedIn = await db.isUserCheckedIn(id, user.id);
        setIsCheckedIn(checkedIn);

        setComments(commentsData);
        setIsAttending(attending);
        setParticipantCount(count);
        setCheckedInCount(checkInCount || 0);
        
        if (creatorData) {
          setCreator(creatorData);
          const score = await db.calculateVibeScore(creatorData.id);
          setCreatorVibeScore(score);
        }

        // Realtime check-in güncellemelerini dinle.
        // Önce varsa önceki kanaldan ??ikil, sonra yenisine abone ol.
        if (channelRef.current) {
          await channelRef.current.unsubscribe();
          channelRef.current = null;
        }

        channelRef.current = supabase
          .channel(`checkins_${id}`)
          .on(
              'postgres_changes',
              { event: 'UPDATE', schema: 'public', table: 'event_participants', filter: `event_id=eq.${id}` },
              (payload: any) => {
                // Sadece checked_in false → true geçişi say
                if (payload.new.checked_in && !payload.old?.checked_in) {
                  setCheckedInCount(prev => prev + 1);
                }
              }
          )
          .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'event_participants', filter: `event_id=eq.${id}` },
              (payload: any) => {
                // Yeni katılımcı eklendi ve direkt checked_in ise
                if (payload.new.checked_in) {
                  setCheckedInCount(prev => prev + 1);
                }
                setParticipantCount(prev => prev + 1);
              }
          )
          .subscribe();

      }
    } catch (error) {
      console.error('Event load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipants = async () => {
    if (!id) return;
    const participantIds = await db.getEventParticipants(id);
    const participantUsers = await Promise.all(
      participantIds.map(p => db.getUserById(p.user_id))
    );
    setParticipants(participantUsers.filter(Boolean) as User[]);
  };

  // Canlı katılımcıları yükle
  const loadLiveParticipants = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', id)
        .eq('checked_in', true);
      if (error || !data) return;
      const users = await Promise.all(data.map(p => db.getUserById(p.user_id)));
      setLiveParticipants(users.filter(Boolean) as User[]);
    } catch (err) {
      console.error('Live participants load error:', err);
    }
  };

  // QR Scanner başlat
  const startQRScanner = useCallback(async () => {
    setShowQRScanner(true);
    // Scanner'ın DOM'a mount olmasını bekle
    await new Promise(r => setTimeout(r, 600));
    
    const readerElement = document.getElementById('qr-reader');
    if (!readerElement) {
      console.error('QR reader element not found');
      setShowQRScanner(false);
      return;
    }
    
    try {
      const scanner = new Html5Qrcode('qr-reader');
      qrScannerRef.current = scanner;
      
      let handled = false;
      
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Zaten işlendiyse tekrar çalışmasın
          if (handled) return;
          handled = true;
          
          console.log('QR Scanned:', decodedText);
          
          // QR code okundu - URL'den eventId çıkar
          const match = decodedText.match(/(?:checkin|events)\/([a-f0-9A-F-]+)/i);
          const scannedEventId = match ? match[1].toLowerCase() : null;
          const currentEventId = id?.toLowerCase();
          
          console.log('Scanned ID:', scannedEventId, 'Current ID:', currentEventId);
          
          // Scanner'ı SENKRON olarak durdur, sonra state güncelle
          scanner.stop().then(() => {
            qrScannerRef.current = null;
            
            if (scannedEventId && scannedEventId === currentEventId) {
              // Doğru etkinlik - bilet göster
              setShowQRScanner(false);
              // Küçük gecikme ile ticket modal aç (state batching sorununu önle)
              setTimeout(() => {
                setShowTicketModal(true);
              }, 100);
            } else if (scannedEventId) {
              // Farklı bir etkinliğin QR'ı - o etkinliğe yönlendir
              setShowQRScanner(false);
              toast.error('Bu QR kod farklı bir etkinliğe ait!');
            } else {
              // Tanınmayan QR format
              setShowQRScanner(false);
              toast.error('Geçersiz QR kod formatı!');
            }
          }).catch(() => {
            qrScannerRef.current = null;
            setShowQRScanner(false);
            
            if (scannedEventId && scannedEventId === currentEventId) {
              setTimeout(() => {
                setShowTicketModal(true);
              }, 100);
            }
          });
        },
        () => {} // error callback - her frame'de çağrılır, yoksay
      );
    } catch (err) {
      console.error('QR Scanner error:', err);
      setShowQRScanner(false);
      toast.error('Kamera açılamadı. Kamera izni verdiğinizden emin olun.');
    }
  }, [id]);

  // QR Scanner'ı durdur
  const stopQRScanner = useCallback(async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
      } catch {}
      qrScannerRef.current = null;
    }
    setShowQRScanner(false);
  }, []);

  // Canlıya katıl (bilet üzerinden)
  const handleLiveCheckIn = async () => {
    if (!event) return;
    setIsProcessingCheckIn(true);
    try {
      const result = await db.checkInToEvent(event.id, user.id);
      if (result.success) {
        if (result.points > 0) {
          setTicketStatus('success');
          setPointsEarned(result.points);
          // Canlı sayısını ve katılım durumunu güncelle
          const updatedCount = await db.getLiveParticipantCount(event.id);
          setCheckedInCount(updatedCount);
          setIsAttending(true);
          setIsCheckedIn(true);
          const newParticipantCount = await db.getParticipantCount(event.id);
          setParticipantCount(newParticipantCount);
          // Canlı katılımcı listesini güncelle
          await loadLiveParticipants();
          toast.success(`Canlıya katıldın! +${result.points} Vibe Puanı`);
        } else {
          setTicketStatus('already');
          setIsCheckedIn(true);
          setIsAttending(true);
          // Canlı katılımcı listesini güncelle
          const updatedCount = await db.getLiveParticipantCount(event.id);
          setCheckedInCount(updatedCount);
          await loadLiveParticipants();
          toast.success('Zaten canlıdasın!');
        }
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Check-in error:', err);
      toast.error('Bir hata oluştu, tekrar dene.');
    } finally {
      setIsProcessingCheckIn(false);
    }
  };

  useEffect(() => {
    loadEventData();
    return () => {
      // Bileşen kaldırıldığında realtime aboneliğini ve scanner'ı temizle
      channelRef.current?.unsubscribe();
      if (qrScannerRef.current) {
        qrScannerRef.current.stop().catch(() => {});
      }
    };
  }, [id, user.id]);

  useEffect(() => {
    let isMounted = true;

    const loadLocationPhotos = async () => {
      if (!event?.location) {
        if (isMounted) setLocationPhotos([]);
        return;
      }

      const photos = await fetchLocationPhotoUrls({
        query: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        maxPhotos: 8,
      });

      if (isMounted) {
        setLocationPhotos(photos);
      }
    };

    loadLocationPhotos();

    const refreshTimer = window.setInterval(() => {
      loadLocationPhotos();
    }, 120000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, [event?.id, event?.location, event?.latitude, event?.longitude]);

  useEffect(() => {
    const resolveCoordinates = async () => {
      if (!event?.location) {
        setResolvedCoords(null);
        return;
      }

      if (event.latitude && event.longitude) {
        setResolvedCoords({ lat: event.latitude, lng: event.longitude });
        return;
      }

      const coords = await geocodeAddressToCoordinates(event.location);
      setResolvedCoords(coords);
    };

    resolveCoordinates();
  }, [event?.id, event?.location, event?.latitude, event?.longitude]);

  const heroImages = React.useMemo(() => {
    const galleryImages = gallery.map((item) => item.image_url).filter(Boolean);
    const ordered = [event?.image, ...locationPhotos, ...galleryImages].filter(Boolean) as string[];
    return Array.from(new Set(ordered));
  }, [event?.image, locationPhotos, gallery]);

  useEffect(() => {
    setHeroSlideIndex(0);
  }, [event?.id]);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = window.setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroImages.length);
    }, 20000);

    return () => window.clearInterval(interval);
  }, [heroImages]);

  useEffect(() => {
    if (showParticipants) {
      loadParticipants();
    }
  }, [showParticipants]);

  useEffect(() => {
    if (showLiveBox) {
      loadLiveParticipants();
    }
  }, [showLiveBox, checkedInCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!event) return null;

  const mapLatitude = event.latitude ?? resolvedCoords?.lat;
  const mapLongitude = event.longitude ?? resolvedCoords?.lng;

  const isOwner = event.user_id === user.id;

  // Etkinliğin tarihi geçmiş mi kontrol et
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const eventDateObj = new Date(event.date);
  eventDateObj.setHours(0, 0, 0, 0);
  const isEventExpired = eventDateObj < todayDate;

  const toggleJoin = async () => {
    setIsTogglingJoin(true);
    try {
      if (isAttending) {
        await db.leaveEvent(event.id);
        setIsAttending(false);
        setParticipantCount(prev => prev - 1);
      } else {
        await db.joinEvent(event.id);
        setIsAttending(true);
        setParticipantCount(prev => prev + 1);

        if (event.user_id !== user.id) {
          await db.createNotification({
            user_id: event.user_id,
            type: 'event_join',
            title: 'Yeni Katılımcı!',
            message: `${user.firstName} ${user.lastName} "${event.title}" etkinliğine katıldı!`,
            link: `/events/${event.id}`,
            from_user_id: user.id,
            event_id: event.id
          });
        }
      }
    } catch (error) {
      console.error('Toggle join error:', error);
    } finally {
      setIsTogglingJoin(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError('Yorum boş olamaz');
      return;
    }
    setCommentError('');
    setIsSendingComment(true);
    try {
      const savedComment = await db.saveComment(event.id, newComment);
      if (savedComment) {
        // Yorumları tekrar yükle (sıralama için)
        await loadEventData();
        setNewComment('');
      }
    } catch (error) {
      console.error('Comment send error:', error);
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleSendReply = async (parentCommentId: string) => {
    if (!replyText.trim()) return;

    setIsSendingComment(true);
    try {
      const savedReply = await db.saveCommentReply(event.id, parentCommentId, replyText);
      if (savedReply) {
        await loadEventData();
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Reply send error:', error);
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleEditVibe = () => {
    setEditForm({
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await db.updateEvent(event.id, editForm);
      setEvent({ ...event, ...editForm });
      setShowEditModal(false);
    } catch (error) {
      console.error('Edit error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVibe = async () => {
    if (!confirm('Bu vibe\'ı silmek istediğinize emin misiniz?')) return;
    try {
      await db.deleteEvent(event.id);
      navigate('/home');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Galeri fotoğrafı ekleme (detay sayfasından)
  const handleAddGalleryPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !event) return;

    setIsUploadingGallery(true);
    try {
      const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const images: { imageUrl: string }[] = [];
      for (const file of Array.from(files) as File[]) {
        const dataUrl = await readFileAsDataURL(file);
        images.push({ imageUrl: dataUrl });
      }

      const saved = await db.addMultipleGalleryPhotos(event.id, images);
      if (saved.length > 0) {
        // Galeriyi yenile
        const updated = await db.getEventGallery(event.id);
        setGallery(updated);
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Galeri fotoğrafı silme
  const handleDeleteGalleryPhoto = async (photoId: string) => {
    if (!confirm('Bu fotoğrafı galeriden silmek istiyor musun?')) return;
    try {
      const success = await db.deleteGalleryPhoto(photoId);
      if (success) {
        setGallery(prev => prev.filter(p => p.id !== photoId));
      }
    } catch (error) {
      console.error('Gallery delete error:', error);
    }
  };

  // Yorum bileşeni (nested yorumlar için recursive)
  const CommentItem: React.FC<{ comment: Comment; depth?: number }> = ({ comment, depth = 0 }) => {
    const isCommentOwner = comment.user_id === event.user_id;
    const maxDepth = 2;

    return (
      <div className={`${depth > 0 ? 'ml-8 md:ml-12' : ''}`}>
        <div className={`flex gap-4 md:gap-6 p-4 md:p-6 glass-card rounded-[2rem] ${isCommentOwner ? 'border-2 border-rose-500/30 bg-rose-500/5' : 'rose-frame'}`}>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-indigo-500/10">
            <img src={comment.users?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`} alt="viber" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-500 tracking-tighter uppercase text-xs">@{comment.users?.username || 'kullanıcı'}</span>
                {isCommentOwner && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-bold">
                    <Pin size={10} /> SAHİBİ
                  </span>
                )}
              </div>
              <span className="text-[10px] opacity-40">{new Date(comment.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="opacity-80 font-medium text-sm md:text-base mb-3">{comment.text}</p>

            {/* Yanıtla butonu */}
            {depth < maxDepth && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-[10px] font-bold opacity-60 hover:opacity-100 hover:text-rose-500 transition-all"
              >
                <Reply size={12} /> Yanıtla
              </button>
            )}

            {/* Yanıt formu */}
            {replyingTo === comment.id && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Yanıtını yaz..."
                  className="flex-grow glass rounded-xl px-4 py-2 text-sm outline-none"
                />
                <button
                  onClick={() => handleSendReply(comment.id)}
                  disabled={isSendingComment || !replyText.trim()}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isSendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gönder'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nested yanıtlar */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-32 transition-colors duration-500">
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        <img
          src={heroImages[heroSlideIndex] || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format`}
          className="w-full h-full object-cover"
          alt={event.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-transparent"></div>

        {heroImages.length > 1 && (
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/45 border border-white/10 backdrop-blur-sm">
            {heroImages.map((_, index) => (
              <span
                key={`hero-dot-${index}`}
                className={`w-2 h-2 rounded-full transition-all ${heroSlideIndex === index ? 'bg-white' : 'bg-white/35'}`}
              />
            ))}
            <span className="text-[10px] text-white/70 font-bold ml-1">20sn</span>
          </div>
        )}

        {/* Devre Dışı büyük banner - tarihi geçmiş etkinlikler */}
        {isEventExpired && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 px-12 py-8 bg-red-500/20 border-2 border-red-500/50 rounded-[3rem] backdrop-blur-md animate-pulse">
              <AlertTriangle size={56} className="text-red-400" />
              <span className="text-red-400 font-black text-4xl md:text-6xl uppercase tracking-[0.3em]">DEVRE DIŞI</span>
              <span className="text-red-300/70 text-sm md:text-base font-bold uppercase tracking-widest">Bu etkinliğin tarihi geçmiştir</span>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 md:top-10 left-6 md:left-10 z-20 flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 glass rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-rose-500/10 transition-all group"
        >
          <ArrowLeft size={16} className="text-rose-500 group-hover:-translate-x-2 transition-transform" />
          GERİ DÖN
        </button>

        {/* Düzenle/Sil butonları (sadece sahip için) */}
        {isOwner && (
          <div className="absolute top-6 md:top-10 right-6 md:right-10 z-20 flex gap-2">
            <button
              onClick={handleEditVibe}
              className="flex items-center gap-2 px-4 py-2 glass rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/10 text-emerald-500 transition-all"
            >
              <Edit3 size={14} /> Düzenle
            </button>
            <button
              onClick={handleDeleteVibe}
              className="flex items-center gap-2 px-4 py-2 glass rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 text-red-500 transition-all"
            >
              <Trash2 size={14} /> Sil
            </button>
          </div>
        )}

        <div className="absolute bottom-8 md:bottom-16 left-1/2 -translate-x-1/2 w-full max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <span className="px-4 md:px-5 py-1 md:py-2 bg-fuchsia-500 text-white rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-4 md:mb-6 shadow-2xl shadow-fuchsia-500/40">
              {{ club: 'CLUB', rave: 'RAVE', pub: 'PUB', coffee: 'COFFEE', beach: 'SAHİL PARTİSİ', house: 'EV PARTİSİ', street: 'SOKAK PARTİSİ', other: 'DİĞER' }[event.category] || event.category.toUpperCase()}
            </span>
            <h1 className="text-4xl md:text-8xl font-black font-outfit tracking-tighter mb-4 uppercase leading-none text-white text-glow">
              {event.title}
            </h1>
            
            {checkedInCount > 0 && (
              <div className="flex items-center gap-2 px-6 py-2 bg-green-500/20 backdrop-blur-md rounded-full border border-green-500/30 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-green-400 font-bold tracking-widest text-sm uppercase">
                  Canlı: {checkedInCount} Kişi Mekanda
                </span>
              </div>
            )}
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
        <div className="lg:col-span-8 space-y-12">
          <section className="mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-6 ml-1">HİKAYE</h2>
            <p className="text-xl md:text-3xl opacity-80 font-medium leading-[1.4] tracking-tight">
              {event.description}
            </p>
          </section>

          {/* Fotoğraf Galerisi */}
          {gallery.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">FOTOĞRAF GALERİSİ</h2>
                    <p className="text-sm font-bold text-white mt-1">{gallery.length} fotoğraf</p>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 glass rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/10 text-rose-500 transition-all"
                  >
                    <Camera size={14} /> Ekle
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {gallery.map((photo, index) => (
                  <div
                    key={photo.id}
                    onClick={() => { setLightboxIndex(index); setShowLightbox(true); }}
                    className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-white/5 cursor-pointer group/photo hover:border-rose-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10"
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.caption || `Fotoğraf ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                    {photo.caption && (
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover/photo:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-bold truncate">{photo.caption}</p>
                      </div>
                    )}
                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGalleryPhoto(photo.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Galeri fotoğraf ekleme input (hidden) */}
              <input
                type="file"
                ref={galleryInputRef}
                className="hidden"
                accept="image/*, .heic, .heif, image/heic, image/heif"
                multiple
                onChange={handleAddGalleryPhotos}
              />
            </section>
          )}

          {/* Etkinlik sahibi için galeri boşsa ekleme butonu */}
          {gallery.length === 0 && isOwner && (
            <section className="mb-12">
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="relative h-32 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-rose-500/30 hover:bg-white/5 transition-all cursor-pointer overflow-hidden flex items-center justify-center gap-4 group"
              >
                <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-rose-500" />
                  <div>
                    <p className="font-black text-sm text-white uppercase tracking-widest">Fotoğraf Galerisi Oluştur</p>
                    <p className="text-[10px] text-slate-500 mt-1">Vibe'a birden fazla fotoğraf ekle</p>
                  </div>
                </div>
              </div>
              <input
                type="file"
                ref={galleryInputRef}
                className="hidden"
                accept="image/*, .heic, .heif, image/heic, image/heif"
                multiple
                onChange={handleAddGalleryPhotos}
              />
            </section>
          )}

          {/* Lightbox - Tam ekran fotoğraf görüntüleme */}
          {showLightbox && gallery.length > 0 && (
            <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center" onClick={() => setShowLightbox(false)}>
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <X size={24} />
              </button>

              {/* Prev */}
              {gallery.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev <= 0 ? gallery.length - 1 : prev - 1); }}
                  className="absolute left-4 md:left-8 z-50 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Image */}
              <div className="max-w-[90vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
                <img
                  src={gallery[lightboxIndex]?.image_url}
                  alt={gallery[lightboxIndex]?.caption || ''}
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl"
                />
                {gallery[lightboxIndex]?.caption && (
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-white font-bold bg-black/50 backdrop-blur-md inline-block px-6 py-2 rounded-xl">{gallery[lightboxIndex].caption}</p>
                  </div>
                )}
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <span className="text-white/60 text-xs font-bold bg-black/40 px-4 py-1 rounded-full">{lightboxIndex + 1} / {gallery.length}</span>
                </div>
              </div>

              {/* Next */}
              {gallery.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev >= gallery.length - 1 ? 0 : prev + 1); }}
                  className="absolute right-4 md:right-8 z-50 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          )}

          {/* Location & Map Section - Moved here as requested */}
          <section className="mb-12">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                   <MapPin size={24} />
                </div>
                <div>
                   <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">KONUM</h2>
                   <p className="text-xl font-bold text-white mt-1">{event.location}</p>
                </div>
             </div>

             {(mapLatitude && mapLongitude) && (
                <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative group">
                   <div className="absolute inset-0 border-4 border-white/5 z-20 pointer-events-none rounded-[2.5rem]"></div>
                   <MapDisplay
                   latitude={mapLatitude}
                   longitude={mapLongitude}
                      locationName={event.location}
                      height="350px"
                   />
                </div>
             )}
          </section>

          <section className="pt-12 border-t border-indigo-500/10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-8 ml-1">
              VIBE GERİ BİLDİRİMİ ({comments.length})
            </h2>
            <div className="space-y-6 mb-12">
              {comments.map(c => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </div>

            <form onSubmit={handleSendComment} className="flex flex-col gap-2">
              <div className="flex flex-col md:flex-row gap-4 p-4 glass rounded-[2.5rem]">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => { setNewComment(e.target.value); if (commentError) setCommentError(''); }}
                  placeholder="Bir düşünce bırak..."
                  className="flex-grow bg-transparent px-6 py-4 text-sm font-semibold outline-none"
                  disabled={isSendingComment}
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-rose-500 text-white hover:bg-rose-600 rounded-2xl transition-all shadow-xl shadow-rose-500/20 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSendingComment}
                >
                  {isSendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <>GÖNDER <Send size={16} /></>}
                </button>
              </div>
              {commentError && (
                <p className="text-rose-500 text-xs font-bold ml-6 animate-pulse">{commentError}</p>
              )}
            </form>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Creator Profile Card */}
          {creator && (
            <div className="glass-card p-8 rounded-[3rem] border-indigo-500/20 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-6 text-center">VİBE SAHİBİ</h3>
              <div className="flex flex-col items-center text-center">
                <img
                  src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`}
                  alt={creator.username}
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-indigo-500/20 shadow-lg mb-4"
                />
                <p className="font-black text-lg">{creator.firstName} {creator.lastName}</p>
                <p className="text-rose-500 text-xs font-bold mb-4">@{creator.username}</p>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 rounded-2xl">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500">
                    {creatorVibeScore.toFixed(2)} VIBE
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-10 rounded-[3rem] sticky top-8 border-rose-500/20 shadow-2xl">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 floating">
                <Zap size={40} />
              </div>
              <h3 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-tighter">Vibe'a Hazır Mısın?</h3>
              <p className="opacity-40 text-[10px] font-black uppercase tracking-widest mt-2">Sınırlı kontenjan</p>
            </div>

            <div className="space-y-4">
              {isEventExpired ? (
                <div className="w-full py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 bg-red-500/10 text-red-400 border-2 border-red-500/40">
                  <AlertTriangle size={24} /> DEVRE DIŞI
                </div>
              ) : (
                <>
                  <button
                    onClick={toggleJoin}
                    disabled={isTogglingJoin}
                    className={`w-full py-6 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 transform hover:scale-[1.03] shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${isAttending
                        ? 'bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/50'
                        : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20'
                      }`}
                  >
                    {isTogglingJoin ? <Loader2 className="w-6 h-6 animate-spin" /> : (isAttending ? 'ERİŞİM ONAYLANDI' : 'YERİNİ AYIRT')}
                  </button>

                  {/* Check-in Butonu veya Canlıda Badge - Katılımcılar için */}
                  {isAttending && isCheckedIn && (
                    <div className="w-full py-4 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 bg-green-500/10 text-green-400 border-2 border-green-500/40">
                      <CheckCircle2 size={20} /> CANLIDASIN
                    </div>
                  )}
                  {isAttending && !isCheckedIn && (
                    <button
                      onClick={startQRScanner}
                      className="w-full py-4 rounded-[2rem] font-black text-sm transition-all flex items-center justify-center gap-3 bg-indigo-500/10 text-indigo-400 border-2 border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/50"
                    >
                      <Camera size={20} /> CHECK-IN YAP
                    </button>
                  )}
                </>
              )}
              
              {/* Etkinlik Bilgileri */}
              <div className="grid grid-cols-1 gap-3 pt-4">
                <div className="flex items-center gap-3 text-xs font-bold opacity-60">
                  <Calendar size={14} className="text-rose-500" /> {event.date}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold opacity-60">
                  <UsersIcon size={14} className="text-rose-500" /> {participantCount} Katılımcı
                </div>
                <div className="flex items-center gap-3 text-xs font-bold opacity-60">
                  <Radio size={14} className="text-green-500" /> {checkedInCount} Kişi Canlıda
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-rose-500/10">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
              >
                <span>Katılımcılar</span>
                <div className="flex items-center gap-2">
                  <span className="text-rose-500 font-black">{participantCount}</span>
                  <UsersIcon size={14} className="text-rose-500" />
                </div>
              </button>

              {showParticipants && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {participants.length === 0 ? (
                    <p className="text-xs opacity-40 text-center py-4">Henüz katılımcı yok</p>
                  ) : (
                    participants.map(participant => (
                      <div key={participant.id} className="flex items-center gap-3 p-3 glass rounded-2xl hover:bg-rose-500/5 transition-all">
                        <img
                          src={participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.id}`}
                          alt={participant.username}
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold truncate">{participant.firstName} {participant.lastName}</p>
                          <p className="text-[10px] opacity-40 truncate">@{participant.username}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* CANLI Kutucuğu - Her zaman göster */}
            <div className="mt-8 pt-8 border-t border-green-500/10">
              <button
                onClick={() => setShowLiveBox(!showLiveBox)}
                className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  {checkedInCount > 0 ? (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                  ) : (
                    <span className="relative flex h-3 w-3">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500" />
                    </span>
                  )}
                  <span className={checkedInCount > 0 ? 'text-green-400' : 'text-slate-500'}>CANLI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={checkedInCount > 0 ? 'text-green-400 font-black' : 'text-slate-500 font-black'}>{checkedInCount} Kişi</span>
                  <Radio size={14} className={checkedInCount > 0 ? 'text-green-500' : 'text-slate-500'} />
                </div>
              </button>

              {showLiveBox && checkedInCount > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {liveParticipants.length === 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                    </div>
                  ) : (
                    liveParticipants.map(lp => (
                      <div key={lp.id} className="flex items-center gap-3 p-3 glass rounded-2xl border border-green-500/10 hover:bg-green-500/5 transition-all">
                        <div className="relative">
                          <img
                            src={lp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lp.id}`}
                            alt={lp.username}
                            className="w-8 h-8 rounded-xl object-cover"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold truncate">{lp.firstName} {lp.lastName}</p>
                          <p className="text-[10px] text-green-400 truncate">Canlıda</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {showLiveBox && checkedInCount === 0 && (
                <div className="mt-4 py-4 text-center">
                  <p className="text-xs opacity-40">Henüz canlıya katılan yok</p>
                </div>
              )}
            </div>
          </div>

          {/* Vibe Sahibi QR Kodu */}
          {isOwner && (
            <div className="glass-card p-8 rounded-[3rem] border-fuchsia-500/20 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-6 text-center">ETKİNLİK QR KODU</h3>
              <div className="bg-white p-6 rounded-[2rem] flex justify-center">
                <QRCode
                  value={`${window.location.origin}/#/checkin/${event.id}`}
                  size={180}
                  level="H"
                  className="h-auto max-w-full"
                />
              </div>
              <p className="text-[10px] text-center mt-4 opacity-40 font-bold">
                Katılımcılar bu QR'ı okutarak canlıya katılır
              </p>
              <div className="flex justify-center mt-3">
                <div className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-lg text-[10px] font-bold border border-fuchsia-200 flex items-center gap-1">
                  <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse" /> Aktif
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={stopQRScanner} />
          <div className="relative w-full max-w-sm glass-card rounded-3xl p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                  <Camera className="text-indigo-500" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase">QR Okut</h2>
                  <p className="text-[10px] opacity-60">Etkinlik QR kodunu tara</p>
                </div>
              </div>
              <button onClick={stopQRScanner} className="p-2 hover:bg-slate-500/10 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div id="qr-reader" className="rounded-2xl overflow-hidden" style={{ minHeight: 300 }} />
            <p className="text-[10px] text-center mt-4 opacity-40 font-bold">
              Vibe sahibinin QR kodunu kameranıza gösterin
            </p>
          </div>
        </div>
      )}

      {/* Bilet (Ticket) Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => { setShowTicketModal(false); setTicketStatus('pending'); }} />
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
                  <p className="text-fuchsia-200 uppercase tracking-widest text-xs font-bold">
                    {{ club: 'Club Night', rave: 'Rave', pub: 'Pub Night', coffee: 'Coffee Meet', beach: 'Sahil Partisi', house: 'Ev Partisi', street: 'Sokak Partisi', other: 'Etkinlik' }[event.category] || event.category}
                  </p>
                </div>

                {/* Canlı katılımcı sayısı */}
                {checkedInCount > 0 && (
                  <div className="relative z-10 mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                      </span>
                      <UsersIcon size={12} className="text-green-400" />
                      <span className="text-green-400 font-bold text-xs">{checkedInCount} kişi canlıda</span>
                    </div>
                  </div>
                )}

                <div className="relative z-10 mt-4 md:mt-0 flex items-center gap-2 text-sm font-bold text-slate-300">
                  <Calendar size={16} />
                  <span>{new Date(event.date).toLocaleDateString('tr-TR')}</span>
                  <span className="w-1 h-1 bg-slate-500 rounded-full" />
                  <span>{new Date(event.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
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

                {/* Barkod */}
                <div className="w-full my-4">
                  <div className="flex gap-1 h-12 w-full justify-center overflow-hidden opacity-80">
                    {Array.from({ length: 40 }, (_, i) => (
                      <div key={i} className={`h-full bg-slate-900 ${(i * 7 + 3) % 2 === 0 ? 'w-1' : 'w-2'}`} />
                    ))}
                  </div>
                </div>

                {/* Aksiyon alanı */}
                <div className="w-full space-y-2">
                  {ticketStatus === 'success' ? (
                    <>
                      <div className="bg-green-100 border-2 border-green-500 text-green-700 p-3 rounded-xl text-center font-black">
                        CANLIYA KATILDIN
                        <div className="flex items-center justify-center gap-1 text-xs font-medium text-green-600 mt-1">
                          <CheckCircle2 size={12} /> +{pointsEarned} Vibe Puanı
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowTicketModal(false); setTicketStatus('pending'); }}
                        className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center py-1"
                      >
                        Vibe Detaylarına Dön →
                      </button>
                    </>
                  ) : ticketStatus === 'already' ? (
                    <>
                      <div className="bg-indigo-100 border-2 border-indigo-500 text-indigo-700 p-3 rounded-xl text-center font-black">
                        ZATEN CANLIDASIN
                      </div>
                      <button
                        onClick={() => { setShowTicketModal(false); setTicketStatus('pending'); }}
                        className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center py-1"
                      >
                        Vibe Detaylarına Dön →
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleLiveCheckIn}
                        disabled={isProcessingCheckIn}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/30 disabled:opacity-60"
                      >
                        {isProcessingCheckIn
                          ? <Loader2 size={18} className="animate-spin" />
                          : <>CANLIYA KATIL <ArrowRight size={18} /></>
                        }
                      </button>
                      <p className="text-[10px] text-center text-slate-500 font-medium">Butona basarak etkinliğe canlı katılmış olursun.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Alt not */}
            <div className="mt-6 text-center">
              <button onClick={() => { setShowTicketModal(false); setTicketStatus('pending'); }} className="text-slate-500/60 hover:text-white transition-colors text-xs underline">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-lg glass-card rounded-3xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <Edit3 className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase">Vibe Düzenle</h2>
                  <p className="text-sm opacity-60">Bilgileri güncelle</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-500/10 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider opacity-40 block mb-2">Başlık</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full glass rounded-2xl px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider opacity-40 block mb-2">Açıklama</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full glass rounded-2xl px-4 py-3 text-sm resize-none h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider opacity-40 block mb-2">Konum</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full glass rounded-2xl px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider opacity-40 block mb-2">Tarih</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full glass rounded-2xl px-4 py-3 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-4 glass rounded-2xl font-bold text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={16} /> Kaydet</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
