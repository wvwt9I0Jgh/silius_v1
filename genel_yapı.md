# Silius Community Platform - Genel Yapı Belgesi

Bu belge, Silius Community Platform projesinin backend ve frontend mimarisini, dosya organizasyonunu ve temel işleyişini kapsamlı bir şekilde açıklamaktadır.

---

## 📌 Proje Özeti

**Silius Community Platform**, insanların etkinliklere katılabildiği, arkadaş bağlantıları kurabileceği, profil oluşturabileceği ve sosyal etkileşimde bulunabileceği bir web uygulamasıdır. Mobil dostu arayüz ile etkinlik yönetimi, QR kod ile check-in sistemi ve admin paneli içerir.

---

## 🏗️ Mimari Genel Bakış

```
┌─────────────────────────────────────────┐
│   FRONTEND (React + TypeScript)         │
│   ├─ Pages (Ana Sayfalar)             │
│   ├─ Components (Reusable Bileşenler) │
│   ├─ Context (Global State)           │
│   └─ Styling (Tailwind CSS)           │
└────────────┬────────────────────────────┘
             │
             │ HTTP/WebSocket
             │
┌────────────▼────────────────────────────┐
│   BACKEND (Supabase)                    │
│   ├─ PostgreSQL Database               │
│   ├─ Authentication (Auth)             │
│   ├─ Real-time Updates                 │
│   └─ Row Level Security (RLS)          │
└─────────────────────────────────────────┘
```

---

## 🎯 FRONTEND (React)

### Teknoloji Stack

| Tool | Versiyon | Amaç |
|------|----------|------|
| **React** | 19.2.3 | UI framework |
| **TypeScript** | 5.8.2 | Type-safe JavaScript |
| **Vite** | 6.2.0 | Build tool ve dev server |
| **React Router** | 7.11.0 | Sayfa yönlendirmesi |
| **Tailwind CSS** | 4.1.18 | Stil ve layout |
| **Lucide React** | 0.562.0 | Icon library |
| **Supabase JS** | 2.39.0 | Backend API client |
| **React Hot Toast** | 2.6.0 | Bildirim mesajları |
| **React QR Code** | 2.0.18 | QR kod görüntüleme |

### Klasör Yapısı

```
src/
├── pages/                      # Ana sayfalar (birer ekran)
│   ├── Landing.tsx            # Giriş sayfası
│   ├── Auth.tsx               # Giriş/Kayıt sayfası
│   ├── Home.tsx               # Ana sayfa (etkinlikler listesi)
│   ├── Profile.tsx            # Kullanıcı profili
│   ├── ProfileSetup.tsx       # İlk kayıt sonrası profil oluşturma
│   ├── ProfileCompletionModal.tsx # Profil tamamlama modal
│   ├── EventDetail.tsx        # Etkinlik detayları
│   ├── CheckInPage.tsx        # QR kod ile giriş
│   ├── MyQR.tsx               # Kendi QR kodunu gösterme
│   ├── Friends.tsx            # Arkadaş listesi
│   ├── Users.tsx              # Tüm kullanıcılar
│   ├── Vibeler.tsx            # Vibe score sıralaması (leaderboard)
│   ├── Topluluk.tsx           # Topluluk sayfası
│   ├── Mekanlar.tsx           # Mekanlar/Venues
│   ├── About.tsx              # Hakkında
│   ├── Contact.tsx            # İletişim
│   ├── Guidelines.tsx         # Topluluk kuralları
│   ├── Security.tsx           # Güvenlik ayarları
│   ├── CMSPageView.tsx        # CMS sayfalarını gösterme
│   ├── Admin.tsx              # Admin paneli ana sayfa
│   ├── AdminPanel.tsx         # Admin kontrol paneli
│   └── admin/                 # Alt admin sayfaları
│       ├── AdminUsers.tsx     # Kullanıcı yönetimi
│       ├── AdminVibes.tsx     # Vibe yönetimi
│       ├── AdminPages.tsx     # CMS sayfaları yönetimi
│       ├── AdminBans.tsx      # Ban yönetimi
│       ├── PageEditor.tsx     # CMS editörü
│       └── admin-operations.ts # Admin işlemleri utility
│
├── components/                # Reusable UI bileşenleri
│   ├── Navbar.tsx            # Üst navigasyon bar
│   ├── BanScreen.tsx         # Yasaklı kullanıcı ekranı
│   ├── LocationPicker.tsx    # Konum seçici widget
│   ├── MapDisplay.tsx        # Harita görüntüleme
│   └── VideoBackground.tsx   # Video arka planı
│
├── context/                   # Global state management
│   ├── AuthContext.tsx       # Kullanıcı auth state (login, profile, vb.)
│   └── ThemeContext.tsx      # Dark/Light mode geçişi
│
├── lib/                       # Utility ve kütüphaneler
│   └── supabase.ts          # Supabase client instance
│
├── data/                      # Static veriler
│   └── venues.ts            # Mekanlar listesi
│
├── App.tsx                    # Root component + routing
├── index.tsx                  # Entry point
├── types.ts                   # TypeScript interface'leri
└── index.css                  # Global stil
```

