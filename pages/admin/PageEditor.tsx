import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../database';
import { CMSPage, CMSModule, CMSModuleType, CMSModuleStyles } from '../../types';
import {
    ArrowLeft, Save, Plus, Trash2, GripVertical, Eye, Settings,
    Type, Image, Square, Video, Minus, ChevronDown, ChevronUp,
    Columns, Star, CreditCard, Zap, Share2, Code, Globe,
    Loader2, X, Palette, Move
} from 'lucide-react';

// Modül tipleri ve ikonları
const MODULE_TYPES: { type: CMSModuleType; label: string; icon: React.ElementType; description: string }[] = [
    { type: 'heading', label: 'Başlık', icon: Type, description: 'H1-H6 başlık' },
    { type: 'text', label: 'Metin', icon: Type, description: 'Paragraf metni' },
    { type: 'image', label: 'Resim', icon: Image, description: 'Görsel' },
    { type: 'button', label: 'Buton', icon: Square, description: 'Tıklanabilir buton' },
    { type: 'spacer', label: 'Boşluk', icon: Minus, description: 'Dikey boşluk' },
    { type: 'divider', label: 'Ayırıcı', icon: Minus, description: 'Yatay çizgi' },
    { type: 'hero', label: 'Hero', icon: Zap, description: 'Hero bölümü' },
    { type: 'card', label: 'Kart', icon: Square, description: 'İçerik kartı' },
    { type: 'grid', label: 'Grid', icon: Columns, description: 'Çoklu kolon' },
    { type: 'video', label: 'Video', icon: Video, description: 'Video embed' },
    { type: 'gallery', label: 'Galeri', icon: Image, description: 'Resim galerisi' },
    { type: 'accordion', label: 'Akordeon', icon: ChevronDown, description: 'Açılır içerik' },
    { type: 'tabs', label: 'Sekmeler', icon: Columns, description: 'Sekmeli içerik' },
    { type: 'testimonial', label: 'Referans', icon: Star, description: 'Müşteri yorumu' },
    { type: 'pricing', label: 'Fiyat', icon: CreditCard, description: 'Fiyat kartı' },
    { type: 'feature', label: 'Özellik', icon: Zap, description: 'Özellik kartı' },
    { type: 'cta', label: 'CTA', icon: Zap, description: 'Call to action' },
    { type: 'social', label: 'Sosyal', icon: Share2, description: 'Sosyal linkler' },
    { type: 'html', label: 'HTML', icon: Code, description: 'Özel HTML' },
    { type: 'embed', label: 'Embed', icon: Globe, description: 'iFrame embed' },
];

