
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { User, Event } from '../types';
import { Edit2, Save, Trash2, Calendar, MapPin, Layers, Zap, Camera, Heart, Loader2, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  user: User;
}

interface EventWithParticipants extends Event {
  participantCount: number;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { updateProfile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio || '',
    avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
    gender: user.gender || 'prefer_not_to_say'
  });
  const [myEvents, setMyEvents] = useState<EventWithParticipants[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<EventWithParticipants[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allEvents = await db.getEvents();
      
      // My events (created by me)
      const myEventsFiltered = allEvents.filter(e => e.user_id === user.id);
      const myEventsWithCounts = await Promise.all(
        myEventsFiltered.map(async (event) => ({
          ...event,
          participantCount: await db.getParticipantCount(event.id)
        }))
      );
      setMyEvents(myEventsWithCounts);
      
      // Joined events
      const joinedEventsData: EventWithParticipants[] = [];
      for (const event of allEvents) {
        const isParticipant = await db.isUserParticipant(event.id, user.id);
        if (isParticipant) {
          const count = await db.getParticipantCount(event.id);
          joinedEventsData.push({ ...event, participantCount: count });
        }
      }
      setJoinedEvents(joinedEventsData);
      
      // Friend count
      const friendIds = await db.getFriendIds(user.id);
      setFriendCount(friendIds.length);
    } catch (error) {
      console.error('Profile data load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin!');
      return;
    }

    setIsUploading(true);
    try {
      // Resmi sıkıştır ve yeniden boyutlandır
      const compressedFile = await compressImage(file, 500, 500, 0.8);
      
      // Benzersiz dosya adı oluştur
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Eski avatar'ı sil (eğer varsa ve Supabase'de ise) - Policy hatası olsa bile devam et
      if (editData.avatar && editData.avatar.includes('supabase')) {
        try {
          const oldPath = editData.avatar.split('/').slice(-2).join('/');
          await supabase.storage.from('avatars').remove([oldPath]);
        } catch (deleteError) {
          console.warn('⚠️ Eski avatar silinemedi (sorun değil):', deleteError);
        }
      }

      // Supabase Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // State'i güncelle
      setEditData(prev => ({ ...prev, avatar: publicUrl }));
      
      // Direkt veritabanına kaydet
      const { error: dbError } = await supabase
        .from('users')
        .update({ avatar: publicUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Profili yenile
      await refreshProfile();
      alert('Profil resmi başarıyla güncellendi! ✅');
      console.log('✅ Avatar uploaded and saved:', publicUrl);
    } catch (error: any) {
      console.error('🔴 Upload error:', error);
      alert('Dosya yüklenemedi: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Resim sıkıştırma fonksiyonu
  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Boyutları orantılı olarak küçült
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas boş'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        firstName: editData.firstName,
        lastName: editData.lastName,
        bio: editData.bio,
        avatar: editData.avatar,
        gender: editData.gender
      });
      
      if (!error) {
        await refreshProfile();
        setIsEditing(false);
      } else {
        alert('Profil güncellenemedi: ' + error.message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Hata: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Bu vibe\'ı silmek istediğinizden emin misiniz?')) {
      const success = await db.deleteEvent(eventId);
      if (success) {
        setMyEvents(myEvents.filter(e => e.id !== eventId));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32 transition-all duration-500">
      {/* Profil Header Kartı */}
      <div className="glass-card rounded-[3.5rem] p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden rose-frame border-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
          <div className="relative group">
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-[3.5rem] glass p-1.5 flex items-center justify-center overflow-hidden border-4 border-rose-500/20 shadow-2xl transition-all group-hover:scale-[1.05]">
              <img 
                src={editData.avatar} 
                className="w-full h-full object-cover rounded-[3rem]" 
                alt={user.username} 
              />
              {isEditing && (
                 <div 
                   className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                   onClick={() => fileInputRef.current?.click()}
                 >
                   {isUploading ? (
                     <Loader2 className="w-8 h-8 text-white animate-spin" />
                   ) : (
                     <>
                       <Upload size={28} className="text-white mb-1" />
                       <span className="text-xs font-bold text-white">YÜKLE</span>
                     </>
                   )}
                 </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="flex-grow text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <input type="text" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} className="bg-white/10 border-2 border-rose-500/30 rounded-2xl px-4 py-2 font-black outline-none focus:border-rose-500 w-full" placeholder="Ad" />
                    <input type="text" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} className="bg-white/10 border-2 border-rose-500/30 rounded-2xl px-4 py-2 font-black outline-none focus:border-rose-500 w-full" placeholder="Soyad" />
                    <textarea value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} className="bg-white/10 border-2 border-rose-500/30 rounded-2xl px-4 py-3 outline-none focus:border-rose-500 w-full text-sm resize-none" placeholder="Bio (Hakkında)" rows={3} maxLength={200} />
                    <select value={editData.gender} onChange={e => setEditData({...editData, gender: e.target.value as any})} className="bg-white/10 border-2 border-rose-500/30 rounded-2xl px-4 py-3 font-bold outline-none focus:border-rose-500 w-full">
                      <option value="prefer_not_to_say">🤐 Belirtmek İstemiyorum</option>
                      <option value="male">👨 Erkek</option>
                      <option value="female">👩 Kadın</option>
                      <option value="transgender">⚧️ Transgender/Transseksüel</option>
                      <option value="lesbian">👩‍❤️‍👩 Lezbiyen</option>
                      <option value="gay">👨‍❤️‍👨 Gey</option>
                      <option value="bisexual_male">👨💗💜💙 Biseksüel Erkek</option>
                      <option value="bisexual_female">👩💗💜💙 Biseksüel Kız</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl md:text-6xl font-black font-outfit mb-1 uppercase tracking-tighter leading-none">{user.firstName} {user.lastName}</h1>
                    <p className="text-rose-500 font-black uppercase tracking-widest text-sm">@{user.username}</p>
                  </>
                )}
              </div>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
                className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-rose-600 shadow-xl shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEditing ? (
                  <><Save size={18}/> KAYDET</>
                ) : (
                  <><Edit2 size={18}/> PROFİLİ DÜZENLE</>
                )}
              </button>
            </div>
            
            {/* Detaylı İstatistikler */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 mb-8 border-y border-indigo-500/10 py-8">
              <div className="text-center md:text-left group cursor-default">
                <span className="block text-3xl md:text-5xl font-black font-outfit text-rose-500 group-hover:scale-110 transition-transform">{myEvents.length}</span>
                <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Başlatılan Vibe</span>
              </div>
              <div className="text-center md:text-left group cursor-default">
                <span className="block text-3xl md:text-5xl font-black font-outfit text-indigo-600 group-hover:scale-110 transition-transform">{joinedEvents.length}</span>
                <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Katılınan Vibe</span>
              </div>
              <div className="text-center md:text-left group cursor-default">
                <span className="block text-3xl md:text-5xl font-black font-outfit text-emerald-500 group-hover:scale-110 transition-transform">{friendCount}</span>
                <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Bağlantı</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="opacity-70 text-lg font-medium italic">{user.bio || "Hayat Silius'ta daha renkli."}</p>
              {user.gender && user.gender !== 'prefer_not_to_say' && (
                <p className="text-sm font-bold opacity-50 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  {user.gender === 'male' ? '👨 Erkek' : 
                   user.gender === 'female' ? '👩 Kadın' : 
                   user.gender === 'transgender' ? '⚧️ Transgender' : 
                   user.gender === 'lesbian' ? '👩‍❤️‍👩 Lezbiyen' : 
                   user.gender === 'gay' ? '👨‍❤️‍👨 Gey' : 
                   user.gender === 'bisexual_male' ? '👨💗💜💙 Biseksüel Erkek' : 
                   user.gender === 'bisexual_female' ? '👩💗💜💙 Biseksüel Kız' : 
                   '🌈 Diğer'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Başlatılan Etkinlikler */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Layers size={20} /></div>
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter">BAŞLATTIĞIN VIBELAR</h2>
          </div>
          <div className="space-y-6">
            {myEvents.length === 0 ? (
                <div className="glass-card p-10 rounded-[2.5rem] text-center opacity-40 italic border-dashed border-2">Henüz bir vibe başlatmadın.</div>
            ) : myEvents.map(e => (
              <div key={e.id} className="glass-card p-6 rounded-[2.5rem] flex gap-6 items-center border-2 border-rose-500/10 hover:rose-frame transition-all group">
                <div className="w-20 h-20 rounded-3xl overflow-hidden shrink-0 shadow-lg border-2 border-white/20">
                  <img src={e.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-black uppercase tracking-tight text-lg mb-1 group-hover:text-rose-500 transition-colors">{e.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold opacity-60 uppercase">
                    <span className="flex items-center gap-1"><Calendar size={12} className="text-rose-500" /> {e.date}</span>
                    <span className="flex items-center gap-1"><Heart size={12} className="text-rose-500" /> {e.participantCount} Katılımcı</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteEvent(e.id)}
                  className="p-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Katılınan Etkinlikler */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><Zap size={20} /></div>
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter">KATILDIĞIN VIBELAR</h2>
          </div>
          <div className="space-y-6">
            {joinedEvents.length === 0 ? (
                <div className="glass-card p-10 rounded-[2.5rem] text-center opacity-40 italic border-dashed border-2 border-indigo-500/20">Henüz hiçbir vibe'a katılmadın.</div>
            ) : joinedEvents.map(e => (
              <Link key={e.id} to={`/events/${e.id}`} className="glass-card p-6 rounded-[2.5rem] flex gap-6 items-center border-2 border-indigo-500/10 hover:border-indigo-600 transition-all group">
                <div className="w-20 h-20 rounded-3xl overflow-hidden shrink-0 shadow-lg border-2 border-white/20">
                  <img src={e.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-black uppercase tracking-tight text-lg mb-1 group-hover:text-indigo-600 transition-colors">{e.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold opacity-60 uppercase">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-indigo-600" /> {e.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} className="text-indigo-600" /> {e.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