### Sayfa Yönlendirmesi (Routes)

```
/                 → Landing (giriş sayfası)
/auth             → Auth (giriş/kayıt)
/home             → Home (ana sayfa)
/profile          → Profile (kullanıcı profili)
/profile-setup    → ProfileSetup (ilk kurulum)
/event/:id        → EventDetail (etkinlik detayları)
/checkin          → CheckInPage (QR check-in)
/myqr             → MyQR (kendi QR kodu)
/friends          → Friends (arkadaşlar)
/users            → Users (önerilen kullanıcılar)
/vibeler          → Vibeler (leaderboard)
/topluluk         → Topluluk (topluluk sayfası)
/mekanlar         → Mekanlar (mekanlar listesi)
/about            → About (hakkında)
/contact          → Contact (iletişim)
/guidelines       → Guidelines (kurallar)
/security         → Security (güvenlik)
/cms/:page        → CMSPageView (CMS sayfaları)
/admin            → Admin (admin paneli)
/admin/users      → AdminUsers (kullanıcı yönetimi)
/admin/vibes      → AdminVibes (vibe yönetimi)
/admin/pages      → AdminPages (sayfa yönetimi)
/admin/bans       → AdminBans (ban yönetimi)
```

### Önemli Komponenti ve Işlevleri

#### **AuthContext.tsx** - Kimlik Doğrulama ve Kullanıcı Yönetimi
- **Sağladığı State:**
  - `user`: Supabase auth user
  - `profile`: Kullanıcı profil bilgileri (ad, email, bio, avatar, vb.)
  - `loading`: Yükleme durumu
  - `isBanned`: Yasaklı mı kontrolü
  - `banInfo`: Yasaklama sebebi ve tarihi

- **Sağladığı Fonksiyonlar:**
  - `signUp()`: Yeni hesap oluşturma
  - `signIn()`: Email/şifre ile giriş
  - `signInWithGoogle()`: Google OAuth giriş
  - `signOut()`: Çıkış
  - `updateProfile()`: Profil güncelleme
  - `refreshProfile()`: Profil yenileme

- **Özellikler:**
  - Profile caching (10 dakika) - hızlı yükleme
  - Otomatik token yenileme
  - Ban kontrolleri
  - SessionStorage kullanarak session güvenliği

#### **ThemeContext.tsx** - Tema Yönetimi
- Dark/Light mode geçişi
- localStorage'da tema ayarı kaydedilir

#### **App.tsx** - Root Component
- Tüm sayfaları Route içinde tanımlar
- **Korumalı Rotalar (ProtectedRoute):**
  - Giriş yapmış kullanıcılara özel sayfalar
  - Profili tamamlanmamışları ProfileSetup'a yönlendir
- **Admin Rotaları (AdminRoute):**
  - Sadece admin rolü veya secret admin auth
  - Secret token ile kalıcı admin giriş
- **Loading durumu yönetimi**
- **Ban kontrolleri** - yasaklı kullanıcıları BanScreen'e yönlendir

### Stil Sistemi (Tailwind CSS)

- **Config**: `tailwind.config.js`
- **CSS**: `src/index.css`
- **PostCSS Transform**: `postcss.config.js`
- Renk Paletesi: Slate (gri), Rose (pembe - accent)
- Dark mode: Sınıf tabanlı (`dark:`)

---

## 🗄️ BACKEND (Supabase)

### Veritabanı Yapısı

Supabase, PostgreSQL temelli bir BaaS (Backend as a Service) sağlayıcıdır. Tüm veri işlemleri Supabase API üzerinden REST/WebSocket ile yapılır.

#### Veritabanı Tabloları

