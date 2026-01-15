import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../db';
import {
    Users, FileText, Settings, Shield, Ban, Globe,
    LayoutDashboard, ArrowLeft, Zap, ChevronRight,
    UserCog, AlertTriangle, PenTool, LogOut, Loader2
} from 'lucide-react';

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const { profile, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        vibes: 0,
        pages: 0,
        bans: 0
    });

    // Secret admin auth kontrolü
    const hasSecretAdminAuth = localStorage.getItem('silius_admin_auth') === 'true';

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [users, vibes, pages, bans] = await Promise.all([
                db.getUsers(),
                db.getEvents(),
                db.getCMSPages(),
                db.getBannedUsers()
            ]);
            setStats({
                users: users?.length || 0,
                vibes: vibes?.length || 0,
                pages: pages?.length || 0,
                bans: bans?.length || 0
            });
        } catch (error) {
            console.error('Stats load error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Admin değilse geri gönder
    if (!isAdmin && !hasSecretAdminAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-rose-500 opacity-50" />
                    <h1 className="text-2xl font-black uppercase">Erişim Reddedildi</h1>
                    <p className="opacity-60 mt-2">Bu sayfaya erişim yetkiniz yok.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold"
                    >
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    const handleLogoutAdmin = () => {
        localStorage.removeItem('silius_admin_auth');
        navigate('/');
    };

    const statsDisplay = [
        { label: 'Toplam Kullanıcı', value: stats.users.toString(), icon: Users, color: 'text-blue-500' },
        { label: 'Aktif Vibe', value: stats.vibes.toString(), icon: Zap, color: 'text-rose-500' },
        { label: 'CMS Sayfaları', value: stats.pages.toString(), icon: FileText, color: 'text-emerald-500' },
        { label: 'Banlı Kullanıcı', value: stats.bans.toString(), icon: Ban, color: 'text-amber-500' },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-3 glass rounded-2xl hover:bg-rose-500/10 transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black font-outfit uppercase tracking-tighter">
                                ADMIN <span className="text-rose-500">PANELİ</span>
                            </h1>
                            <p className="opacity-60 text-sm">Hoş geldin, {profile?.firstName || 'Admin'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 glass rounded-2xl">
                            <Shield className="text-rose-500" size={16} />
                            <span className="text-xs font-black uppercase tracking-wider">Admin</span>
                        </div>
                        {hasSecretAdminAuth && (
                            <button
                                onClick={handleLogoutAdmin}
                                className="p-3 glass rounded-2xl hover:bg-red-500/10 text-red-500 transition-all"
                                title="Çıkış Yap"
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {loading ? (
                        <div className="col-span-4 flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                        </div>
                    ) : (
                        statsDisplay.map((stat) => (
                            <div key={stat.label} className="glass-card p-6 rounded-3xl">
                                <stat.icon className={`${stat.color} mb-3`} size={24} />
                                <p className="text-3xl font-black">{stat.value}</p>
                                <p className="text-xs opacity-60 uppercase tracking-wider mt-1">{stat.label}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Menu Grid */}
                <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-6 ml-1">
                    YÖNETİM ARAÇLARI
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Kullanıcı Yönetimi */}
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="glass-card p-8 rounded-3xl text-left hover:border-rose-500/30 transition-all group"
                    >
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <UserCog className="text-blue-500" size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Kullanıcı Yönetimi</h3>
                        <p className="text-sm opacity-60 mb-4">Kullanıcıları görüntüle, düzenle, ban at veya yetki ver</p>
                        <div className="flex items-center text-rose-500 text-xs font-black uppercase tracking-wider">
                            Yönet <ChevronRight size={14} className="ml-1" />
                        </div>
                    </button>

                    {/* Vibe Yönetimi */}
                    <button
                        onClick={() => navigate('/admin/vibes')}
                        className="glass-card p-8 rounded-3xl text-left hover:border-rose-500/30 transition-all group"
                    >
                        <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="text-rose-500" size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Vibe Yönetimi</h3>
                        <p className="text-sm opacity-60 mb-4">Tüm vibeleri görüntüle, düzenle veya sil</p>
                        <div className="flex items-center text-rose-500 text-xs font-black uppercase tracking-wider">
                            Yönet <ChevronRight size={14} className="ml-1" />
                        </div>
                    </button>

                    {/* CMS */}
                    <button
                        onClick={() => navigate('/admin/pages')}
                        className="glass-card p-8 rounded-3xl text-left hover:border-rose-500/30 transition-all group"
                    >
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <PenTool className="text-emerald-500" size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Sayfa Düzenleyici</h3>
                        <p className="text-sm opacity-60 mb-4">WordPress tarzı sürükle-bırak sayfa oluşturucu</p>
                        <div className="flex items-center text-rose-500 text-xs font-black uppercase tracking-wider">
                            Düzenle <ChevronRight size={14} className="ml-1" />
                        </div>
                    </button>

                    {/* Ban Yönetimi */}
                    <button
                        onClick={() => navigate('/admin/bans')}
                        className="glass-card p-8 rounded-3xl text-left hover:border-rose-500/30 transition-all group"
                    >
                        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Ban className="text-amber-500" size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Ban Yönetimi</h3>
                        <p className="text-sm opacity-60 mb-4">Banlı kullanıcıları ve IP adreslerini yönet</p>
                        <div className="flex items-center text-rose-500 text-xs font-black uppercase tracking-wider">
                            Yönet <ChevronRight size={14} className="ml-1" />
                        </div>
                    </button>

                    {/* Site Ayarları */}
                    <button
                        onClick={() => { }}
                        className="glass-card p-8 rounded-3xl text-left hover:border-rose-500/30 transition-all group opacity-50 cursor-not-allowed"
                    >
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <Settings className="text-purple-500" size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Site Ayarları</h3>
                        <p className="text-sm opacity-60 mb-4">Genel site ayarları (yakında)</p>
                        <div className="flex items-center text-slate-500 text-xs font-black uppercase tracking-wider">
                            Yakında
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
