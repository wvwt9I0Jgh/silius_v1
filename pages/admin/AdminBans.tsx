import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db';
import {
    Ban, ArrowLeft, Search, UserX, WifiOff, Trash2,
    Loader2, X, Calendar, User as UserIcon
} from 'lucide-react';

interface BannedUser {
    id: string;
    user_id: string;
    reason: string;
    banned_by: string;
    created_at: string;
    users?: {
        username: string;
        email: string;
        avatar: string;
        firstName: string;
        lastName: string;
    };
}

interface BannedIP {
    id: string;
    ip_address: string;
    user_id: string;
    reason: string;
    banned_by: string;
    created_at: string;
}

const AdminBans: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin, profile } = useAuth();
    const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
    const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'ips'>('users');
    const [actionLoading, setActionLoading] = useState(false);

    // Secret admin auth kontrolü
    const hasSecretAdminAuth = localStorage.getItem('silius_admin_auth') === 'true';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, ipsData] = await Promise.all([
                db.getBannedUsers(),
                db.getBannedIPs()
            ]);
            setBannedUsers(usersData);
            setBannedIPs(ipsData);
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

    const handleUnbanUser = async (userId: string) => {
        if (!confirm('Bu kullanıcının banını kaldırmak istediğinize emin misiniz?')) return;
        setActionLoading(true);
        try {
            await db.unbanUser(userId);
            setBannedUsers(bannedUsers.filter(b => b.user_id !== userId));
        } catch (error) {
            console.error('Unban error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnbanIP = async (ipAddress: string) => {
        if (!confirm('Bu IP adresinin banını kaldırmak istediğinize emin misiniz?')) return;
        setActionLoading(true);
        try {
            await db.unbanIP(ipAddress);
            setBannedIPs(bannedIPs.filter(b => b.ip_address !== ipAddress));
        } catch (error) {
            console.error('Unban IP error:', error);
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
                            BAN <span className="text-rose-500">YÖNETİMİ</span>
                        </h1>
                        <p className="opacity-60 text-sm">{bannedUsers.length} banlı kullanıcı, {bannedIPs.length} banlı IP</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'users'
                            ? 'bg-rose-500 text-white'
                            : 'glass hover:bg-rose-500/10'
                            }`}
                    >
                        <UserX size={18} /> Banlı Kullanıcılar ({bannedUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('ips')}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'ips'
                            ? 'bg-amber-500 text-white'
                            : 'glass hover:bg-amber-500/10'
                            }`}
                    >
                        <WifiOff size={18} /> Banlı IP'ler ({bannedIPs.length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                    </div>
                ) : activeTab === 'users' ? (
                    /* Banned Users */
                    bannedUsers.length === 0 ? (
                        <div className="text-center py-20 glass-card rounded-3xl">
                            <UserX className="w-16 h-16 mx-auto mb-4 text-emerald-500 opacity-50" />
                            <h3 className="text-xl font-black uppercase mb-2">Banlı Kullanıcı Yok</h3>
                            <p className="opacity-60">Tüm kullanıcılar aktif durumda</p>
                        </div>
                    ) : (
                        <div className="glass-card rounded-3xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-500/10">
                                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Kullanıcı</th>
                                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Sebep</th>
                                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Tarih</th>
                                            <th className="text-right p-4 text-xs font-black uppercase tracking-wider opacity-40">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bannedUsers.map(ban => (
                                            <tr key={ban.id} className="border-b border-slate-500/5 hover:bg-rose-500/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={ban.users?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ban.user_id}`}
                                                            alt="User"
                                                            className="w-10 h-10 rounded-xl object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-bold">{ban.users?.firstName} {ban.users?.lastName}</p>
                                                            <p className="text-xs opacity-60">@{ban.users?.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm opacity-70 max-w-xs truncate">{ban.reason || 'Sebep belirtilmemiş'}</p>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-xs opacity-60">
                                                        <Calendar size={12} />
                                                        {new Date(ban.created_at).toLocaleDateString('tr-TR')}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end">
                                                        <button
                                                            onClick={() => handleUnbanUser(ban.user_id)}
                                                            disabled={actionLoading}
                                                            className="px-4 py-2 glass rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/10 text-emerald-500 disabled:opacity-50"
                                                        >
                                                            <Ban size={14} /> Ban Kaldır
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    /* Banned IPs */
                    bannedIPs.length === 0 ? (
                        <div className="text-center py-20 glass-card rounded-3xl">
                            <WifiOff className="w-16 h-16 mx-auto mb-4 text-emerald-500 opacity-50" />
                            <h3 className="text-xl font-black uppercase mb-2">Banlı IP Yok</h3>
                            <p className="opacity-60">Tüm IP adresleri erişebilir durumda</p>
                        </div>
                    ) : (
                        <div className="glass-card rounded-3xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-500/10">
                                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">IP Adresi</th>
                                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Sebep</th>
                                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Tarih</th>
                                            <th className="text-right p-4 text-xs font-black uppercase tracking-wider opacity-40">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bannedIPs.map(ban => (
                                            <tr key={ban.id} className="border-b border-slate-500/5 hover:bg-amber-500/5 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-mono font-bold">{ban.ip_address}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm opacity-70 max-w-xs truncate">{ban.reason || 'Sebep belirtilmemiş'}</p>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-xs opacity-60">
                                                        <Calendar size={12} />
                                                        {new Date(ban.created_at).toLocaleDateString('tr-TR')}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end">
                                                        <button
                                                            onClick={() => handleUnbanIP(ban.ip_address)}
                                                            disabled={actionLoading}
                                                            className="px-4 py-2 glass rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/10 text-emerald-500 disabled:opacity-50"
                                                        >
                                                            <WifiOff size={14} /> IP Ban Kaldır
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default AdminBans;
