import React, { useState, useEffect } from 'react';
import { db } from '../database';
import { User } from '../types';
import { Heart, Sparkles, Loader2, UserPlus, Mail, Calendar, X, Users, ArrowRight, Zap, Check } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-bg-deep">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-500 blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-10 h-10 animate-spin text-rose-500 relative z-10" />
        </div>
      </div>
    );
  }

  const renderGender = (gender: string) => {
    switch (gender) {
      case 'male': return '👨 ERKEK';
      case 'female': return '👩 KADIN';
      case 'transgender': return '⚧️ TRANS';
      case 'lesbian': return '👩‍❤️‍👩 LEZBİYEN';
      case 'gay': return '👨‍❤️‍👨 GEY';
      case 'bisexual_male': return '👨💜 BİSEKSÜEL';
      case 'bisexual_female': return '👩💜 BİSEKSÜEL';
      default: return '🌈 DİĞER';
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-bg-deep overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-900/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[100px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 opacity-20 brightness-100 contrast-150 mix-blend-overlay" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pb-32 relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
          <div className="relative pl-6 border-l-4 border-rose-500/50">
            <h1 className="text-4xl md:text-6xl font-black font-outfit text-text-main tracking-tighter leading-none mb-2">
              SENİN <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">ÇEVREN</span>
            </h1>
            <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">Frekansınla uyumlu ruhlar burada</p>
          </div>

          <Link
            to="/users"
            className="group flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md text-text-main font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl border border-white/10 transition-all hover:scale-105"
          >
            <Sparkles size={16} className="text-rose-400 group-hover:rotate-12 transition-transform" />
            <span>YENİ BAĞLANTILAR BUL</span>
            <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Futuristic Tab Navigation */}
        <div className="bg-bg-surface/80 backdrop-blur-xl p-2 rounded-3xl inline-flex mb-12 border border-white/10">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'friends'
              ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/25'
              : 'text-text-muted hover:text-text-main hover:bg-white/5'
              }`}
          >
            <Heart size={14} className={activeTab === 'friends' ? 'fill-current' : ''} />
            ARKADAŞLARIM <span className="opacity-60 text-[9px] bg-black/20 px-1.5 py-0.5 rounded-md ml-1">{friends.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'reverse'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              : 'text-text-muted hover:text-text-main hover:bg-white/5'
              }`}
          >
            <UserPlus size={14} />
            BENİ EKLEYENLER <span className="opacity-60 text-[9px] bg-black/20 px-1.5 py-0.5 rounded-md ml-1">{reverseFriends.length}</span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(activeTab === 'friends' ? friends : reverseFriends).length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center relative overflow-hidden rounded-[3rem] bg-white/5 border border-white/5 border-dashed">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${activeTab === 'friends' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                {activeTab === 'friends' ? <Heart size={40} className="animate-pulse" /> : <UserPlus size={40} className="animate-pulse" />}
              </div>
              <h3 className="text-3xl font-black text-text-main font-outfit mb-3 tracking-tight">SIFIR NOKTASI</h3>
              <p className="text-text-muted mb-8 max-w-sm font-medium">
                {activeTab === 'friends'
                  ? "Henüz kimseyle frekansın eşleşmedi. İlk adımı atmaktan çekinme."
                  : "Henüz kimse seni eklememiş. Profilini öne çıkarmaya ne dersin?"}
              </p>
              <Link
                to="/users"
                className="px-10 py-4 bg-white text-slate-900 hover:bg-indigo-50 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl hover:scale-105"
              >
                KİŞİLERİ KEŞFET
              </Link>
            </div>
          ) : (
            (activeTab === 'friends' ? friends : reverseFriends).map((f, index) => (
              <div
                key={f.id}
                onClick={() => setSelectedUser(f)}
                className={`group relative bg-bg-surface/60 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 cursor-pointer overflow-hidden hover:-translate-y-2 transition-all duration-500 ${activeTab === 'friends' ? 'hover:border-rose-500/30' : 'hover:border-indigo-500/30'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Hover Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${activeTab === 'friends'
                  ? 'from-rose-500/0 via-transparent to-rose-500/0'
                  : 'from-indigo-500/0 via-transparent to-indigo-500/0'
                  }`}></div>

                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_currentColor] ${activeTab === 'friends' ? 'bg-rose-500 text-rose-500' : 'bg-indigo-500 text-indigo-500'}`}></div>
                </div>

                <div className="flex flex-col items-center pt-4">
                  <div className={`w-28 h-28 rounded-[2rem] p-1 bg-gradient-to-br mb-6 transition-all duration-500 ${activeTab === 'friends'
                    ? 'from-rose-500/20 to-transparent group-hover:from-rose-500/50'
                    : 'from-indigo-500/20 to-transparent group-hover:from-indigo-500/50'
                    }`}>
                    <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-bg-deep relative shadow-2xl">
                      <img
                        src={f.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        alt={f.username}
                      />
                    </div>
                  </div>

                  <h3 className="text-xl font-black font-outfit text-text-main text-center mb-1 uppercase tracking-tight leading-none group-hover:scale-105 transition-transform">
                    {f.firstName} <span className="opacity-70">{f.lastName}</span>
                  </h3>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${activeTab === 'friends' ? 'text-rose-500/60' : 'text-indigo-500/60'}`}>
                    @{f.username}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {f.age && (
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-text-muted">{f.age} YAŞ</span>
                    )}
                    {f.gender && f.gender !== 'prefer_not_to_say' && (
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-text-muted uppercase">
                        {renderGender(f.gender)}
                      </span>
                    )}
                  </div>

                  <div className={`h-1 w-12 rounded-full transition-all duration-500 group-hover:w-20 ${activeTab === 'friends' ? 'bg-rose-500/20' : 'bg-indigo-500/20'}`}></div>

                  <p className="mt-4 text-center text-text-muted text-xs font-bold uppercase tracking-widest opacity-60 line-clamp-1">
                    {f.bio ? f.bio : (activeTab === 'friends' ? "Bağlantı Aktif" : "Beklemede")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Detail Modal */}
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
                      src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                      className="w-full h-full object-cover"
                      alt={selectedUser.username}
                    />
                  </div>
                </div>

                <h2 className="text-3xl font-black font-outfit text-text-main mb-1 uppercase tracking-tight">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <div className="flex flex-col items-center gap-2 mb-6">
                  <span className="text-indigo-400 text-xs font-black tracking-widest">@{selectedUser.username.toUpperCase()}</span>
                  {selectedUser.gender && selectedUser.gender !== 'prefer_not_to_say' && (
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {renderGender(selectedUser.gender)}
                    </span>
                  )}
                </div>

                <div className="w-full grid grid-cols-2 gap-3 mb-6">
                  {selectedUser.created_at && (
                    <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center gap-1">
                      <Calendar size={16} className="text-indigo-400 mb-1" />
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">KATILIM</span>
                      <span className="text-xs font-bold text-text-main">{new Date(selectedUser.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                  <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center gap-1">
                    <Zap size={16} className="text-rose-400 mb-1" />
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">MOD</span>
                    <span className="text-xs font-bold text-text-main">
                      {friends.some(f => f.id === selectedUser.id) ? 'ARKADAŞ' : 'EKLİYOR'}
                    </span>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div className="w-full bg-bg-deep/50 rounded-2xl p-4 border border-white/5 mb-8">
                    <p className="text-text-muted text-sm leading-relaxed font-medium">"{selectedUser.bio}"</p>
                  </div>
                )}

                <div className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all cursor-default ${friends.some(f => f.id === selectedUser.id)
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                  {friends.some(f => f.id === selectedUser.id) ? (
                    <>BAĞLANTI AKTİF <Heart size={16} className="fill-current" /></>
                  ) : (
                    <>SENİ İSTİYOR <UserPlus size={16} /></>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
