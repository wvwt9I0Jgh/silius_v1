
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { User } from '../types';
import { Heart, Sparkles, Loader2, UserPlus, Mail, Calendar, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FriendsProps {
  user: User;
}

const Friends: React.FC<FriendsProps> = ({ user }) => {
  const [friends, setFriends] = useState<User[]>([]);
  const [reverseFriends, setReverseFriends] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'reverse'>('friends');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const [friendsData, reverseFriendsData] = await Promise.all([
        db.getFriends(user.id),
        db.getReverseFriends(user.id)
      ]);
      setFriends(friendsData);
      setReverseFriends(reverseFriendsData);
    } catch (error) {
      console.error('Friends load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32 relative">
      {/* Subtle Pink Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-outfit uppercase tracking-tighter flex items-center gap-4 text-white italic">
            SENİN <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">ÇEVREN</span>
            <Heart className="text-rose-500 fill-rose-500/20 animate-pulse" size={36} strokeWidth={2.5} />
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 ml-1">Frekansınla uyumlu ruhlar burada</p>
        </div>
        <Link
          to="/users"
          className="group flex items-center gap-2 px-6 py-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl border border-rose-500/10 transition-all"
        >
          <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
          YENİ BAĞLANTILAR BUL
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 relative z-10">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'friends'
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
            : 'glass-card border border-white/5 text-slate-400 hover:border-rose-500/30'
            }`}
        >
          <Heart size={16} />
          ARKADAŞLARIM ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('reverse')}
          className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'reverse'
            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
            : 'glass-card border border-white/5 text-slate-400 hover:border-indigo-500/30'
            }`}
        >
          <UserPlus size={16} />
          BENİ EKLEYENLER ({reverseFriends.length})
        </button>
      </div>

      {activeTab === 'friends' && friends.length === 0 ? (
        <div className="glass-card rounded-[3rem] border border-white/5 p-16 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/5 transition-colors duration-700"></div>
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8 relative z-10">
            <Heart size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black font-outfit uppercase tracking-tight text-white mb-4 relative z-10">MATRİSTE SESSİZLİK</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium relative z-10">
            Henüz kimseyle frekansın eşleşmedi. Sosyal ağını genişletmek için ilk adımı at.
          </p>
          <Link
            to="/users"
            className="px-12 py-5 bg-white text-slate-950 hover:bg-rose-50 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-2xl shadow-white/5 inline-block relative z-10"
          >
            KİŞİLERİ KEŞFET
          </Link>
        </div>
      ) : activeTab === 'friends' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {friends.map(f => (
            <div
              key={f.id}
              onClick={() => setSelectedUser(f)}
              className="glass rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center gap-6 hover:border-rose-500/30 hover:shadow-[0_20px_60px_rgba(244,63,94,0.08)] transition-all duration-500 group relative overflow-hidden cursor-pointer"
            >
              {/* Subtle card glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full"></div>

              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-slate-900 border-2 border-white/5 shadow-2xl group-hover:scale-105 transition-transform duration-700 relative z-10">
                  <img
                    src={f.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}
                    className="w-full h-full object-cover"
                    alt={f.username}
                  />
                </div>
                {/* Visual indicator (Pulse pink dot) */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center z-20 border border-white/10 shadow-lg">
                  <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-black font-outfit text-xl text-white group-hover:text-rose-400 transition-colors uppercase tracking-tight leading-none mb-2 italic">
                  {f.firstName} {f.lastName}
                </h3>
                <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.2em] mb-1">@{f.username}</p>
                {f.age && (
                  <p className="text-[9px] font-bold opacity-40 mb-2">🎂 {f.age} yaş</p>
                )}
                {f.gender && f.gender !== 'prefer_not_to_say' && (
                  <p className="text-[9px] font-bold opacity-30 mb-3 uppercase tracking-wider">
                    {f.gender === 'male' ? '👨 Erkek' :
                      f.gender === 'female' ? '👩 Kadın' :
                        f.gender === 'transgender' ? '⚧️ Transgender' :
                          f.gender === 'lesbian' ? '👩‍❤️‍👩 Lezbiyen' :
                            f.gender === 'gay' ? '👨‍❤️‍👨 Gey' :
                              f.gender === 'bisexual_male' ? '👨💗💜💙 Biseksüel Erkek' :
                                f.gender === 'bisexual_female' ? '👩💗💜💙 Biseksüel Kız' :
                                  '🌈 Diğer'}
                  </p>
                )}

                <div className="h-1 w-12 bg-rose-500/20 rounded-full mx-auto mb-4 group-hover:w-20 transition-all duration-500"></div>

                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest line-clamp-1 opacity-60">
                  {f.bio ? f.bio : "BAĞLANTI AKTİF"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'reverse' && reverseFriends.length === 0 ? (
        <div className="glass-card rounded-[3rem] border border-white/5 p-16 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-700"></div>
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mx-auto mb-8 relative z-10">
            <UserPlus size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black font-outfit uppercase tracking-tight text-white mb-4 relative z-10">HENÜZ KİMSE EKLEMEMİŞ</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium relative z-10">
            Henüz kimse seni arkadaş olarak eklememiş. Sosyal ağını genişlet, ilk adımı sen at!
          </p>
          <Link
            to="/users"
            className="px-12 py-5 bg-white text-slate-950 hover:bg-indigo-50 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-2xl shadow-white/5 inline-block relative z-10"
          >
            KİŞİLERİ KEŞFET
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reverseFriends.map(f => (
            <div
              key={f.id}
              onClick={() => setSelectedUser(f)}
              className="glass rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center gap-6 hover:border-indigo-500/30 hover:shadow-[0_20px_60px_rgba(99,102,241,0.08)] transition-all duration-500 group relative overflow-hidden cursor-pointer"
            >
              {/* Subtle card glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full"></div>

              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-slate-900 border-2 border-white/5 shadow-2xl group-hover:scale-105 transition-transform duration-700 relative z-10">
                  <img
                    src={f.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}
                    className="w-full h-full object-cover"
                    alt={f.username}
                  />
                </div>
                {/* Visual indicator (Pulse indigo dot) */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center z-20 border border-white/10 shadow-lg">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-black font-outfit text-xl text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-none mb-2 italic">
                  {f.firstName} {f.lastName}
                </h3>
                <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.2em] mb-1">@{f.username}</p>
                {f.age && (
                  <p className="text-[9px] font-bold opacity-40 mb-2">🎂 {f.age} yaş</p>
                )}
                {f.gender && f.gender !== 'prefer_not_to_say' && (
                  <p className="text-[9px] font-bold opacity-30 mb-3 uppercase tracking-wider">
                    {f.gender === 'male' ? '👨 Erkek' :
                      f.gender === 'female' ? '👩 Kadın' :
                        f.gender === 'transgender' ? '⚧️ Transgender' :
                          f.gender === 'lesbian' ? '👩‍❤️‍👩 Lezbiyen' :
                            f.gender === 'gay' ? '👨‍❤️‍👨 Gey' :
                              f.gender === 'bisexual_male' ? '👨💗💜💙 Biseksüel Erkek' :
                                f.gender === 'bisexual_female' ? '👩💗💜💙 Biseksüel Kız' :
                                  '🌈 Diğer'}
                  </p>
                )}

                <div className="h-1 w-12 bg-indigo-500/20 rounded-full mx-auto mb-4 group-hover:w-20 transition-all duration-500"></div>

                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest line-clamp-1 opacity-60">
                  {f.bio ? f.bio : "SENİ EKLEDİ"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="glass-card rounded-[3rem] p-10 max-w-md w-full border border-white/10 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center glass rounded-xl hover:bg-rose-500/20 transition-all"
            >
              <X size={20} className="text-slate-400" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border-2 border-rose-500/30 shadow-2xl mb-6">
                <img
                  src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                  className="w-full h-full object-cover"
                  alt={selectedUser.username}
                />
              </div>

              <h2 className="text-3xl font-black font-outfit uppercase tracking-tight text-white mb-2">
                {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400 font-black text-sm uppercase tracking-wider mb-2">
                @{selectedUser.username}
              </p>
              {selectedUser.age && (
                <p className="text-sm font-bold opacity-60 mb-4">🎂 {selectedUser.age} yaşında</p>
              )}

              {selectedUser.gender && selectedUser.gender !== 'prefer_not_to_say' && (
                <p className="text-xs font-bold opacity-40 mb-6 uppercase tracking-wider">
                  {selectedUser.gender === 'male' ? '👨 Erkek' :
                    selectedUser.gender === 'female' ? '👩 Kadın' :
                      selectedUser.gender === 'transgender' ? '⚧️ Transgender' :
                        selectedUser.gender === 'lesbian' ? '👩‍❤️‍👩 Lezbiyen' :
                          selectedUser.gender === 'gay' ? '👨‍❤️‍👨 Gey' :
                            selectedUser.gender === 'bisexual_male' ? '👨💗💜💙 Biseksüel Erkek' :
                              selectedUser.gender === 'bisexual_female' ? '👩💗💜💙 Biseksüel Kız' :
                                '🌈 Diğer'}
                </p>
              )}

              <div className="w-full space-y-4 mb-8">
                <div className="glass rounded-2xl p-4 flex items-center gap-3">
                  <Mail size={18} className="text-rose-400" />
                  <span className="text-sm text-slate-300">{selectedUser.email}</span>
                </div>
                {selectedUser.created_at && (
                  <div className="glass rounded-2xl p-4 flex items-center gap-3">
                    <Calendar size={18} className="text-indigo-400" />
                    <span className="text-sm text-slate-300">
                      Üyelik: {new Date(selectedUser.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>

              {selectedUser.bio && (
                <div className="w-full glass rounded-2xl p-6 mb-6">
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}

              <div className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-indigo-500/10 border border-rose-500/20">
                <p className="text-xs font-black uppercase tracking-widest text-center">
                  <span className="text-rose-400">❤️ BAĞLI</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;
