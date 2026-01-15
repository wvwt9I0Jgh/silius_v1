
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { User } from '../types';
import { UserPlus, Check, Search, Loader2, Mail, Calendar, X } from 'lucide-react';

interface UsersProps {
  user: User;
}

const Users: React.FC<UsersProps> = ({ user }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addingFriend, setAddingFriend] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [users, friendIds] = await Promise.all([
        db.getUsers(),
        db.getFriendIds(user.id)
      ]);
      setAllUsers(users.filter(u => u.id !== user.id));
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
    setAddingFriend(friendId);
    try {
      const success = await db.addFriend(friendId);
      if (success) {
        setFriends([...friends, friendId]);
        
        // Bildirim gönder
        const friendUser = allUsers.find(u => u.id === friendId);
        if (friendUser) {
          await db.createNotification({
            user_id: friendId,
            type: 'friend_request',
            title: 'Yeni Arkadaşlık',
            message: `${user.firstName} ${user.lastName} seni arkadaş olarak ekledi!`,
            link: '/friends',
            from_user_id: user.id
          });
        }
      }
    } catch (error) {
      console.error('Add friend error:', error);
    } finally {
      setAddingFriend(null);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-outfit uppercase tracking-tight text-white">İnsanları Keşfet</h1>
          <p className="text-slate-400 font-medium">Yeni kişilerle bağlantı kur ve çevreni genişlet</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="İsim veya @kullanıcıadı ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card rounded-[2rem]">
            <p className="text-slate-500 text-lg italic font-bold">Aramanızla eşleşen kimse bulunamadı.</p>
          </div>
        ) : (
          filteredUsers.map(u => {
            const isFriend = friends.includes(u.id);
            return (
              <div 
                key={u.id} 
                onClick={() => setSelectedUser(u)}
                className="glass-card rounded-[2.5rem] p-8 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-indigo-500/50 transition-all shadow-xl shadow-black/20">
                    <img 
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                      className="w-full h-full object-cover" 
                      alt={u.username} 
                    />
                  </div>
                </div>
                
                <h3 className="text-xl font-black font-outfit text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                  {u.firstName} {u.lastName}
                </h3>
                <p className="text-indigo-500 text-sm font-black mb-2 uppercase tracking-tighter">@{u.username}</p>
                {u.gender && u.gender !== 'prefer_not_to_say' && (
                  <p className="text-xs font-bold opacity-40 mb-3 uppercase tracking-wider">
                    {u.gender === 'male' ? '👨 Erkek' : 
                     u.gender === 'female' ? '👩 Kadın' : 
                     u.gender === 'transgender' ? '⚧️ Transgender' : 
                     u.gender === 'lesbian' ? '👩‍❤️‍👩 Lezbiyen' : 
                     u.gender === 'gay' ? '👨‍❤️‍👨 Gey' : 
                     u.gender === 'bisexual_male' ? '👨💗💜💙 Biseksüel Erkek' : 
                     u.gender === 'bisexual_female' ? '👩💗💜💙 Biseksüel Kız' : 
                     '🌈 Diğer'}
                  </p>
                )}
                <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed h-10">{u.bio || "Henüz bir biyografi yazılmadı."}</p>
                
                <button 
                  onClick={() => !isFriend && addFriend(u.id)}
                  disabled={isFriend || addingFriend === u.id}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all shadow-lg ${
                    isFriend 
                      ? 'bg-emerald-500/10 text-emerald-400 cursor-default border border-emerald-500/20' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 disabled:opacity-50'
                  }`}
                >
                  {addingFriend === u.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFriend ? (
                    <>
                      <Check size={18} strokeWidth={3} />
                      BAĞLANDI
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} strokeWidth={3} />
                      ARKADAŞ EKLE
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

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
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-indigo-500/10 border-2 border-indigo-500/30 shadow-2xl mb-6">
                <img 
                  src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                  className="w-full h-full object-cover"
                  alt={selectedUser.username}
                />
              </div>

              <h2 className="text-3xl font-black font-outfit uppercase tracking-tight text-white mb-2">
                {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <p className="text-indigo-400 font-black text-sm uppercase tracking-wider mb-4">@{selectedUser.username}</p>

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
                  <Mail size={18} className="text-indigo-400" />
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

              <button
                onClick={() => {
                  if (!friends.includes(selectedUser.id)) {
                    addFriend(selectedUser.id);
                  }
                  setSelectedUser(null);
                }}
                disabled={friends.includes(selectedUser.id)}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all ${
                  friends.includes(selectedUser.id)
                    ? 'bg-emerald-500/10 text-emerald-400 cursor-default border border-emerald-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                }`}
              >
                {friends.includes(selectedUser.id) ? (
                  <><Check size={18} strokeWidth={3} /> BAĞLANDI</>
                ) : (
                  <><UserPlus size={18} strokeWidth={3} /> ARKADAŞ EKLE</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
