# 🌐 Silius Community Platform

> **v1.0.0 — Community Edition**  
> Gençleri fiziksel etkinlikler etrafında buluşturan, mobil öncelikli sosyal topluluk platformu.

---

## 📖 Proje Hakkında

Silius; Muğla bölgesindeki 18–30 yaş arası gençlere yönelik geliştirilmiş, dijital ve gerçek dünya deneyimlerini **"vibe"** (etkinlik), arkadaşlık ağları, QR check-in ve topluluk etkileşimi üzerinden birleştiren modern bir sosyal platformdur.

Kullanıcılar; sessiz bir kahve buluşmasından gece kulübü partisine kadar her türlü etkinliği oluşturabilir, keşfedebilir ve katılabilir. Platform algoritma baskısı olmadan arkadaşlık ve bağlantı kurma üzerine inşa edilmiştir.

---

## 🚀 Özellikler

### 👤 Kimlik Doğrulama
- E-posta / Şifre ile kayıt ve giriş
- Google OAuth 2.0 ile tek tıkla sosyal giriş
- Zorunlu KVKK onayı (Türkiye veri gizliliği uyumluluğu)
- Session Storage tabanlı oturum (tarayıcı kapandığında sona erer)
- Gizli admin paneli erişimi (logoya 3 kez tıklama)

### 🎉 Vibe (Etkinlik) Sistemi
- 8 kategori: Club, Rave, Beach, House, Street, Pub, Coffee, Other
- Etkinlik oluşturma (başlık, açıklama, konum, tarih, görsel, kategori)
- Harita destekli konum seçici
- Günlük 3 vibe oluşturma limiti
- Etkinlik galerisi (çoklu fotoğraf yükleme)
- Katılımcı sayısı ve canlı check-in sayacı
- Etkinlik yorumları, yanıtlar ve iç içe yorum sistemi

### 📱 QR Check-in Sistemi
- Her etkinlik için benzersiz QR kod oluşturma
- Kamera ile QR kod tarama ve check-in
- Canlı (live) katılımcı sayısı (real-time)
- Check-in başına vibe puanı kazanma

### 🏆 Vibe Skoru
Kullanıcıların platform katkılarını ölçen itibar sistemi:

```
Vibe Skoru = (Oluşturulan Etkinlik × 10) + (Katıldığı Etkinlik × 5) + (Geçirilen Süre / 50)
```

### 👥 Sosyal Özellikler
- Tek yönlü arkadaşlık sistemi (Twitter modeli)
- Kullanıcı keşfetme ve profil görüntüleme
- Arkadaş ekleme / çıkarma
- Kimler beni ekledi görünümü

### 🛡️ Admin Paneli
- Kullanıcı yönetimi (rol değiştirme, silme)
- Kullanıcı ve IP banlama sistemi
- Etkinlik moderasyonu
- CMS: Dinamik sayfa ve modül editörü
- Platform istatistikleri

### 📝 CMS (İçerik Yönetim Sistemi)
21 farklı modül tipi destekler: `text`, `heading`, `image`, `button`, `spacer`, `card`, `hero`, `grid`, `video`, `divider`, `accordion`, `tabs`, `gallery`, `testimonial`, `pricing`, `feature`, `cta`, `social`, `html`, `embed`

---

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji | Versiyon |
|--------|-----------|---------|
| **Frontend Framework** | React | 19.2.3 |
| **Dil** | TypeScript | 5.8.2 |
| **Build Tool** | Vite | 6.2.0 |
| **CSS Framework** | Tailwind CSS | 4.1.18 |
| **Routing** | React Router DOM | 7.11.0 |
| **Backend / DB** | Supabase (PostgreSQL) | 2.39.0 |
| **Auth** | Supabase Auth + Google OAuth | — |
| **QR Kod** | react-qr-code + html5-qrcode | 2.0.18 / 2.3.8 |
| **İkonlar** | Lucide React | 0.562.0 |
| **Bildirimler** | React Hot Toast | 2.6.0 |
| **Web Sunucu** | Nginx | 1.27 |
| **Container** | Docker + Docker Compose | — |
| **Node Build** | Node.js | 20 |

---

## 📁 Proje Yapısı

