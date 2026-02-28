import React, { useState, useEffect } from 'react';
import { db } from '../database';
import { User } from '../types';
import { UserPlus, Check, Search, Loader2, Mail, Calendar, X, Sparkles, Zap } from 'lucide-react';

interface UsersProps {
  user: User;
}

interface UserWithVibeScore {
  user: User;
  vibeScore: number;
}

const Users: React.FC<UsersProps> = ({ user }) => {
  const [allUsers, setAllUsers] = useState<UserWithVibeScore[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addingFriend, setAddingFriend] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithVibeScore | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let usersWithScores: UserWithVibeScore[] = [];

      try {
        usersWithScores = await db.getAllUsersWithVibeScores();
      } catch (vibeError) {
        console.error('Vibe score fetch failed, using fallback:', vibeError);
        // Fallback: get regular users and add 0 score
        const regularUsers = await db.getUsers();
        usersWithScores = regularUsers.map(u => ({ user: u, vibeScore: 0 }));
      }

      // If still empty, try regular getUsers
      if (usersWithScores.length === 0) {
        console.log('⚠️ getAllUsersWithVibeScores returned empty, using fallback');
        const regularUsers = await db.getUsers();
        usersWithScores = regularUsers.map(u => ({ user: u, vibeScore: 0 }));
      }

      const friendIds = await db.getFriendIds(user.id);

      // Filter out current user and already sorted by vibeScore (highest first)
      setAllUsers(usersWithScores.filter(u => u.user.id !== user.id));
      setFriends(friendIds);
    } catch (error) {
      console.error('Users load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const addFriend = async (friendId: string) => {
    if (friends.includes(friendId)) {
      console.log('⚠️ Already friends, skipping');
      return;
    }

    setAddingFriend(friendId);

    try {
      const success = await db.addFriend(friendId);

      if (success) {
        if (!friends.includes(friendId)) {
          setFriends([...friends, friendId]);
        }

        const friendUser = allUsers.find(u => u.user.id === friendId);
        if (friendUser) {
          try {
            await db.createNotification({
              user_id: friendId,
              type: 'friend_request',
              title: 'Yeni Arkadaşlık',
              message: `${user.firstName} ${user.lastName} seni arkadaş olarak ekledi!`,
              link: '/friends',
              from_user_id: user.id
            });
          } catch (notifError) {
            console.warn('⚠️ Notification failed (continuing anyway):', notifError);
          }
        }
      } else {
        alert('Arkadaş eklenemedi. Lütfen oturumunuzun aktif olduğundan emin olun ve tekrar deneyin.');
      }
    } catch (error) {
      alert('Bir hata oluştu: ' + (error as Error).message);
    } finally {
      setAddingFriend(null);
    }
  };

  const filteredUsers = allUsers.filter(item =>
    `${item.user.firstName} ${item.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-deep">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-500 blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-10 h-10 animate-spin text-rose-500 relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-bg-deep overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-900/10 blur-[100px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pb-32 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                Topluluk
              </span>
              <div className="h-px w-12 bg-indigo-500/20"></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-outfit text-text-main tracking-tighter leading-[0.9]">
              KEŞFET<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">BAĞLAN.</span>
            </h1>
          </div>

          <div className="w-full md:w-96 group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-rose-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <div className="relative flex items-center bg-bg-surface rounded-xl border border-white/10 group-focus-within:border-indigo-500/50 transition-colors">
              <Search className="ml-4 text-text-muted group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none py-4 px-4 text-text-main placeholder:text-text-muted focus:outline-none text-sm font-bold font-outfit tracking-wide"
              />
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full py-32 text-center relative overflow-hidden rounded-[3rem] bg-white/5 border border-white/5">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              <Search className="w-16 h-16 text-slate-600 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-black text-text-main font-outfit mb-2">KİMSE BULUNAMADI</h3>
              <p className="text-text-muted font-medium max-w-xs mx-auto">Aradığın kriterlere uygun bir kullanıcı yok gibi görünüyor.</p>
            </div>
          ) : (
            filteredUsers.map((item, index) => {
              const u = item.user;
              const vibeScore = item.vibeScore;
              const isFriend = friends.includes(u.id);
              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(item)}
                  className="group relative bg-bg-surface/60 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Vibe Score Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="px-2 py-1 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 rounded-lg border border-rose-500/20 flex items-center gap-1">
                      <Zap size={10} className="text-rose-400" />
                      <span className="text-[10px] font-black text-rose-400">{vibeScore.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-rose-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-2xl p-1 bg-gradient-to-br from-white/10 to-transparent mb-6 group-hover:from-indigo-500/50 group-hover:to-rose-500/50 transition-colors duration-500">
                      <div className="w-full h-full rounded-xl overflow-hidden bg-bg-surface relative">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          alt={u.username}
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-black font-outfit text-text-main text-center mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-rose-400 transition-all">
                      {u.firstName} {u.lastName}
                    </h3>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">@{u.username}</p>

                    <div className="w-full flex justify-center gap-2 mb-6">
                      {u.age && (
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-text-muted">{u.age} YAŞ</span>
                      )}
                      {u.gender && u.gender !== 'prefer_not_to_say' && (
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-text-muted uppercase">
                          {u.gender === 'male' ? '👨 ERKEK' :
                            u.gender === 'female' ? '👩 KADIN' :
                              u.gender === 'transgender' ? '⚧️ TRANS' :
                                u.gender === 'lesbian' ? '👩‍❤️‍👩 LEZBİYEN' :
                                  u.gender === 'gay' ? '👨‍❤️‍👨 GEY' :
                                    u.gender === 'bisexual_male' ? '👨💜 BİSEKSÜEL' :
                                      u.gender === 'bisexual_female' ? '👩💜 BİSEKSÜEL' :
                                        '🌈 DİĞER'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isFriend) addFriend(u.id);
                      }}
                      disabled={isFriend || addingFriend === u.id}
                      className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all ${isFriend
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white text-slate-950 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/25'
                        }`}
                    >
                      {addingFriend === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFriend ? (
                        <>BAĞLI <Check size={14} /></>
                      ) : (
                        <>EKLE <Sparkles size={14} /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        {selectedUser && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setSelectedUser(null)}
          >
            <div
              className="w-full max-w-md bg-bg-surface rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-transparent blur-[60px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-rose-500/20 to-transparent blur-[60px] pointer-events-none"></div>

              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-text-main transition-all z-20"
              >
                <X size={18} />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-[2rem] p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 mb-6 shadow-xl shadow-indigo-500/20">
                  <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-bg-deep">
                    <img
                      src={selectedUser.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.user.username}`}
                      className="w-full h-full object-cover"
                      alt={selectedUser.user.username}
                    />
                  </div>
                </div>

                <h2 className="text-3xl font-black font-outfit text-text-main mb-1 uppercase tracking-tight">
                  {selectedUser.user.firstName} {selectedUser.user.lastName}
                </h2>
                <div className="flex flex-col items-center gap-2 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 text-xs font-black tracking-widest">@{selectedUser.user.username.toUpperCase()}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span className="text-text-muted text-xs font-bold">LVL 1</span>
                  </div>
                  {selectedUser.user.gender && selectedUser.user.gender !== 'prefer_not_to_say' && (
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {selectedUser.user.gender === 'male' ? '👨 ERKEK' :
                        selectedUser.user.gender === 'female' ? '👩 KADIN' :
                          selectedUser.user.gender === 'transgender' ? '⚧️ TRANSGENDER' :
                            selectedUser.user.gender === 'lesbian' ? '👩‍❤️‍👩 LEZBİYEN' :
                              selectedUser.user.gender === 'gay' ? '👨‍❤️‍👨 GEY' :
                                selectedUser.user.gender === 'bisexual_male' ? '👨💜 BİSEKSÜEL ERKEK' :
                                  selectedUser.user.gender === 'bisexual_female' ? '👩💜 BİSEKSÜEL KADIN' :
                                    '🌈 DİĞER'}
                    </span>
                  )}
                </div>

                <div className="w-full grid grid-cols-2 gap-3 mb-6">
                  {selectedUser.user.created_at && (
                    <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center gap-1">
                      <Calendar size={16} className="text-indigo-400 mb-1" />
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">KATILIM</span>
                      <span className="text-xs font-bold text-text-main">{new Date(selectedUser.user.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-rose-500/10 to-indigo-500/10 rounded-2xl p-3 flex flex-col items-center gap-1 border border-rose-500/20">
                    <Zap size={16} className="text-rose-400 mb-1" />
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">VIBE SKOR</span>
                    <span className="text-lg font-black text-rose-400">{selectedUser.vibeScore.toFixed(2)}</span>
                  </div>
                </div>

                {selectedUser.user.bio && (
                  <div className="w-full bg-bg-deep/50 rounded-2xl p-4 border border-white/5 mb-8">
                    <p className="text-text-muted text-sm leading-relaxed font-medium">"{selectedUser.user.bio}"</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!friends.includes(selectedUser.user.id)) {
                      addFriend(selectedUser.user.id);
                    }
                    setSelectedUser(null);
                  }}
                  disabled={friends.includes(selectedUser.user.id)}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl ${friends.includes(selectedUser.user.id)
                    ? 'bg-emerald-500/10 text-emerald-400 cursor-default border border-emerald-500/20'
                    : 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                >
                  {friends.includes(selectedUser.user.id) ? (
                    <>BAĞLANTI MEVCUT <Check size={18} /></>
                  ) : (
                    <>BAĞLANTI KUR <Sparkles size={18} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
