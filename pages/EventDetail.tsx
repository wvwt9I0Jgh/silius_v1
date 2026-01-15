
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Event, Comment, User } from '../types';
import { Calendar, MapPin, Send, ArrowLeft, Heart, MessageSquare, Check, Users as UsersIcon, Share2, Zap, Loader2, Edit3, X, Save, Reply, Pin, Trash2 } from 'lucide-react';

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
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [isTogglingJoin, setIsTogglingJoin] = useState(false);
  const [participants, setParticipants] = useState<User[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);

  // Vibe düzenleme
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', location: '', date: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Yorum yanıtları
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadEventData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const eventData = await db.getEventById(id);
      if (eventData) {
        setEvent(eventData);

        // Yorumları nested olarak yükle (vibe sahibi yorumları üstte)
        const [commentsData, attending, count] = await Promise.all([
          db.getCommentsWithReplies(id, eventData.user_id),
          db.isUserParticipant(id, user.id),
          db.getParticipantCount(id)
        ]);

        setComments(commentsData);
        setIsAttending(attending);
        setParticipantCount(count);
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

  useEffect(() => {
    loadEventData();
  }, [id, user.id]);

  useEffect(() => {
    if (showParticipants) {
      loadParticipants();
    }
  }, [showParticipants]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!event) return null;

  const isOwner = event.user_id === user.id;

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
    if (!newComment.trim()) return;

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
          src={event.image || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format`}
          className="w-full h-full object-cover"
          alt={event.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-transparent"></div>

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
            <span className="px-4 md:px-5 py-1 md:py-2 bg-rose-500 text-white rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-4 md:mb-6 shadow-2xl shadow-rose-500/40">
              {event.category.toUpperCase()}
            </span>
            <h1 className="text-4xl md:text-8xl font-black font-outfit tracking-tighter mb-4 uppercase leading-none text-white text-glow">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-6 ml-1">HİKAYE</h2>
            <p className="text-xl md:text-3xl opacity-80 font-medium leading-[1.4] tracking-tight">
              {event.description}
            </p>
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

            <form onSubmit={handleSendComment} className="flex flex-col md:flex-row gap-4 p-4 glass rounded-[2.5rem]">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Bir düşünce bırak..."
                className="flex-grow bg-transparent px-6 py-4 text-sm font-semibold outline-none"
                disabled={isSendingComment}
              />
              <button
                type="submit"
                disabled={isSendingComment || !newComment.trim()}
                className="px-8 py-4 bg-rose-500 text-white hover:bg-rose-600 rounded-2xl transition-all shadow-xl shadow-rose-500/20 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <>GÖNDER <Send size={16} /></>}
              </button>
            </form>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-10 rounded-[3rem] sticky top-8 border-rose-500/20 shadow-2xl">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 floating">
                <Zap size={40} />
              </div>
              <h3 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-tighter">Vibe'a Hazır Mısın?</h3>
              <p className="opacity-40 text-[10px] font-black uppercase tracking-widest mt-2">Sınırlı kontenjan</p>
            </div>

            <div className="space-y-4">
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
              <div className="grid grid-cols-1 gap-3 pt-4 opacity-60">
                <div className="flex items-center gap-3 text-xs font-bold"><Calendar size={14} className="text-rose-500" /> {event.date}</div>
                <div className="flex items-center gap-3 text-xs font-bold"><MapPin size={14} className="text-indigo-600" /> {event.location}</div>
                <div className="flex items-center gap-3 text-xs font-bold"><UsersIcon size={14} className="text-rose-500" /> {participantCount} Katılımcı</div>
              </div>
            </div>

            {isOwner && (
              <div className="mt-8 pt-8 border-t border-rose-500/10">
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
                >
                  <span>Katılımcılar</span>
                  <UsersIcon size={14} className="text-rose-500" />
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
            )}
          </div>
        </div>
      </div>

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