```
silius-community-platform/
├── App.tsx                    # Ana router ve layout
├── index.tsx                  # Uygulama giriş noktası & OAuth callback
├── database.ts                # Tüm veritabanı operasyonları (45+ metod)
├── types.ts                   # TypeScript arayüzleri
├── vite.config.ts             # Vite build yapılandırması
├── tailwind.config.js         # Tailwind tema ayarları
│
├── lib/
│   └── supabase.ts            # Supabase istemci başlatma
│
├── context/
│   ├── AuthContext.tsx        # Kimlik doğrulama & kullanıcı state
│   └── ThemeContext.tsx       # Karanlık/Aydınlık mod state
│
├── components/
│   ├── Navbar.tsx             # Alt navigasyon çubuğu
│   ├── BanScreen.tsx          # Ban bildirim ekranı
│   ├── LocationPicker.tsx     # Harita tabanlı konum seçici
│   ├── MapDisplay.tsx         # Konum gösterim bileşeni
│   └── VideoBackground.tsx    # Video arka plan efektleri
│
├── pages/
│   ├── Landing.tsx            # Karşılama sayfası
│   ├── Auth.tsx               # Giriş / Kayıt
│   ├── ProfileSetup.tsx       # İlk giriş profil tamamlama
│   ├── Home.tsx               # Etkinlik akışı & vibe oluşturma
│   ├── EventDetail.tsx        # Etkinlik detayı & katılım
│   ├── Profile.tsx            # Kullanıcı profili & istatistikler
│   ├── Friends.tsx            # Arkadaş yönetimi
│   ├── Users.tsx              # Kullanıcı keşif sayfası
│   ├── MyQR.tsx               # QR kodlarım
│   ├── CheckInPage.tsx        # QR check-in sayfası
│   ├── Vibeler.tsx            # Platform canlı istatistikleri
│   ├── Topluluk.tsx           # Topluluk & sponsor bilgisi
│   ├── Mekanlar.tsx           # Popüler mekanlar dizini
│   ├── CMSPageView.tsx        # Dinamik CMS sayfa görüntüleyici
│   ├── About.tsx              # Hakkında
│   ├── Contact.tsx            # İletişim
│   ├── Security.tsx           # Güvenlik & gizlilik
│   ├── Admin.tsx              # Admin panel dashboard
│   └── admin/
│       ├── AdminUsers.tsx     # Kullanıcı yönetim paneli
│       ├── AdminVibes.tsx     # Etkinlik yönetim paneli
│       ├── AdminPages.tsx     # CMS sayfa yönetimi
│       ├── AdminBans.tsx      # Ban yönetim arayüzü
│       └── PageEditor.tsx     # CMS sayfa editörü
│
├── data/
│   └── venues.ts              # Statik mekan verileri
│
├── Dockerfile                 # Çok aşamalı Docker build
├── docker-compose.yml         # Docker Compose yapılandırması
└── nginx.conf                 # Nginx SPA routing yapılandırması
```

---

## 🗄️ Veritabanı Şeması

### Tablolar

| Tablo | Açıklama |
|-------|---------|
| `users` | Kullanıcı profilleri, roller, vibe skoru, KVKK onayı |
| `events` | Etkinlikler (vibe'lar), kategori, konum, QR kodu |
| `event_participants` | Katılım ve check-in kayıtları |
| `event_gallery` | Etkinlik fotoğraf galerileri |
| `comments` | Etkinlik yorumları ve iç içe yanıtlar |
| `friends` | Tek yönlü arkadaşlık ilişkileri |
| `notifications` | Kullanıcı bildirimleri |
| `banned_users` | Yasaklı kullanıcılar (geçici/kalıcı) |
| `banned_ips` | Yasaklı IP adresleri |
| `cms_pages` | Dinamik CMS sayfaları |
| `cms_modules` | CMS sayfa modülleri |

---

## ⚙️ Kurulum

### Gereksinimler
- Node.js 20+
- npm 10+
- Supabase hesabı

### 1. Repo'yu klonla

```bash
git clone https://github.com/wvwt9I0Jgh/silius_v1.git
cd silius_v1
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Ortam değişkenlerini ayarla

Proje kök dizininde `.env` dosyası oluştur:

```env
VITE_SUPABASE_URL=https://PROJE_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> **Not:** Bu değerleri Supabase Dashboard → Settings → API bölümünden alabilirsiniz.

### 4. Veritabanını kur

Supabase Dashboard → SQL Editor'de şu dosyayı çalıştır:

```
complete-database-setup.sql
```

Ardından gerekli migration'ları sırayla çalıştır:

```
migration-profile-setup.sql
migration-add-gender.sql
migration-add-kvkk.sql
migration-add-location-coords.sql
migration-add-checkin.sql
migration-event-gallery.sql
migration-vibe-score.sql
migration-add-pub-category.sql
migration-add-coffee-category.sql
```

### 5. Geliştirme sunucusunu başlat

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

---

## 🐳 Docker ile Çalıştırma

```bash
docker-compose up --build
```

Uygulama `http://localhost:3000` adresinde çalışır.

---

## ☁️ Cloudflare Pages'e Deploy

### 1. GitHub'a push et

```bash
git add .
git commit -m "deploy"
git push
```

### 2. Cloudflare Dashboard

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages**
2. **Connect to Git** → GitHub hesabını bağla → Repo'yu seç
3. Build ayarları:

| Ayar | Değer |
|------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |

4. **Environment variables** ekle:

| Değişken | Değer |
|----------|-------|
| `VITE_SUPABASE_URL` | Supabase proje URL'in |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key'in |

5. **Save and Deploy** → Birkaç dakika sonra canlıya alınır.

### 3. Supabase ayarlarını güncelle

Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL:** `https://proje-adin.pages.dev`
- **Redirect URLs:** `https://proje-adin.pages.dev` ekle

---

## 🔒 Kullanıcı Rolleri

| Rol | Erişim |
|-----|--------|
| **Anonim** | Landing, Auth sayfaları |
| **Kullanıcı** | Tüm ana özellikler |
| **Admin** | Admin paneli + tüm kullanıcı özellikleri |
| **Banlı Kullanıcı** | Yalnızca ban ekranı |

---

## 📜 Komutlar

```bash
npm run dev       # Geliştirme sunucusu (port 3000)
npm run build     # Production build → dist/
npm run preview   # Build önizleme
```

---

## 🤝 Katkıda Bulunma

1. Fork'la
2. Feature branch oluştur (`git checkout -b feature/ozellik-adi`)
3. Değişikliklerini commit et (`git commit -m 'Yeni özellik ekle'`)
4. Branch'i push et (`git push origin feature/ozellik-adi`)
5. Pull Request aç

---

## 📄 Lisans

Bu proje **Community Edition** olarak yayınlanmıştır.

---

## 🙏 Teşekkürler

- **Sponsor:** [SpeedSmm / Qukpanel](https://github.com/SpeedSmm)
- **Supabase** — Backend altyapısı için
- **Cloudflare** — Hosting ve CDN için
- **Tailwind CSS** — Modern UI sistemi için
