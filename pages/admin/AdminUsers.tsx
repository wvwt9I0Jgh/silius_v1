import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db';
import { User } from '../../types';
import {
    Users, ArrowLeft, Search, Shield, Ban, UserCheck,
    AlertTriangle, MoreVertical, X, Loader2, UserX,
    Crown, Trash2, WifiOff
} from 'lucide-react';

const AdminUsers: React.FC = () => {
    const navigate = useNavigate();
    const { profile, isAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showBanModal, setShowBanModal] = useState(false);
    const [showIPBanModal, setShowIPBanModal] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [ipAddress, setIPAddress] = useState('');
    const [bannedUserIds, setBannedUserIds] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState(false);

    // Secret admin auth kontrolü
    const hasSecretAdminAuth = localStorage.getItem('silius_admin_auth') === 'true';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, bannedData] = await Promise.all([
                db.getUsers(),
                db.getBannedUsers()
            ]);
            setUsers(usersData);
            setBannedUserIds(bannedData.map((b: any) => b.user_id));
        } catch (error) {
            console.error('Load error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin && !hasSecretAdminAuth) {
        navigate('/');
        return null;
    }

    const filteredUsers = users.filter(u => {
        const query = searchQuery.toLowerCase();
        return (
            u.username.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.firstName.toLowerCase().includes(query) ||
            u.lastName.toLowerCase().includes(query)
        );
    });

    const handleBanUser = async () => {
        if (!selectedUser || !profile) return;
        setActionLoading(true);
        try {
            await db.banUser(selectedUser.id, banReason, profile.id);
            setBannedUserIds([...bannedUserIds, selectedUser.id]);
            setShowBanModal(false);
            setBanReason('');
            setSelectedUser(null);
        } catch (error) {
            console.error('Ban error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnbanUser = async (userId: string) => {
        setActionLoading(true);
        try {
            await db.unbanUser(userId);
            setBannedUserIds(bannedUserIds.filter(id => id !== userId));
        } catch (error) {
            console.error('Unban error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleIPBan = async () => {
        if (!selectedUser || !profile || !ipAddress) return;
        setActionLoading(true);
        try {
            await db.banIP(ipAddress, selectedUser.id, banReason, profile.id);
            setShowIPBanModal(false);
            setBanReason('');
            setIPAddress('');
            setSelectedUser(null);
            alert('IP adresi başarıyla banlandı!');
        } catch (error) {
            console.error('IP Ban error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        setActionLoading(true);
        try {
            await db.updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Role change error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;
        setActionLoading(true);
        try {
            await db.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-3 glass rounded-2xl hover:bg-rose-500/10 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black font-outfit uppercase tracking-tighter">
                            KULLANICI <span className="text-rose-500">YÖNETİMİ</span>
                        </h1>
                        <p className="opacity-60 text-sm">{users.length} kullanıcı</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Kullanıcı ara (isim, email, username)..."
                        className="w-full glass rounded-2xl pl-12 pr-6 py-4 text-sm outline-none"
                    />
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                    </div>
                ) : (
                    <div className="glass-card rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-500/10">
                                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Kullanıcı</th>
                                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Email</th>
                                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Rol</th>
                                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Durum</th>
                                        <th className="text-right p-4 text-xs font-black uppercase tracking-wider opacity-40">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => {
                                        const isBanned = bannedUserIds.includes(user.id);
                                        const isCurrentUser = user.id === profile?.id;
                                        return (
                                            <tr key={user.id} className="border-b border-slate-500/5 hover:bg-rose-500/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                                            alt={user.username}
                                                            className="w-10 h-10 rounded-xl object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-bold">{user.firstName} {user.lastName}</p>
                                                            <p className="text-xs opacity-60">@{user.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm opacity-70">{user.email}</td>
                                                <td className="p-4">
                                                    {user.role === 'admin' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold">
                                                            <Crown size={12} /> Admin
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-500/10 text-slate-400 rounded-full text-xs font-bold">
                                                            <Users size={12} /> Kullanıcı
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {isBanned ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold">
                                                            <Ban size={12} /> Banlı
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">
                                                            <UserCheck size={12} /> Aktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!isCurrentUser && (
                                                            <>
                                                                {isBanned ? (
                                                                    <button
                                                                        onClick={() => handleUnbanUser(user.id)}
                                                                        disabled={actionLoading}
                                                                        className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors text-emerald-500"
                                                                        title="Ban Kaldır"
                                                                    >
                                                                        <UserCheck size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedUser(user);
                                                                            setShowBanModal(true);
                                                                        }}
                                                                        className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-500"
                                                                        title="Ban At"
                                                                    >
                                                                        <Ban size={16} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setShowIPBanModal(true);
                                                                    }}
                                                                    className="p-2 hover:bg-amber-500/10 rounded-xl transition-colors text-amber-500"
                                                                    title="IP Ban"
                                                                >
                                                                    <WifiOff size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                                                    disabled={actionLoading}
                                                                    className="p-2 hover:bg-purple-500/10 rounded-xl transition-colors text-purple-500"
                                                                    title={user.role === 'admin' ? 'Admin yetkisini kaldır' : 'Admin yap'}
                                                                >
                                                                    <Crown size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    disabled={actionLoading}
                                                                    className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-500"
                                                                    title="Sil"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Ban Modal */}
            {showBanModal && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowBanModal(false)} />
                    <div className="relative w-full max-w-md glass-card rounded-3xl p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                    <Ban className="text-red-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase">Kullanıcı Banla</h2>
                                    <p className="text-sm opacity-60">@{selectedUser.username}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowBanModal(false)} className="p-2 hover:bg-slate-500/10 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider opacity-40 block mb-2">Ban Sebebi</label>
                                <textarea
                                    value={banReason}
                                    onChange={e => setBanReason(e.target.value)}
                                    placeholder="Neden banlıyorsunuz?"
                                    className="w-full glass rounded-2xl px-4 py-3 text-sm resize-none h-24"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowBanModal(false)}
                                    className="flex-1 px-6 py-4 glass rounded-2xl font-bold text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleBanUser}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Banla'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* IP Ban Modal */}
            {showIPBanModal && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowIPBanModal(false)} />
                    <div className="relative w-full max-w-md glass-card rounded-3xl p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                    <WifiOff className="text-amber-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase">IP Ban</h2>
                                    <p className="text-sm opacity-60">@{selectedUser.username}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowIPBanModal(false)} className="p-2 hover:bg-slate-500/10 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider opacity-40 block mb-2">IP Adresi</label>
                                <input
                                    type="text"
                                    value={ipAddress}
                                    onChange={e => setIPAddress(e.target.value)}
                                    placeholder="örn: 192.168.1.1"
                                    className="w-full glass rounded-2xl px-4 py-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider opacity-40 block mb-2">Sebep</label>
                                <textarea
                                    value={banReason}
                                    onChange={e => setBanReason(e.target.value)}
                                    placeholder="Neden IP banlıyorsunuz?"
                                    className="w-full glass rounded-2xl px-4 py-3 text-sm resize-none h-24"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowIPBanModal(false)}
                                    className="flex-1 px-6 py-4 glass rounded-2xl font-bold text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleIPBan}
                                    disabled={actionLoading || !ipAddress}
                                    className="flex-1 px-6 py-4 bg-amber-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'IP Banla'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
