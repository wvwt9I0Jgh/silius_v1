import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db';
import { CMSPage } from '../../types';
import {
    FileText, ArrowLeft, Plus, Edit3, Trash2, Eye,
    Globe, EyeOff, Menu, Loader2, X, Save
} from 'lucide-react';

const AdminPages: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin, profile } = useAuth();
    const [pages, setPages] = useState<CMSPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPage, setNewPage] = useState({ title: '', slug: '', show_in_menu: false });
    const [actionLoading, setActionLoading] = useState(false);

    // Secret admin auth kontrolü
    const hasSecretAdminAuth = localStorage.getItem('silius_admin_auth') === 'true';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const pagesData = await db.getCMSPages();
            setPages(pagesData as CMSPage[]);
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

    const handleCreatePage = async () => {
        if (!newPage.title || !newPage.slug) return;
        setActionLoading(true);
        try {
            const page = await db.saveCMSPage({
                title: newPage.title,
                slug: newPage.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                show_in_menu: newPage.show_in_menu,
                is_published: false,
                menu_order: pages.length,
                created_by: profile?.id || 'secret-admin'
            });
            if (page) {
                setPages([...pages, page as CMSPage]);
                setShowCreateModal(false);
                setNewPage({ title: '', slug: '', show_in_menu: false });
                // Sayfa editörüne yönlendir
                navigate(`/admin/pages/${page.id}`);
            } else {
                alert('Sayfa oluşturma başarısız! RLS policy kontrol edin.');
            }
        } catch (error) {
            console.error('Create page error:', error);
            alert('Sayfa oluşturma hatası: ' + (error as Error).message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletePage = async (pageId: string) => {
        if (!confirm('Bu sayfayı silmek istediğinize emin misiniz?')) return;
        setActionLoading(true);
        try {
            const success = await db.deleteCMSPage(pageId);
            if (success) {
                setPages(pages.filter(p => p.id !== pageId));
            } else {
                alert('Sayfa silme başarısız!');
            }
        } catch (error) {
            console.error('Delete page error:', error);
            alert('Sayfa silme hatası: ' + (error as Error).message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleTogglePublish = async (page: CMSPage) => {
        setActionLoading(true);
        try {
            const success = await db.updateCMSPage(page.id, { is_published: !page.is_published });
            if (success) {
                setPages(pages.map(p => p.id === page.id ? { ...p, is_published: !p.is_published } : p));
            } else {
                alert('Yayınlama durumu değiştirme başarısız!');
            }
        } catch (error) {
            console.error('Toggle publish error:', error);
            alert('Yayınlama hatası: ' + (error as Error).message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-3 glass rounded-2xl hover:bg-rose-500/10 transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black font-outfit uppercase tracking-tighter">
                                SAYFA <span className="text-rose-500">YÖNETİMİ</span>
                            </h1>
                            <p className="opacity-60 text-sm">{pages.length} sayfa</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold text-sm flex items-center gap-2"
                    >
                        <Plus size={18} /> Yeni Sayfa
                    </button>
                </div>

                {/* Pages List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                    </div>
                ) : pages.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-3xl">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-rose-500 opacity-50" />
                        <h3 className="text-xl font-black uppercase mb-2">Henüz Sayfa Yok</h3>
                        <p className="opacity-60 mb-6">İlk CMS sayfanızı oluşturun</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold"
                        >
                            Sayfa Oluştur
                        </button>
                    </div>
                ) : (
                    <div className="glass-card rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-500/10">
                                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Sayfa</th>
                                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Slug</th>
                                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Durum</th>
                                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider opacity-40">Menü</th>
                                        <th className="text-right p-4 text-xs font-black uppercase tracking-wider opacity-40">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map(page => (
                                        <tr key={page.id} className="border-b border-slate-500/5 hover:bg-rose-500/5 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold">{page.title}</p>
                                                <p className="text-xs opacity-60">
                                                    {new Date(page.created_at).toLocaleDateString('tr-TR')}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-mono opacity-70">/{page.slug}</span>
                                            </td>
                                            <td className="p-4">
                                                {page.is_published ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">
                                                        <Globe size={12} /> Yayında
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-500/10 text-slate-400 rounded-full text-xs font-bold">
                                                        <EyeOff size={12} /> Taslak
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {page.show_in_menu && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold">
                                                        <Menu size={12} /> Menüde
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleTogglePublish(page)}
                                                        disabled={actionLoading}
                                                        className={`p-2 rounded-xl transition-colors ${page.is_published
                                                            ? 'hover:bg-amber-500/10 text-amber-500'
                                                            : 'hover:bg-emerald-500/10 text-emerald-500'}`}
                                                        title={page.is_published ? 'Yayından Kaldır' : 'Yayınla'}
                                                    >
                                                        {page.is_published ? <EyeOff size={16} /> : <Globe size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/pages/${page.id}`)}
                                                        className="p-2 hover:bg-blue-500/10 rounded-xl transition-colors text-blue-500"
                                                        title="Düzenle"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`/#/page/${page.slug}`, '_blank')}
                                                        className="p-2 hover:bg-purple-500/10 rounded-xl transition-colors text-purple-500"
                                                        title="Önizle"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePage(page.id)}
                                                        disabled={actionLoading}
                                                        className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-500"
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowCreateModal(false)} />
                    <div className="relative w-full max-w-md glass-card rounded-3xl p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                                    <Plus className="text-rose-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase">Yeni Sayfa</h2>
                                    <p className="text-sm opacity-60">CMS sayfası oluştur</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-500/10 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider opacity-40 block mb-2">Sayfa Başlığı</label>
                                <input
                                    type="text"
                                    value={newPage.title}
                                    onChange={e => setNewPage({ ...newPage, title: e.target.value })}
                                    placeholder="Örn: Hakkımızda"
                                    className="w-full glass rounded-2xl px-4 py-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider opacity-40 block mb-2">URL Slug</label>
                                <div className="flex items-center glass rounded-2xl overflow-hidden">
                                    <span className="px-4 py-3 text-sm opacity-40">/</span>
                                    <input
                                        type="text"
                                        value={newPage.slug}
                                        onChange={e => setNewPage({ ...newPage, slug: e.target.value })}
                                        placeholder="hakkimizda"
                                        className="flex-1 bg-transparent px-2 py-3 text-sm outline-none"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 p-4 glass rounded-2xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newPage.show_in_menu}
                                    onChange={e => setNewPage({ ...newPage, show_in_menu: e.target.checked })}
                                    className="w-5 h-5 rounded-lg accent-rose-500"
                                />
                                <div>
                                    <p className="font-bold text-sm">Menüde Göster</p>
                                    <p className="text-xs opacity-60">Sayfa navigasyonda görünsün</p>
                                </div>
                            </label>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-6 py-4 glass rounded-2xl font-bold text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleCreatePage}
                                    disabled={actionLoading || !newPage.title || !newPage.slug}
                                    className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={16} /> Oluştur</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPages;
