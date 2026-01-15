import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db';
import { CMSPage, CMSModule, CMSModuleStyles } from '../types';
import { Loader2, ArrowLeft } from 'lucide-react';

const CMSPageView: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState<CMSPage | null>(null);
    const [modules, setModules] = useState<CMSModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        loadPage();
    }, [slug]);

    const loadPage = async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const pageData = await db.getCMSPage(slug);
            if (pageData && pageData.is_published) {
                setPage(pageData as CMSPage);
                const modulesData = await db.getCMSModules(pageData.id);
                setModules(modulesData as CMSModule[]);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Load page error:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Modül render fonksiyonu
    const renderModule = (module: CMSModule) => {
        const { module_type, content, styles } = module;
        const baseStyle: React.CSSProperties = {
            padding: styles.padding,
            margin: styles.margin,
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            borderRadius: styles.borderRadius,
            textAlign: styles.textAlign as React.CSSProperties['textAlign'],
        };

        switch (module_type) {
            case 'heading':
                const level = content.level || 'h2';
                const headingClasses: Record<string, string> = {
                    h1: 'text-5xl font-black',
                    h2: 'text-4xl font-black',
                    h3: 'text-3xl font-bold',
                    h4: 'text-2xl font-bold',
                };
                return (
                    <div style={baseStyle}>
                        {level === 'h1' && <h1 className={headingClasses.h1}>{content.text}</h1>}
                        {level === 'h2' && <h2 className={headingClasses.h2}>{content.text}</h2>}
                        {level === 'h3' && <h3 className={headingClasses.h3}>{content.text}</h3>}
                        {level === 'h4' && <h4 className={headingClasses.h4}>{content.text}</h4>}
                    </div>
                );
            case 'text':
                return <p style={baseStyle} className="text-lg opacity-80 leading-relaxed">{content.text}</p>;
            case 'image':
                return (
                    <div style={baseStyle}>
                        <img src={content.src} alt={content.alt} className="max-w-full h-auto rounded-2xl" />
                    </div>
                );
            case 'button':
                return (
                    <div style={baseStyle}>
                        <a
                            href={content.href}
                            className="inline-block px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold text-lg hover:bg-rose-600 transition-all"
                        >
                            {content.text}
                        </a>
                    </div>
                );
            case 'spacer':
                return <div style={{ height: content.height || 60 }} />;
            case 'divider':
                return <hr style={{ ...baseStyle, borderColor: content.color }} className="border-t" />;
            case 'hero':
                return (
                    <div
                        style={{
                            ...baseStyle,
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${content.backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            padding: '120px 40px',
                            textAlign: 'center',
                            color: 'white'
                        }}
                        className="rounded-3xl"
                    >
                        <h1 className="text-5xl md:text-7xl font-black mb-6">{content.title}</h1>
                        <p className="text-xl md:text-2xl opacity-80 mb-10 max-w-2xl mx-auto">{content.subtitle}</p>
                        <a
                            href={content.buttonHref}
                            className="inline-block px-10 py-5 bg-rose-500 rounded-2xl font-black text-lg hover:bg-rose-600 transition-all"
                        >
                            {content.buttonText}
                        </a>
                    </div>
                );
            case 'card':
                return (
                    <div style={baseStyle} className="glass-card rounded-3xl overflow-hidden">
                        {content.image && <img src={content.image} alt="" className="w-full h-48 object-cover" />}
                        <div className="p-8">
                            <h3 className="text-2xl font-black mb-3">{content.title}</h3>
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
                            className="w-full aspect-video rounded-2xl"
                            allowFullScreen
                        />
                    </div>
                );
            case 'testimonial':
                return (
                    <div style={{ ...baseStyle, textAlign: 'center' }} className="glass-card rounded-3xl p-12">
                        <p className="text-2xl italic mb-6 opacity-90">"{content.quote}"</p>
                        <div className="flex items-center justify-center gap-4">
                            {content.avatar && (
                                <img src={content.avatar} alt={content.author} className="w-12 h-12 rounded-full" />
                            )}
                            <div>
                                <p className="font-bold">{content.author}</p>
                                <p className="opacity-60 text-sm">{content.role}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'cta':
                return (
                    <div
                        style={{ ...baseStyle, textAlign: 'center' }}
                        className="glass-card rounded-3xl p-16 bg-gradient-to-r from-rose-500/10 to-purple-500/10"
                    >
                        <h2 className="text-4xl font-black mb-4">{content.title}</h2>
                        <p className="text-xl opacity-70 mb-8 max-w-xl mx-auto">{content.description}</p>
                        <a
                            href={content.buttonHref}
                            className="inline-block px-10 py-5 bg-rose-500 text-white rounded-2xl font-bold text-lg hover:bg-rose-600 transition-all"
                        >
                            {content.buttonText}
                        </a>
                    </div>
                );
            case 'pricing':
                return (
                    <div style={baseStyle} className="glass-card rounded-3xl p-8 text-center">
                        <h3 className="text-2xl font-bold mb-2">{content.title}</h3>
                        <div className="text-5xl font-black my-6">
                            {content.price}<span className="text-lg opacity-60">/{content.period}</span>
                        </div>
                        <ul className="space-y-3 mb-8 text-left">
                            {(content.features || []).map((feature: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                    <span className="text-rose-500">✓</span> {feature}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold">
                            {content.buttonText}
                        </button>
                    </div>
                );
            case 'feature':
                return (
                    <div style={baseStyle} className="glass-card rounded-3xl p-8 text-center">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{content.title}</h3>
                        <p className="opacity-70">{content.description}</p>
                    </div>
                );
            case 'social':
                return (
                    <div style={baseStyle} className="flex items-center justify-center gap-4">
                        {(content.links || []).map((link: { platform: string; url: string }, i: number) => (
                            <a
                                key={i}
                                href={link.url}
                                className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-rose-500/10 transition-all"
                            >
                                {link.platform === 'twitter' && '𝕏'}
                                {link.platform === 'instagram' && '📷'}
                                {link.platform === 'facebook' && '📘'}
                                {link.platform === 'youtube' && '▶️'}
                            </a>
                        ))}
                    </div>
                );
            case 'html':
                return <div style={baseStyle} dangerouslySetInnerHTML={{ __html: content.code }} />;
            case 'embed':
                return (
                    <div style={baseStyle}>
                        <iframe
                            src={content.url}
                            style={{ width: '100%', height: content.height || 400, border: 'none' }}
                            className="rounded-2xl"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">404</h1>
                    <p className="opacity-60 mb-6">Sayfa bulunamadı</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold"
                    >
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 pb-32">
            <div className="max-w-5xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                    <ArrowLeft size={16} /> Geri
                </button>

                {/* Page Title */}
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12">
                    {page.title}
                </h1>

                {/* Modules */}
                <div className="space-y-8">
                    {modules.map(module => (
                        <div key={module.id}>
                            {renderModule(module)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CMSPageView;
