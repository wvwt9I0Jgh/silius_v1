import React, { useEffect, useState } from 'react';
import { db } from '../database';
import { SiteGalleryImage } from '../types';
import { Camera, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

const Galerimiz: React.FC = () => {
  const [images, setImages] = useState<SiteGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        const data = await db.getSiteGalleryImages();
        setImages(data);
      } catch (error) {
        console.error("Galeri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  return (
    <div className="min-h-screen px-4 pb-24 pt-24 md:py-28 bg-[#05030A] text-text-main relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-fade-in-up">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-black uppercase tracking-[0.25em] mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Camera size={14} />
              Geceye Dair
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-white/60 drop-shadow-sm">
              Galerimiz
            </h1>
            <p className="mt-6 text-lg text-white/50 leading-relaxed font-medium">
              Silius topluluğunun en özel anları. Gecelerden, partilerden ve buluşmalardan dondurduğumuz kareler.
            </p>
          </div>

          <div className="flex bg-white/[0.02] border border-white/5 rounded-2xl p-4 backdrop-blur-sm self-start">
            <div className="text-center px-6 border-r border-white/5">
              <p className="text-2xl font-black text-white">{loading ? '-' : images.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Görsel</p>
            </div>
            <div className="text-center px-6">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Anı</p>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-white/40 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <span className="text-sm font-bold uppercase tracking-widest">Anılar Yükleniyor...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center border border-white/5 bg-white/[0.01] rounded-[2.5rem] backdrop-blur-sm p-10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-20 h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/20 mb-6">
              <ImageIcon size={32} />
            </div>
            <h3 className="text-2xl font-black text-white/80 mb-2">Henüz Görsel Yok</h3>
            <p className="text-white/40 max-w-md">
              Şu an için galerimizde bir fotoğraf bulunmuyor. Çok yakında eklenecek olan anılar için beklemede kalın.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((item, index) => (
              <div
                key={item.id}
                className="break-inside-avoid rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] group relative cursor-pointer"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Image Wrapper */}
                <div className="relative overflow-hidden w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05030A] via-[#05030A]/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10" />
                  <img
                    src={item.image_url}
                    alt={item.caption || 'Galeri görseli'}
                    className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Caption Overlay */}
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-sm font-medium text-white/90 drop-shadow-md line-clamp-3 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>
                  )}

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 ring-1 ring-inset ring-indigo-500/30 rounded-3xl transition-opacity duration-500 z-20" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Galerimiz;