import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../database';
import { Event, User } from '../../types';
import {
    Zap, ArrowLeft, Search, Edit3, Trash2, Eye,
    Calendar, MapPin, Loader2, X, Save, Users
} from 'lucide-react';

const AdminVibes: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin, profile } = useAuth();
    const [vibes, setVibes] = useState<Event[]>([]);
    const [users, setUsers] = useState<Map<string, User>>(new Map());
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingVibe, setEditingVibe] = useState<Event | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', location: '', date: '' });
    const [actionLoading, setActionLoading] = useState(false);

    // Secret admin auth kontrolü
    const hasSecretAdminAuth = localStorage.getItem('silius_admin_auth') === 'true';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vibesData, usersData] = await Promise.all([
                db.getEvents(),
                db.getUsers()
            ]);
            setVibes(vibesData);
            const usersMap = new Map<string, User>();
            usersData.forEach(u => usersMap.set(u.id, u));
            setUsers(usersMap);
        } catch (error) {
            console.error('Load error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin && !hasSecretAdminAuth) {
        return <Navigate to="/" replace />;
    }

    const filteredVibes = vibes.filter(v => {
        const query = searchQuery.toLowerCase();
        const owner = users.get(v.user_id);
        return (
            (v.title || '').toLowerCase().includes(query) ||
            (v.description || '').toLowerCase().includes(query) ||
            (v.location || '').toLowerCase().includes(query) ||
            (owner?.username || '').toLowerCase().includes(query) ||
            (owner?.firstName || '').toLowerCase().includes(query)
        );
    });

    const handleEdit = (vibe: Event) => {
        setEditingVibe(vibe);
        setEditForm({
            title: vibe.title,
            description: vibe.description,
            location: vibe.location,
            date: vibe.date
        });
    };

    const handleSaveEdit = async () => {
        if (!editingVibe) return;
        setActionLoading(true);
        try {
            const success = await db.updateEvent(editingVibe.id, editForm);
            if (success) {
                setVibes(vibes.map(v => v.id === editingVibe.id ? { ...v, ...editForm } : v));
                setEditingVibe(null);
            } else {
                alert('Vibe düzenleme başarısız! RLS policy kontrol edin.');
            }
        } catch (error) {
            console.error('Edit error:', error);
            alert('Düzenleme hatası: ' + (error as Error).message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (vibeId: string) => {
        if (!confirm('Bu vibe\'ı silmek istediğinize emin misiniz?')) return;
        setActionLoading(true);
        try {
            const success = await db.deleteEvent(vibeId);
            if (success) {
                setVibes(vibes.filter(v => v.id !== vibeId));
            } else {
                alert('Vibe silme başarısız! RLS policy kontrol edin.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Silme hatası: ' + (error as Error).message);
        } finally {
            setActionLoading(false);
        }
    };

    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            club: '🎵 Club',
            rave: '🔊 Rave',
            pub: '🍺 Pub',
            beach: '🏖️ Sahil Partisi',
            house: '🏠 Ev Partisi',
            street: '🛹 Sokak Partisi',
            other: '✨ Diğer'
        };
        return labels[cat] || cat;
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
                            VIBE <span className="text-rose-500">YÖNETİMİ</span>
                        </h1>
                        <p className="opacity-60 text-sm">{vibes.length} vibe</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Vibe ara (başlık, açıklama, konum, sahip)..."
                        className="w-full glass rounded-2xl pl-12 pr-6 py-4 text-sm outline-none"
                    />
                </div>

                {/* Vibes Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVibes.map(vibe => {
                            const owner = users.get(vibe.user_id);
                            return (
                                <div key={vibe.id} className="glass-card rounded-3xl overflow-hidden">
                                    <div className="h-40 relative">
                                        <img src={vibe.image} alt={vibe.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-3 left-3 px-3 py-1 glass rounded-xl text-xs font-bold">
                                            {getCategoryLabel(vibe.category)}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">{vibe.title}</h3>
                                        <p className="text-sm opacity-60 line-clamp-2 mb-4">{vibe.description}</p>

                                        <div className="flex items-center gap-2 mb-3 opacity-60">
                                            <MapPin size={12} />
                                            <span className="text-xs">{vibe.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-4 opacity-60">
                                            <Calendar size={12} />
                                            <span className="text-xs">{vibe.date}</span>
                                        </div>

                                        {owner && (
                                            <div className="flex items-center gap-2 mb-4 pt-3 border-t border-slate-500/10">
                                                <img
                                                    src={owner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.id}`}
                                                    className="w-6 h-6 rounded-lg"
                                                    alt={owner.username}
                                                />
                                                <span className="text-xs font-bold">@{owner.username}</span>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/events/${vibe.id}`)}
                                                className="flex-1 px-4 py-2 glass rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-500/10 text-blue-500"
                                            >
                                                <Eye size={14} /> Görüntüle
                                            </button>
                                            <button
                                                onClick={() => handleEdit(vibe)}
                                                className="flex-1 px-4 py-2 glass rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/10 text-emerald-500"
                                            >
                                                <Edit3 size={14} /> Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vibe.id)}
                                                className="px-4 py-2 glass rounded-xl text-xs font-bold flex items-center justify-center hover:bg-red-500/10 text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingVibe && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setEditingVibe(null)} />
                    <div className="relative w-full max-w-lg glass-card rounded-3xl p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                                    <Edit3 className="text-rose-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase">Vibe Düzenle</h2>
                                    <p className="text-sm opacity-60">ID: {editingVibe.id.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingVibe(null)} className="p-2 hover:bg-slate-500/10 rounded-xl">
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
                                    onClick={() => setEditingVibe(null)}
                                    className="flex-1 px-6 py-4 glass rounded-2xl font-bold text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={16} /> Kaydet</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVibes;