```
📊 DATABASE
│
├── users
│   ├── id (Primary Key)
│   ├── email (Unique)
│   ├── firstName, lastName
│   ├── username (Unique)
│   ├── bio, avatar
│   ├── age, gender
│   ├── role ('user' | 'admin')
│   ├── vibeScore (Hesaplanan puan)
│   ├── isProfileComplete (Boolean)
│   ├── hasAcceptedTerms (Boolean)
│   ├── kvkkConsent (KVKK onayı)
│   ├── lastActiveAt, totalTimeSpent
│   ├── dailyVibeCount, lastVibeDate
│   └── created_at
│
├── events
│   ├── id (Primary Key)
│   ├── user_id (Foreign Key → users)
│   ├── title, description
│   ├── date, location
│   ├── latitude, longitude (Harita konumu)
│   ├── image (Etkinlik resmi)
│   ├── category ('party'|'social'|'coffee'|'study'|'sport'|'game'|'other')
│   ├── checkin_code (QR kod)
│   └── created_at
│
├── event_participants
│   ├── id (Primary Key)
│   ├── event_id (Foreign Key → events)
│   ├── user_id (Foreign Key → users)
│   ├── checked_in (Boolean)
│   └── joined_at
│
├── comments
│   ├── id (Primary Key)
│   ├── event_id (Foreign Key → events)
│   ├── user_id (Foreign Key → users)
│   ├── text (Yorum metni)
│   ├── parent_comment_id (İç içe yorumlar)
│   └── created_at
│
├── friends
│   ├── id (Primary Key)
│   ├── user_id (Foreign Key → users)
│   ├── friend_id (Foreign Key → users)
│   └── created_at
│
├── banned_users
│   ├── id (Primary Key)
│   ├── user_id (Foreign Key → users)
│   ├── reason (Ban sebebi)
│   ├── banned_by (admin id)
│   ├── banned_at, expires_at
│   └── Permissions: ONLY admin can read/write
│
└── banned_ips
    ├── id (Primary Key)
    ├── ip_address (Unique)
    ├── user_id (Foreign Key → users)
    ├── reason (Ban sebebi)
    ├── banned_by (admin id)
    ├── banned_at
    └── Permissions: ONLY admin can read/write
```

### Kimlik Doğrulama (Auth)

```
Supabase Auth Flow:
1. Email/Şifre veya Google OAuth
2. Supabase auth.users tablosuna kayıt
3. JWT token üretilir
4. Token sessionStorage'da saklanır
5. Tüm API istekleri token ile auth edilir
6. Süresi biten token otomatik yenilenir
```

**Auth Dosyası**: `lib/supabase.ts`
```typescript
- supabase: Normal authenticated client
- supabaseAdmin: Service role key ile admin client (RLS bypass)
```

### Row Level Security (RLS) - Satır Düzey Güvenlik

RLS, PostgreSQL'in yerleşik güvenlik mekanizması. Her tabloyu kim yönetebilir?

```
✅ users table:
  - Herkes: Tüm kullanıcıları görebilir (public)
  - Sadece owner: Kendi profili düzenleyebilir
  
✅ events table:
  - Herkes: Tüm etkinlikleri görebilir
  - Sadece creator: Kendi etkinliğini düzenleyebilir
  
✅ event_participants table:
  - Herkes: Katılımcıları görebilir
  - Sadece auth user: Kendisini ekleyebilir/çıkarabilir
  
✅ banned_users, banned_ips:
  - ONLY ADMINS: Yazma/okuma
  - Public alanlar (users) normal RLS kuralları
```

### Veritabanı Fonksiyonları

Migrasyon dosyalarından görülüyor:

```sql
- check-database.sql          # Veritabanı sağlık kontrolü
- complete-database-setup.sql # Tüm tabloları ve RLS'yi ayarla
- migration-vibe-score.sql    # Vibe score sistemi
- migration-add-gender.sql    # Cinsiyet bilgisi
- migration-add-kvkk.sql      # KVKK onayı
- migration-add-location-coords.sql # Konum izni
- fix-rls-policy.sql          # RLS düzeltmeleri
fix-friends-rls.sql         # Arkadaş listesi güvenliği
```

---

## 📁 Dosya İsleyiş Detayları

### **database.ts** - Ana Veritabanı İşlemleri
Bu dosya, tüm Supabase operasyonlarını bir `db` objesi altında export eder.

Kategoriler:
1. **Events işlemleri** (CRUD)
   - `getEvents()`: Tüm etkinlikleri getir
   - `getEventById()`: Tek etkinlik
   - `createEvent()`: Yeni etkinlik
   - `updateEvent()`: Etkinliği düzenle
   - `deleteEvent()`: Etkinliği sil