// Varsayılan içerikler
const getDefaultContent = (type: CMSModuleType): Record<string, any> => {
    switch (type) {
        case 'heading':
            return { text: 'Başlık metni', level: 'h2' };
        case 'text':
            return { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' };
        case 'image':
            return { src: 'https://via.placeholder.com/800x400', alt: 'Resim açıklaması' };
        case 'button':
            return { text: 'Buton', href: '#', variant: 'primary' };
        case 'spacer':
            return { height: 60 };
        case 'divider':
            return { style: 'solid', color: '#e2e8f0' };
        case 'hero':
            return {
                title: 'Hero Başlık',
                subtitle: 'Alt başlık metni',
                buttonText: 'Başla',
                buttonHref: '#',
                backgroundImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600'
            };
        case 'card':
            return { title: 'Kart Başlığı', description: 'Kart açıklaması', image: '' };
        case 'grid':
            return { columns: 3, gap: 24, items: [] };
        case 'video':
            return { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Video' };
        case 'gallery':
            return { images: [], columns: 3 };
        case 'accordion':
            return { items: [{ title: 'Soru 1', content: 'Cevap 1' }] };
        case 'tabs':
            return { tabs: [{ title: 'Sekme 1', content: 'İçerik 1' }] };
        case 'testimonial':
            return { quote: 'Harika bir deneyimdi!', author: 'Müşteri', role: 'CEO', avatar: '' };
        case 'pricing':
            return { title: 'Plan', price: '99', period: 'ay', features: ['Özellik 1', 'Özellik 2'], buttonText: 'Satın Al' };
        case 'feature':
            return { icon: 'zap', title: 'Özellik', description: 'Açıklama' };
        case 'cta':
            return { title: 'Harekete Geç!', description: 'Hemen başla', buttonText: 'Başla', buttonHref: '#' };
        case 'social':
            return { links: [{ platform: 'twitter', url: '#' }, { platform: 'instagram', url: '#' }] };
        case 'html':
            return { code: '<div>Özel HTML</div>' };
        case 'embed':
            return { url: 'https://example.com', height: 400 };
        default:
            return {};
    }
};

const getDefaultStyles = (): CMSModuleStyles => ({
    padding: '24px',
    margin: '0',
    textAlign: 'left',
    backgroundColor: 'transparent',
    textColor: 'inherit',
    borderRadius: '0',
});

const PageEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { isAdmin, profile } = useAuth();
    const [page, setPage] = useState<CMSPage | null>(null);
    const [modules, setModules] = useState<CMSModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModulePicker, setShowModulePicker] = useState(false);
    const [selectedModule, setSelectedModule] = useState<CMSModule | null>(null);
    const [showStyleEditor, setShowStyleEditor] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [previewMode, setPreviewMode] = useState(false);

    // Secret admin auth kontrolü
    const hasSecretAdminAuth = localStorage.getItem('silius_admin_auth') === 'true';

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [pageData, modulesData] = await Promise.all([
                db.getCMSPage(id),
                db.getCMSModules(id)
            ]);
            setPage(pageData as CMSPage);
            setModules(modulesData as CMSModule[]);
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

    const handleAddModule = async (type: CMSModuleType) => {
        if (!page) return;
        setSaving(true);
        try {
            const newModule = await db.saveCMSModule({
                page_id: page.id,
                module_type: type,
                content: getDefaultContent(type),
                styles: getDefaultStyles(),
                order_index: modules.length
            });
            if (newModule) {
                setModules([...modules, newModule as CMSModule]);
            }
            setShowModulePicker(false);
        } catch (error) {
            console.error('Add module error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        setSaving(true);
        try {
            await db.deleteCMSModule(moduleId);
            setModules(modules.filter(m => m.id !== moduleId));
            if (selectedModule?.id === moduleId) {
                setSelectedModule(null);
            }
        } catch (error) {
            console.error('Delete module error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateModule = async (moduleId: string, updates: Partial<CMSModule>) => {
        setSaving(true);
        try {
            await db.updateCMSModule(moduleId, updates);
            setModules(modules.map(m => m.id === moduleId ? { ...m, ...updates } : m));
            if (selectedModule?.id === moduleId) {
                setSelectedModule({ ...selectedModule, ...updates } as CMSModule);
            }
        } catch (error) {
            console.error('Update module error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newModules = [...modules];
        const draggedModule = newModules[draggedIndex];
        newModules.splice(draggedIndex, 1);
        newModules.splice(index, 0, draggedModule);

        setModules(newModules);
        setDraggedIndex(index);
    };

    const handleDragEnd = async () => {
        if (page && draggedIndex !== null) {
            const moduleIds = modules.map(m => m.id);
            await db.reorderCMSModules(page.id, moduleIds);
        }
        setDraggedIndex(null);
    };

    const handleSavePage = async () => {
        if (!page) return;
        setSaving(true);
        try {
            // Tüm modüllerin order_index'lerini güncelle
            const moduleIds = modules.map(m => m.id);
            await db.reorderCMSModules(page.id, moduleIds);
            alert('Sayfa kaydedildi!');
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    // Modül render fonksiyonu
    const renderModulePreview = (module: CMSModule) => {
        const { module_type, content, styles } = module;
        const baseStyle: React.CSSProperties = {
            padding: styles.padding,
            margin: styles.margin,
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            borderRadius: styles.borderRadius,
            textAlign: styles.textAlign as any,
        };

        switch (module_type) {
            case 'heading':
                const level = content.level || 'h2';
                const headingStyle = { ...baseStyle, fontWeight: 'bold' as const };
                if (level === 'h1') return <h1 style={headingStyle}>{content.text}</h1>;
                if (level === 'h3') return <h3 style={headingStyle}>{content.text}</h3>;
                if (level === 'h4') return <h4 style={headingStyle}>{content.text}</h4>;
                return <h2 style={headingStyle}>{content.text}</h2>;
            case 'text':
                return <p style={baseStyle}>{content.text}</p>;
            case 'image':
                return <img src={content.src} alt={content.alt} style={{ ...baseStyle, maxWidth: '100%', height: 'auto' }} />;
            case 'button':
                return (
                    <div style={baseStyle}>
                        <a href={content.href} className="inline-block px-6 py-3 bg-rose-500 text-white rounded-xl font-bold">
                            {content.text}
                        </a>
                    </div>
                );
            case 'spacer':
                return <div style={{ height: content.height || 60 }} />;
            case 'divider':
                return <hr style={{ ...baseStyle, borderColor: content.color }} />;
            case 'hero':
                return (
                    <div style={{
                        ...baseStyle,
                        backgroundImage: `url(${content.backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        padding: '80px 40px',
                        textAlign: 'center',
                        color: 'white'
                    }}>
                        <h1 className="text-4xl font-black mb-4">{content.title}</h1>
                        <p className="text-xl opacity-80 mb-6">{content.subtitle}</p>
                        <a href={content.buttonHref} className="inline-block px-8 py-4 bg-rose-500 rounded-2xl font-bold">
                            {content.buttonText}
                        </a>
                    </div>
                );
            case 'card':
                return (
                    <div style={{ ...baseStyle, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                        {content.image && <img src={content.image} alt="" className="w-full h-40 object-cover" />}
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-2">{content.title}</h3>
                            <p className="opacity-70">{content.description}</p>
                        </div>
                    </div>
                );
            case 'video':
                return (
                    <div style={baseStyle}>
                        <iframe
                            src={content.url}
                            title={content.title}
                            className="w-full aspect-video rounded-xl"
                            allowFullScreen
                        />
                    </div>
                );
            case 'testimonial':
                return (
                    <div style={{ ...baseStyle, textAlign: 'center' }}>
                        <p className="text-xl italic mb-4">"{content.quote}"</p>
                        <p className="font-bold">{content.author}</p>
                        <p className="opacity-60 text-sm">{content.role}</p>
                    </div>
                );
            case 'cta':
                return (
                    <div style={{ ...baseStyle, textAlign: 'center', padding: '60px 40px', backgroundColor: 'rgba(244,63,94,0.1)' }}>
                        <h2 className="text-3xl font-black mb-4">{content.title}</h2>
                        <p className="opacity-70 mb-6">{content.description}</p>
                        <a href={content.buttonHref} className="inline-block px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold">
                            {content.buttonText}
                        </a>
                    </div>
                );
            case 'html':
                return <div style={baseStyle} dangerouslySetInnerHTML={{ __html: content.code }} />;
            case 'embed':
                return (
                    <div style={baseStyle}>
                        <iframe src={content.url} style={{ width: '100%', height: content.height, border: 'none' }} />
                    </div>
                );
            default:
                return <div style={baseStyle} className="opacity-50">[ {module_type} modülü ]</div>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Sayfa bulunamadı</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Editor Header */}
            <div className="sticky top-0 z-50 glass border-b border-slate-500/10 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/pages')}
                            className="p-2 hover:bg-slate-500/10 rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="font-black uppercase">{page.title}</h1>
                            <p className="text-xs opacity-60">/{page.slug}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${previewMode ? 'bg-blue-500/10 text-blue-500' : 'glass'
                                }`}
                        >
                            <Eye size={16} /> {previewMode ? 'Düzenle' : 'Önizle'}
                        </button>
                        <button
                            onClick={handleSavePage}
                            disabled={saving}
                            className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Editor Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        {modules.length === 0 ? (
                            <div className="text-center py-20 glass-card rounded-3xl border-dashed border-2">
                                <Plus className="w-16 h-16 mx-auto mb-4 text-rose-500 opacity-50" />
                                <h3 className="text-xl font-black uppercase mb-2">Modül Ekle</h3>
                                <p className="opacity-60 mb-6">Sürükle-bırak ile sayfanı oluştur</p>
                                <button
                                    onClick={() => setShowModulePicker(true)}
                                    className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold"
                                >
                                    İlk Modülü Ekle
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {modules.map((module, index) => (
                                    <div
                                        key={module.id}
                                        draggable={!previewMode}
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => !previewMode && setSelectedModule(module)}
                                        className={`relative group transition-all ${previewMode
                                            ? ''
                                            : `cursor-move rounded-2xl ${selectedModule?.id === module.id
                                                ? 'ring-2 ring-rose-500'
                                                : 'hover:ring-2 hover:ring-rose-500/30'
                                            }`
                                            } ${draggedIndex === index ? 'opacity-50' : ''}`}
                                    >
                                        {!previewMode && (
                                            <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GripVertical className="text-slate-400" size={20} />
                                            </div>
                                        )}

                                        {renderModulePreview(module)}

                                        {!previewMode && (
                                            <div className="absolute -right-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedModule(module); setShowStyleEditor(true); }}
                                                    className="p-2 glass rounded-xl hover:bg-blue-500/10 text-blue-500"
                                                >
                                                    <Palette size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }}
                                                    className="p-2 glass rounded-xl hover:bg-red-500/10 text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!previewMode && modules.length > 0 && (
                            <button
                                onClick={() => setShowModulePicker(true)}
                                className="w-full mt-6 py-6 border-2 border-dashed border-slate-500/20 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 hover:border-rose-500/50 transition-all"
                            >
                                <Plus size={18} /> Modül Ekle
                            </button>
                        )}
                    </div>
                </div>

                {/* Properties Panel */}
                {selectedModule && !previewMode && (
                    <div className="w-80 border-l border-slate-500/10 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-sm uppercase">Özellikler</h3>
                            <button onClick={() => setSelectedModule(null)} className="p-1 hover:bg-slate-500/10 rounded">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="text-xs font-bold uppercase tracking-wider opacity-40 pb-2 border-b border-slate-500/10">
                                {MODULE_TYPES.find(m => m.type === selectedModule.module_type)?.label}
                            </div>

                            {/* İçerik editörü - modül tipine göre */}
                            {selectedModule.module_type === 'heading' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Metin</label>
                                        <input
                                            type="text"
                                            value={selectedModule.content.text || ''}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                content: { ...selectedModule.content, text: e.target.value }
                                            })}
                                            className="w-full glass rounded-xl px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Seviye</label>
                                        <select
                                            value={selectedModule.content.level || 'h2'}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                content: { ...selectedModule.content, level: e.target.value }
                                            })}
                                            className="w-full glass rounded-xl px-3 py-2 text-sm"
                                        >
                                            <option value="h1">H1</option>
                                            <option value="h2">H2</option>
                                            <option value="h3">H3</option>
                                            <option value="h4">H4</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {selectedModule.module_type === 'text' && (
                                <div>
                                    <label className="text-xs font-bold opacity-60 block mb-2">Metin</label>
                                    <textarea
                                        value={selectedModule.content.text || ''}
                                        onChange={e => handleUpdateModule(selectedModule.id, {
                                            content: { ...selectedModule.content, text: e.target.value }
                                        })}
                                        className="w-full glass rounded-xl px-3 py-2 text-sm h-32 resize-none"
                                    />
                                </div>
                            )}

                            {selectedModule.module_type === 'image' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Resim URL</label>
                                        <input
                                            type="text"
                                            value={selectedModule.content.src || ''}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                content: { ...selectedModule.content, src: e.target.value }
                                            })}
                                            className="w-full glass rounded-xl px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Alt Metin</label>
                                        <input
                                            type="text"
                                            value={selectedModule.content.alt || ''}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                content: { ...selectedModule.content, alt: e.target.value }
                                            })}
                                            className="w-full glass rounded-xl px-3 py-2 text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            {selectedModule.module_type === 'button' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Buton Metni</label>
                                        <input
                                            type="text"
                                            value={selectedModule.content.text || ''}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                content: { ...selectedModule.content, text: e.target.value }
                                            })}
                                            className="w-full glass rounded-xl px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Link</label>
                                        <input
                                            type="text"
                                            value={selectedModule.content.href || ''}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                content: { ...selectedModule.content, href: e.target.value }
                                            })}
                                            className="w-full glass rounded-xl px-3 py-2 text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            {selectedModule.module_type === 'spacer' && (
                                <div>
                                    <label className="text-xs font-bold opacity-60 block mb-2">Yükseklik (px)</label>
                                    <input
                                        type="number"
                                        value={selectedModule.content.height || 60}
                                        onChange={e => handleUpdateModule(selectedModule.id, {
                                            content: { ...selectedModule.content, height: parseInt(e.target.value) }
                                        })}
                                        className="w-full glass rounded-xl px-3 py-2 text-sm"
                                    />
                                </div>
                            )}

                            {selectedModule.module_type === 'video' && (
                                <div>
                                    <label className="text-xs font-bold opacity-60 block mb-2">Video URL (embed)</label>
                                    <input
                                        type="text"
                                        value={selectedModule.content.url || ''}
                                        onChange={e => handleUpdateModule(selectedModule.id, {
                                            content: { ...selectedModule.content, url: e.target.value }
                                        })}
                                        className="w-full glass rounded-xl px-3 py-2 text-sm"
                                    />
                                </div>
                            )}

                            {selectedModule.module_type === 'html' && (
                                <div>
                                    <label className="text-xs font-bold opacity-60 block mb-2">HTML Kodu</label>
                                    <textarea
                                        value={selectedModule.content.code || ''}
                                        onChange={e => handleUpdateModule(selectedModule.id, {
                                            content: { ...selectedModule.content, code: e.target.value }
                                        })}
                                        className="w-full glass rounded-xl px-3 py-2 text-sm h-40 resize-none font-mono"
                                    />
                                </div>
                            )}

                            {/* Stil editörü */}
                            <div className="pt-4 border-t border-slate-500/10">
                                <h4 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-4">Stil</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Arkaplan Rengi</label>
                                        <input
                                            type="color"
                                            value={selectedModule.styles.backgroundColor || '#000000'}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                styles: { ...selectedModule.styles, backgroundColor: e.target.value }
                                            })}
                                            className="w-full h-10 rounded-xl cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Metin Rengi</label>
                                        <input
                                            type="color"
                                            value={selectedModule.styles.textColor || '#ffffff'}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                styles: { ...selectedModule.styles, textColor: e.target.value }
                                            })}
                                            className="w-full h-10 rounded-xl cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Padding</label>
                                        <input
                                            type="text"
                                            value={selectedModule.styles.padding || '24px'}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                styles: { ...selectedModule.styles, padding: e.target.value }
                                            })}
                                            className="w-full glass rounded-xl px-3 py-2 text-sm"
                                            placeholder="örn: 20px"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Border Radius</label>
                                        <input
                                            type="text"
                                            value={selectedModule.styles.borderRadius || '0'}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                styles: { ...selectedModule.styles, borderRadius: e.target.value }
                                            })}
                                            className="w-full glass rounded-xl px-3 py-2 text-sm"
                                            placeholder="örn: 16px"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold opacity-60 block mb-2">Hizalama</label>
                                        <select
                                            value={selectedModule.styles.textAlign || 'left'}
                                            onChange={e => handleUpdateModule(selectedModule.id, {
                                                styles: { ...selectedModule.styles, textAlign: e.target.value as any }
                                            })}
                                            className="w-full glass rounded-xl px-3 py-2 text-sm"
                                        >
                                            <option value="left">Sol</option>
                                            <option value="center">Orta</option>
                                            <option value="right">Sağ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Module Picker Modal */}
            {showModulePicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowModulePicker(false)} />
                    <div className="relative w-full max-w-2xl glass-card rounded-3xl p-8 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black uppercase">Modül Ekle</h2>
                                <p className="text-sm opacity-60">Sayfa için modül seçin</p>
                            </div>
                            <button onClick={() => setShowModulePicker(false)} className="p-2 hover:bg-slate-500/10 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {MODULE_TYPES.map(({ type, label, icon: Icon, description }) => (
                                <button
                                    key={type}
                                    onClick={() => handleAddModule(type)}
                                    disabled={saving}
                                    className="p-4 glass rounded-2xl text-left hover:border-rose-500/30 transition-all group"
                                >
                                    <Icon className="text-rose-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                    <p className="font-bold text-sm">{label}</p>
                                    <p className="text-xs opacity-60">{description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageEditor;
