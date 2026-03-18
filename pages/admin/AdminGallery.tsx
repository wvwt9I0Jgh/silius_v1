import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../database';
import { SiteGalleryImage } from '../../types';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react';

const AdminGallery: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<SiteGalleryImage[]>([]);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const loadImages = async () => {
    const data = await db.getSiteGalleryImages();
    setImages(data);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lutfen sadece gorsel dosyasi secin.');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `site-gallery-${Date.now()}.${ext}`;
      const filePath = `site-gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const result = await db.addSiteGalleryImage(urlData.publicUrl, caption);
      if (!result) {
        throw new Error('Veritabani kaydi olusturulamadi.');
      }

      setCaption('');
      await loadImages();
    } catch (uploadErr: any) {
      setError(uploadErr?.message || 'Yukleme hatasi olustu.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Bu gorseli silmek istiyor musun?');
    if (!ok) return;

    await db.deleteSiteGalleryImage(id);
    await loadImages();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="p-3 glass rounded-2xl hover:bg-rose-500/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-outfit uppercase tracking-tighter">
              GALERI <span className="text-rose-500">YONETIMI</span>
            </h1>
            <p className="opacity-60 text-sm">Galeri gorsellerini ekle, listele ve sil</p>
          </div>
        </div>

        <section className="glass-card p-6 md:p-8 rounded-3xl mb-8">
          <h2 className="text-lg font-black uppercase tracking-wider mb-4">Yeni Gorsel Yukle</h2>

          <div className="grid md:grid-cols-[1fr_auto] gap-4 mb-4">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Aciklama (opsiyonel)"
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 outline-none focus:border-rose-500"
            />
            <label className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-500 text-white font-black uppercase tracking-wider cursor-pointer">
              <ImagePlus size={16} />
              {isUploading ? 'Yukleniyor...' : 'Dosya Sec'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((item) => (
            <article key={item.id} className="glass-card rounded-2xl overflow-hidden">
              <img src={item.image_url} alt={item.caption || 'Galeri'} className="w-full h-56 object-cover" />
              <div className="p-4">
                <p className="text-sm opacity-80 min-h-[2.5rem]">{item.caption || 'Aciklama yok'}</p>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                >
                  <Trash2 size={14} />
                  Sil
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AdminGallery;