2. **Event Participants işlemleri**
   - `joinEvent()`: Etkinliğe katıl
   - `leaveEvent()`: Etkinlikten çık
   - `checkInEvent()`: QR ile check-in
   - `getEventParticipants()`: Katılımcılar listesi

3. **Comments işlemleri (İç içe yorumlar destekler)**
   - `addComment()`: Yorum ekle
   - `getComments()`: Etkinlik yorumları
   - `deleteComment()`: Yorum sil

4. **Friends işlemleri**
   - `addFriend()`: Arkadaş ekle
   - `removeFriend()`: Arkadaş çıkar
   - `getFriends()`: Arkadaş listesi
   - `checkFriendship()`: Arkadaş mı kontrolü

5. **Users işlemleri**
   - `getUserProfile()`: Profil bilgisi
   - `updateUserProfile()`: Profil güncelle
   - `getUserByUsername()`: Username'e göre bul
   - `searchUsers()`: Kullanıcı ara

6. **Vibe Score işlemleri**
   - `getVibeLeaderboard()`: En yüksek vibe puanları
   - `checkDailyVibeLimit()`: Günlük limit kontrolü (max 3/gün)
   - `updateVibeScore()`: Puan hesapla ve güncelle

7. **Admin işlemleri**
   - `banUser()`: Kullanıcıyı yasakla
   - `unbanUser()`: Yasaklamayı kaldır
   - `getBannedUsers()`: Yasaklı kullanıcılar

8. **CMS işlemleri**
   - `getCMSPage()`: CMS sayfasını getir
   - `getAllCMSPages()`: Tüm CMS sayfalarını getir
   - `createCMSPage()`: Sayfa oluştur
   - `updateCMSPage()`: Sayfa güncelle
   - `deleteCMSPage()`: Sayfa sil

### **types.ts** - TypeScript Arayüzleri
Tüm veri yapıları burada tanımlanır:
- `User`: Kullanıcı profili
- `Event`: Etkinlik
- `EventParticipant`: Katılımcı
- `Comment`: Yorum
- `Friend`: Arkadaş ilişkisi
- `BannedUser`, `BannedIP`: Ban sistemine ait
- `CMSModuleType`, `CMSPage`: CMS sistemi
- `Database`: Supabase Database türleri

### **context/AuthContext.tsx** - Auth Yönetimi
- **Oturum Yönetimi**: Giriş, çıkış, kayıt
- **Profil Cache**: localStorage'da 10 dakika
- **Auto-refresh**: Token süresi dolduğunda otomatik yenile
- **Ban Kontrolü**: Giriş sırasında yasaklı mı kontrolü

---

## 🔐 Güvenlik Özellikleri

### 1. **Kimlik Doğrulama (Authentication)**
- Email/Şifre: Supabase Auth via PostgreSQL
- Google OAuth: Popup ile sosyal giriş
- JWT Token: sessionStorage'da (tarayıcı kapatılınca silinir)

### 2. **Yetkilendirme (Authorization)**
- **User Role**: `user` veya `admin`
- **RLS Policies**: PostgreSQL satır düzey güvenlik
- **Protected Routes**: Frontend route koruması

### 3. **Ban Sistemi**
- **User Ban**: Kullanıcı yasaklama (kalıcı veya temporer)
- **IP Ban**: IP adresi yasaklama (spam/abuse)
- **Ban Check**: Her login'de kontrol
- **BanScreen**: Yasaklı kullanıcıya özel ekran

### 4. **Data Privacy**
- **KVKK Consent**: Kullanıcı veri otlaşması onayı
- **Privacy Policy**: Community Guidelines
- **Session Timeout**: 30 dakika inactive olunca otomatik çıkış

---

## 🚀 Geliştirme Serveri Çalıştırma

### Kurulum
```bash
npm install
```

### Development Server
```bash
npm run dev
```
- Vite dev server: `http://localhost:5173`
- Sıcak module değişimi (Hot Module Replacement)

### Production Build
```bash
npm run build
```
- TypeScript derlemesi
- Minified bundle oluştur
- `dist/` klasörüne çıkış

### Preview Production Build
```bash
npm preview
```

---

## 📊 Veri Akışı Örneği: Etkinlik Oluşturma

