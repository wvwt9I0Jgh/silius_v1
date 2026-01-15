<div align="center">

# 🌟 Silius Community Platform

### *Her An Bir Vibe - Gerçek Bağlantılar İçin Sosyal Platform*

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Demo](https://silius-v1.vercel.app) • [Ana Sponsor: SpeedSmm](https://github.com/codedByCan/SpeedSmm_v3) • [İletişim](#-iletişim)

</div>

---

## 📖 Proje Hakkında

**Silius**, modern dijital çağda gerçek sosyal bağlantıları yeniden canlandırmayı hedefleyen yeni nesil bir topluluk platformudur. Sadece bir sosyal ağ değil, **yaşam tarzı** odaklı bir ekosistem sunar.

### 🎯 Amaç ve Vizyon

> *"Gerçek hayattaki sosyalleşmeyi dijitalle harmanlayarak, her ruh haline uygun topluluklar oluşturmak."*

Silius, yüzeysel dijital etkileşimlerin ötesine geçerek:
- ✨ **Anlamlı Bağlantılar:** Ortak ilgi alanlarına sahip kişilerle tanışın
- 🌍 **Topluluk Gücü:** Kendi "kabilenizi" oluşturun veya mevcut topluluklara katılın
- 🎭 **Her Vibe İçin Alan:** Sabah kahvesinden gece partilerine - her ruh haline uygun etkinlikler
- 🔒 **Güvenli Ortam:** KVKK uyumlu, kullanıcı güvenliği öncelikli platform

---

## ✨ Öne Çıkan Özellikler

### 🎨 Kullanıcı Deneyimi
- **Dual Theme (Gece/Gündüz Modu):** Tüm sayfalarda dinamik tema desteği
- **Responsive Tasarım:** Mobil, tablet ve masaüstünde sorunsuz deneyim
- **Modern UI/UX:** Gradient efektler, animasyonlar ve glassmorphism tasarım
- **Canlı İstatistikler:** Gerçek zamanlı kullanıcı ve etkinlik verileri

### 👤 Kullanıcı Yönetimi
- **Güvenli Kayıt/Giriş:** Supabase Auth ile e-posta doğrulamalı sistem
- **KVKK Uyumluluğu:** Kayıt sırasında zorunlu aydınlatma metni onayı
- **Profil Özelleştirme:** Avatar, bio, cinsiyet tercihleri
- **Arkadaşlık Sistemi:** Arkadaş ekleme, çıkarma ve listeleme

### 🎉 Etkinlik Yönetimi
- **Etkinlik Oluşturma:** Kategorilere göre özel etkinlikler (Parti, Kahve, Çalışma, Spor vb.)
- **Katılım Sistemi:** Etkinliklere katılma/ayrılma
- **Yorum Sistemi:** Etkinlikler altında tartışma ortamı
- **Görsel Paylaşım:** Unsplash entegrasyonlu otomatik görsel desteği

### 🌈 Vibe Keşfi
Farklı ruh hallerine özel topluluk "vibe"ları:
- **🔇 Sessiz Üretim** - Odak Modu
- **☕ Sabah Ritüeli** - Huzurlu Anlar
- **🌃 Gece Keşfi** - Yüksek Enerji
- **🏞️ Açık Hava** - Denge

---

## 🛠️ Teknoloji Stack

### Frontend
```typescript
- React 18.3.1          // Modern UI kütüphanesi
- TypeScript 5.6.2      // Tip güvenli kod
- Vite 5.4.11          // Hızlı build tool
- React Router 7.1.1    // SPA routing
- Tailwind CSS 3.4      // Utility-first CSS
- Lucide React 0.469.0  // İkon kütüphanesi
```

### Backend & Database
```typescript
- Supabase              // BaaS (Backend as a Service)
  ├─ Auth               // Kullanıcı doğrulama
  ├─ PostgreSQL         // İlişkisel veritabanı
  ├─ Storage            // Dosya depolama
  └─ RLS Policies       // Satır seviyesi güvenlik
```

### Database Schema
```sql
Tables:
├─ users                // Kullanıcı profilleri (KVKK consent dahil)
├─ events               // Etkinlikler
├─ event_participants   // Katılımcılar
└─ comments             // Yorumlar
```

---

## 📸 Ekran Görüntüleri

### 🏠 Ana Sayfa (Landing Page)
> İhtişamlı hero section, hareketli slider, servis kartları ve vibe galeri

![Landing Page - Hero](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Hero+Section+-+ANI+PAYLAS)
*Parallax efektli hero başlığı ve CTA butonları*

![Landing Page - Marquee](https://via.placeholder.com/800x200/EC4899/FFFFFF?text=KAHVE+SOHBETLERI+-+CALISMA+GRUPLARI+-+NEON+GECELERI)
*Hareketli vibe slider - 9xl büyüklüğünde parlak yazılar*

![Landing Page - Services](https://via.placeholder.com/800x400/6366F1/FFFFFF?text=Hizmetlerimiz+-+Arkadas+Bul+-+Eglence+-+Topluluk)
*Hover efektli servis kartları ve görseller*

---

### 🔐 Kayıt/Giriş Sayfası
> KVKK uyumlu kayıt formu

![Auth Page](https://via.placeholder.com/800x500/0F172A/FFFFFF?text=KVKK+Onay+Formu+ile+Kayit)
*KVKK aydınlatma metni ve checkbox zorunluluğu*

---

### 📊 Vibeler (İstatistikler)
> Canlı kullanıcı ve vibe istatistikleri

![Vibeler Page](https://via.placeholder.com/800x400/1E293B/FFFFFF?text=Canli+Istatistikler+-+146+Kullanici+-+87+Vibe)
*Gerçek zamanlı veritabanı verileri ile güncellenme*

---

### 🏘️ Topluluk Sayfası
> Sponsor ve açık kaynak bilgileri

![Topluluk Page](https://via.placeholder.com/800x400/312E81/FFFFFF?text=SpeedSmm+Sponsor+-+Silius+v1+Open+Source)
*Ana sponsor ve proje bilgileri kartları*

---

### 🎯 Mekanlar (Etkinlikler)
> Tüm etkinliklerin listelendiği sayfa

![Mekanlar Page](https://via.placeholder.com/800x500/1E293B/FFFFFF?text=Populer+Mekanlar+-+Event+Cards)
*Kategori badge'leri ve hover animasyonları*

---

### 🏠 Kullanıcı Ana Sayfası (Home)
> Giriş yapan kullanıcıların etkinlik akışı

![Home Feed](https://via.placeholder.com/800x600/0F172A/FFFFFF?text=Event+Feed+-+Create+Join+Comment)
*Etkinlik oluşturma, katılma ve yorum yapma*

---

### 👤 Profil Sayfası
> Kullanıcı profil yönetimi

![Profile Page](https://via.placeholder.com/800x500/1E293B/FFFFFF?text=Profil+Duzenle+-+Avatar+-+Bio+-+Gender)
*Profil düzenleme formu ve avatar yönetimi*

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Supabase hesabı

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/wvwt9I0Jgh/silius_v1.git
cd silius_v1
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Supabase Kurulumu

#### 3.1. Supabase Projesi Oluşturun
1. [supabase.com](https://supabase.com) → Yeni proje oluşturun
2. API Keys'i kopyalayın

#### 3.2. Environment Dosyasını Oluşturun
`.env` dosyası oluşturun:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 3.3. Veritabanı Schema'sını Yükleyin
Supabase Dashboard → SQL Editor → New Query

**Sırayla çalıştırın:**
1. `supabase-schema.sql` - Tablo yapısı
2. `fix-rls-policy.sql` - Güvenlik politikaları

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcıda: `http://localhost:5173`

---

## 📂 Proje Yapısı

```
silius-community-platform/
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   │   └── Navbar.tsx      # Navigasyon menüsü
│   ├── context/            # React Context API
│   │   └── AuthContext.tsx # Kimlik doğrulama state yönetimi
│   ├── lib/                # Kütüphane konfigürasyonları
│   │   └── supabase.ts     # Supabase client
│   ├── pages/              # Sayfa bileşenleri
│   │   ├── Landing.tsx     # Ana sayfa (public)
│   │   ├── Auth.tsx        # Kayıt/Giriş (KVKK formu)
│   │   ├── Home.tsx        # Kullanıcı akışı
│   │   ├── Vibeler.tsx     # İstatistikler
│   │   ├── Topluluk.tsx    # Sponsor bilgileri
│   │   ├── Mekanlar.tsx    # Etkinlik listesi
│   │   ├── Profile.tsx     # Profil yönetimi
│   │   └── ...             # Diğer sayfalar
│   ├── App.tsx             # Ana uygulama bileşeni
│   ├── db.ts               # Veritabanı işlemleri
│   └── types.ts            # TypeScript tip tanımlamaları
├── public/                 # Statik dosyalar
├── supabase-schema.sql     # Veritabanı şeması
├── fix-rls-policy.sql      # RLS politikaları
├── migration-add-kvkk.sql  # KVKK alanları
├── package.json            # Proje bağımlılıkları
├── tailwind.config.js      # Tailwind konfigürasyonu
├── tsconfig.json           # TypeScript konfigürasyonu
└── vite.config.ts          # Vite konfigürasyonu
```

---

## 🔐 Güvenlik

### KVKK Uyumluluğu
- ✅ Kayıt sırasında zorunlu aydınlatma metni
- ✅ Kullanıcı onay tarihi veritabanında saklanıyor
- ✅ Veriler güvenli şekilde Supabase'de tutuluyor

### Row Level Security (RLS)
Tüm tablolarda satır seviyesi güvenlik:
- Kullanıcılar sadece kendi verilerini düzenleyebilir
- Public veriler herkes tarafından görüntülenebilir
- İzinsiz veri erişimi engellenmiştir

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📝 Lisans

Bu proje açık kaynak kodludur ve community edition olarak sunulmaktadır.

---

## 💼 Sponsorlar ve Topluluk

### 🌟 Ana Sponsor
**[SpeedSmm (Qukpanel)](https://github.com/codedByCan/SpeedSmm_v3)**
> Sosyal medya paneli projesi - Projeyi destekleyen ana sponsor

### 🏆 Açık Kaynak Proje
**[Silius Community v1](https://github.com/wvwt9I0Jgh/silius_v1)**
> GitHub üzerinde community edition olarak yayınlanmıştır

---

## 📞 İletişim

- **GitHub:** [wvwt9I0Jgh](https://github.com/wvwt9I0Jgh)
- **Proje Linki:** [silius_v1](https://github.com/wvwt9I0Jgh/silius_v1)
- **Ana Sponsor:** [SpeedSmm](https://github.com/codedByCan/SpeedSmm_v3)

---

<div align="center">

### 🌟 Geleceğin Sosyal Bağlantısı İçin İnşa Edildi

**Silius** - *Her An Bir Vibe*

[![GitHub Stars](https://img.shields.io/github/stars/wvwt9I0Jgh/silius_v1?style=social)](https://github.com/wvwt9I0Jgh/silius_v1)
[![GitHub Forks](https://img.shields.io/github/forks/wvwt9I0Jgh/silius_v1?style=social)](https://github.com/wvwt9I0Jgh/silius_v1)

</div>