```
1. USER → Form doldur (Home sayfası)
2. FRONTEND → onClick handler
3. App → database.createEvent() çağrı
4. API → Supabase REST API isteği
5. Backend → PostgreSQL insert
6. RLS Policy → user_id kontrolü
7. Trigger → Vibe score güncelle
8. Response → Yeni event objesi
9. Frontend → Events listesi rerender
10. UI → Yeni etkinlik visible
```

---

## 📱 Önemli Features

### 1. **Etkinlik Yönetimi**
- Etkinlik oluşturma, düzenleme, silme
- Kategorilendirme (party, social, coffee, vb.)
- Harita üzerinde konum gösterisi
- QR kod ile check-in

### 2. **Sosyal Ağ**
- Arkadaş ekleme/çıkarma
- Profil görüntüleme
- Vibe Score (leaderboard)

### 3. **Yorum Sistemi**
- Etkinliklerde yorum yapma
- İç içe cevap verme (nested replies)

### 4. **Admin Paneli**
- Kullanıcı yönetimi
- Etkinlik yönetimi
- Ban yönetimi
- CMS sayfa editörü

### 5. **CMS Sistemi**
- Dinamik sayfa oluşturma
- Modüler komponent sistemi (Text, Image, Button, vb.)
- Admin tarafından edit edilebilir

### 6. **QR Code Check-in**
- Her etkinliğin unique check-in kodu
- MyQR sayfasında kendi QR kodu göster
- CheckInPage'de QR tara

---

## 🎨 Tasarım Sistemi

### Renk Paletesi
```
- bg-slate-950: Çok koyu arka plan (primary dark)
- bg-slate-900: Card arka planı
- text-rose-500: Accent renk (API, düğmeler)
- text-slate-400: İkincil text
```

### Responsive Design
- Tailwind CSS breakpoints
- Mobile-first approach
- `sm:`, `md:`, `lg:` prefix'leri

---

## 📝 Dosya Organizasyonu Tablosu

| Dosya | Amaç |
|-------|------|
| `App.tsx` | Root component, routing, protected routes |
| `index.tsx` | React entry point |
| `types.ts` | TypeScript interfaces |
| `database.ts` | Tüm Supabase işlemleri |
| `db.ts` | Alternatif database işlemleri (legacy) |
| `context/AuthContext.tsx` | Kimlik yönetimi global state |
| `context/ThemeContext.tsx` | Dark/light mode |
| `lib/supabase.ts` | Supabase client instance |
| `pages/*.tsx` | Sayfa bileşenleri |
| `components/*.tsx` | Reusable UI bileşenleri |
| `tailwind.config.js` | Tailwind CSS yapılandırması |
| `vite.config.ts` | Vite build yapılandırması |

---

## 🔗 Supabase Bağlantı Detayları

### Environment Variables (`.env.local`)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Client Tipler
1. **Normal Client** (`supabase`)
   - Authenticated users için
   - RLS policies kontrol eder
   - Public ve authorized işlemler

2. **Admin Client** (`supabaseAdmin`)
   - Service role key ile
   - RLS bypass eder
   - Admin-only işlemler

---

## 📞 API Callları Pattern

```typescript
// Supabase REST API pattern
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)
  .single();

if (error) {
  console.error('Error:', error);
  return null;
}

return data;
```

---

## ✅ Kontrol Listesi - Ne Nerededir?

- **Etkinlik oluşturmak mı istiyorsun?** → `pages/Home.tsx`
- **Profil düzenlemek mi?** → `pages/Profile.tsx` + `context/AuthContext.tsx`
- **Admin işlemi yapmak mı?** → `pages/admin/AdminUsers.tsx` ve `database.ts`
- **Yeni sayfa eklemek mi?** → `pages/`, `App.tsx`'e route ekle
- **UI component mi?** → `components/` klasörü
- **Global state mi?** → `context/` klasörü
- **Database query mi?** → `database.ts`
- **Stil değişikliği mi?** → `tailwind.config.js` veya `index.css`

---

## 🎓 Geliştirme İpuçları

1. **Type Safety**: TypeScript kullanıyor, `types.ts` kontrol et
2. **Performance**: AuthContext caching yapıyor, localStorage kontrol et
3. **Security**: RLS policies önemli, migrasyon dosyalarını oku
4. **Debugging**: React DevTools ve Supabase Studio kullan
5. **Styling**: Tailwind class taşıması kulkan, component-level CSS yok

---

**Son Güncelleme**: Şubat 2026
**Proje Versiyonu**: 1.0.0
