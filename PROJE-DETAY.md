# Silius Community Platform - Proje Detay Dokümanı

> **Oluşturulma Tarihi:** 21 Şubat 2026  
> **Toplam Dosya:** 77 dosya | **Toplam Satır (yaklaşık):** ~12.960

---

## İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Teknoloji Yığını](#teknoloji-yığını)
3. [Kök Dosyalar](#kök-dosyalar)
4. [SQL Dosyaları](#sql-dosyaları)
5. [Bileşenler (Components)](#bileşenler)
6. [Context (State Yönetimi)](#context)
7. [Data & Lib](#data--lib)
8. [Sayfalar (Pages)](#sayfalar)
9. [Admin Sayfaları](#admin-sayfaları)
10. [Stil & Yapılandırma](#stil--yapılandırma)

---

## Genel Bakış

Silius, Muğla bölgesindeki gençler için tasarlanmış sosyal etkinlik platformudur. Kullanıcılar etkinlik oluşturabilir, katılabilir, check-in yapabilir, arkadaş ekleyebilir ve topluluk etkileşiminde bulunabilir. Platform; React + TypeScript + Vite + Supabase + TailwindCSS üzerine inşa edilmiştir.

### Ana Özellikler
- Etkinlik oluşturma & katılma (günlük limit: 3)
- Google OAuth & Email/Password kimlik doğrulama
- QR kod tabanlı check-in sistemi
- Arkadaşlık sistemi
- Vibe Score (kullanıcı skoru) sistemi
- CMS (içerik yönetim) sistemi
- Admin paneli (kullanıcı/etkinlik/ban yönetimi)
- Karanlık/aydınlık tema desteği
- Harita entegrasyonu (Google Maps)

---

## Teknoloji Yığını

| Teknoloji | Versiyon | Kullanım |
|-----------|---------|----------|
| React | 19.2.3 | UI framework |
| TypeScript | - | Tip güvenliği |
| Vite | 6.2.0 | Build aracı (port 3000) |
| Supabase JS | 2.49.4 | Backend (Auth, DB, Storage, Realtime) |
| TailwindCSS | 4.1.18 | CSS framework |
| react-router-dom | 7.11.0 | Yönlendirme (HashRouter) |
| lucide-react | - | İkon kütüphanesi |
| react-hot-toast | - | Bildirimler |
| react-qr-code | - | QR kod oluşturma |

---

## Kök Dosyalar

### App.tsx (~346 satır)
- **Amaç:** Ana uygulama giriş noktası, tüm routing yapılandırması
- **Bileşenler:** `ProtectedRoute`, `AdminRoute` sarmalayıcıları, `AppContent` ana bileşen
- **Özellikler:** HashRouter tabanlı yönlendirme, profil tamamlama kontrolü, ban kontrolü, tema değiştirme butonu, vibe score zaman takibi (5 dk interval)
- **İçe Aktarımlar:** react-router-dom, AuthContext, ThemeContext, tüm sayfa bileşenleri, Navbar, BanScreen, lucide-react
- **Rotalar:** `/`, `/auth`, `/home`, `/events/:id`, `/users`, `/friends`, `/profile`, `/my-qr`, `/admin/*`, `/checkin/:eventId`, `/page/:slug`, `/profile-setup` ve herkese açık sayfalar

### index.tsx (~10 satır)
- **Amaç:** React DOM kök render noktası
- **İçerik:** `AuthProvider` ile sarmalanmış `App` bileşenini `#root` elementine render eder

### index.html (~25 satır)
- **Amaç:** Vite HTML giriş noktası
- **Özellikler:** Google Fonts (Outfit, Inter), `#root` div, Vite modül script'i

### types.ts (~175 satır)
- **Amaç:** Tüm TypeScript tip/arayüz tanımları
- **Dışa Aktarımlar:** `User`, `Event`, `Comment`, `Notification`, `CMSPage`, `CMSModule`, `CMSModuleType`, `CMSModuleStyles`, `Friend`
- **Detaylar:**
  - `User`: id, email, firstName, lastName, username, bio, avatar, age, gender (8 seçenek), role, hasAcceptedTerms, isProfileComplete, kvkkConsent vb.
  - `Event`: id, user_id, title, description, location, latitude, longitude, date, image, category (7 kategori), created_at
  - `Comment`: id, event_id, user_id, content, parent_id, created_at
  - `CMSPage/CMSModule`: CMS sistemi için sayfa ve modül tipleri (20+ modül tipi)

### database.ts (~1.522 satır)
- **Amaç:** Birincil veritabanı soyutlama katmanı
- **Dışa Aktarımlar:** `db` nesnesi (50+ metod)
- **Ana Metodlar:**
  - **Kullanıcı:** `getUsers()`, `getUser()`, `updateUser()`, `getAllUsersWithVibeScores()`
  - **Etkinlik:** `getEvents()`, `saveEvent()`, `updateEvent()`, `deleteEvent()`, `getEventsWithOwnerVibeScores()`
  - **Katılım:** `joinEvent()`, `leaveEvent()`, `getParticipantCount()`, `isJoined()`
  - **Arkadaşlık:** `addFriend()`, `removeFriend()`, `getFriends()`, `getFriendRequests()`
  - **Yorum:** `getComments()`, `addComment()`, `deleteComment()`
  - **Bildirim:** `getNotifications()`, `markNotificationsRead()`
  - **Ban:** `banUser()`, `unbanUser()`, `isUserBanned()`, `getBanInfo()`
  - **CMS:** `getCMSPages()`, `getCMSPage()`, `saveCMSPage()`, `getCMSModules()`, `saveCMSModule()`
  - **Check-in:** `checkInToEvent()`, `getActiveCheckIns()`
  - **Galeri:** `addGalleryPhoto()`, `getGalleryPhotos()`
  - **Vibe Score:** `getVibeScore()`, `updateTimeSpent()`, `checkDailyVibeLimit()`
- **Bağımlılıklar:** supabase client

### db.ts (~1.346 satır)
- **Amaç:** Alternatif/eski veritabanı soyutlama katmanı (performans optimizasyonları ve önbellek)
- **Not:** database.ts ile benzer arayüz, projenin ana database.ts'yi kullandığı görülüyor

### migrate.ts (~50 satır)
- **Amaç:** Veritabanı migration çalıştırma yardımcı programı
- **Dışa Aktarımlar:** `runMigration` fonksiyonu

### package.json (~35 satır)
- **Amaç:** Proje manifesti ve bağımlılık bildirimleri
- **Script'ler:** `dev` (vite), `build` (tsc && vite build), `preview` (vite preview)

### vite.config.ts (~25 satır)
- **Amaç:** Vite yapılandırması
- **Özellikler:** Port 3000, path alias (`@` → kök), `VITE_GEMINI_API_KEY` tanımı

### tsconfig.json (~25 satır)
- **Amaç:** TypeScript derleyici yapılandırması
- **Özellikler:** ES2020 hedef, strict mod, path alias'lar

### tailwind.config.js (~40 satır)
- **Amaç:** TailwindCSS yapılandırması
- **Özellikler:** Özel font (Outfit), CSS değişken tabanlı renkler (bg-deep, bg-surface, text-main, text-muted, accent-*)

### postcss.config.js (~7 satır)
- **Amaç:** PostCSS eklenti yapılandırması (tailwindcss, autoprefixer)

### metadata.json (~3 satır)
- **İçerik:** `defaultLocale: "en"`

---

## SQL Dosyaları

### supabase-schema.sql (~200 satır)
- **Amaç:** Ana veritabanı şeması
- **Tablolar:** `users`, `events`, `event_participants`, `friends`, `comments`, `notifications`, `banned_users`, `banned_ips`, `cms_pages`, `cms_modules`, `event_checkins`, `event_gallery`

### complete-database-setup.sql (~350 satır)
- **Amaç:** Tek seferde tüm DB kurulumu (tablolar + RLS politikaları + fonksiyonlar + trigger'lar)

### check-database.sql (~30 satır)
- **Amaç:** Tablo varlığı ve satır sayısı kontrol sorguları

### admin-migration.sql (~25 satır)
- **Amaç:** users tablosuna `role` kolonu ekleme, admin RLS politikaları oluşturma

### RLS Düzeltme Dosyaları (6 dosya)
| Dosya | Satır | Amaç |
|-------|-------|------|
| fix-rls-policy.sql | ~20 | Genel RLS politika düzeltmeleri |
| fix-users-rls.sql | ~30 | Users tablosu RLS düzeltmeleri |
| fix-admin-rls.sql | ~40 | Admin RLS politika düzeltmeleri |
| fix-all-rls.sql | ~80 | Tüm tabloların RLS politikalarını kapsamlı düzeltme |
| fix-friends-rls.sql | ~20 | Friends tablosu RLS düzeltmeleri |
| fix-friends-rls-v2.sql | ~30 | Friends RLS v2 düzeltmeleri |
| fix-friends-409.sql | ~40 | Friends 409 conflict çözümü |
| fix-friends-final.sql | ~50 | Friends tablosu final RLS düzeltmeleri |
| fix-banned-select.sql | ~20 | banned_users SELECT politika düzeltmesi |

### Migration Dosyaları (8 dosya)
| Dosya | Satır | Amaç |
|-------|-------|------|
| migration-add-gender.sql | ~15 | Gender kolonu ekleme |
| migration-update-gender-constraint.sql | ~10 | Gender enum genişletme |
| migration-add-kvkk.sql | ~10 | KVKK onay kolonu |
| migration-profile-setup.sql | ~15 | Profil tamamlama takip kolonları |
| migration-add-checkin.sql | ~20 | Check-in tablosu |
| migration-add-location-coords.sql | ~10 | Events tablosuna lat/lng kolonları |
| migration-event-gallery.sql | ~15 | Etkinlik galeri tablosu |
| migration-vibe-score.sql | ~40 | Vibe score hesaplama fonksiyonu |

---

## Bileşenler

### Navbar.tsx (~215 satır)
- **Amaç:** Alt navigasyon çubuğu
- **Props:** `user`, `onLogout`
- **Özellikler:** 5 nav butonu (Anasayfa, Arkadaşlar, Oluştur placeholder, QR, Profil), okunmamış bildirim sayacı (polling), aktif sekme için rose vurgu
- **Bağımlılıklar:** react-router-dom, database, AuthContext, lucide-react (Home, Users, Plus, QrCode, User, Bell)

### BanScreen.tsx (~50 satır)
- **Amaç:** Tam ekran ban bildirimi
- **Props:** `reason`, `bannedAt`, `onLogout`
- **Özellikler:** Banlı kullanıcıya gösterilen overlay ekranı, ban nedeni ve tarihi
- **Bağımlılıklar:** lucide-react (ShieldAlert, LogOut)

### LocationPicker.tsx (~270 satır)
- **Amaç:** İlçe ve mekan seçici bileşeni
- **Props:** `onLocationSelect(location, lat, lng)`
- **Özellikler:** 4 ilçe (Dalaman, Ortaca, Fethiye, Muğla Merkez/Kötekli), mekan arama, her mekan için lat/lng koordinatları
- **Bağımlılıklar:** venues data, lucide-react (MapPin, Search, ChevronDown)

### MapDisplay.tsx (~100 satır)
- **Amaç:** Google Maps gömme bileşeni
- **Props:** `latitude`, `longitude`, `locationName`
- **Özellikler:** Dark-mode stilli harita (Google Maps Embed API), iframe tabanlı
- **Bağımlılıklar:** Yok (iframe kullanır)

### VideoBackground.tsx (~30 satır)
- **Amaç:** Döngüsel video arka plan bileşeni
- **Props:** `src`, `className`
- **Bağımlılıklar:** Yok

---

## Context

### AuthContext.tsx (~494 satır)
- **Amaç:** Kimlik doğrulama context provider
- **Dışa Aktarımlar:** `AuthProvider`, `useAuth` hook
- **State:** user, profile, session, loading, isBanned, banInfo
- **Metodlar:**
  - `signUp(email, password, userData)` — Email/şifre ile kayıt + public.users tablosuna profil oluşturma
  - `signIn(email, password)` — Email/şifre ile giriş
  - `signInWithGoogle()` — Google OAuth ile giriş
  - `signOut()` — Çıkış + localStorage temizleme
  - `updateProfile(data)` — Profil güncelleme
  - `refreshProfile()` — Profil yenileme
- **Özellikler:**
  - Google OAuth sonrası otomatik profil oluşturma (upsert)
  - localStorage profil cache (10 dk TTL)
  - Ban durumu kontrolü (paralel yükleme)
  - Maksimum yükleme süresi (3 sn timeout)
  - Auth state change dinleyicisi
- **Bağımlılıklar:** supabase client, database

### ThemeContext.tsx (~60 satır)
- **Amaç:** Karanlık/aydınlık tema context provider
- **Dışa Aktarımlar:** `ThemeProvider`, `useTheme` hook
- **Özellikler:** `document.documentElement` üzerinde CSS class toggle, localStorage kalıcılığı

---

## Data & Lib

### data/venues.ts (~120 satır)
- **Amaç:** Statik mekan verileri
- **Dışa Aktarımlar:** `venues` (Record<string, Venue[]>)
- **İlçeler:** Dalaman, Ortaca, Fethiye, Muğla Merkez/Kötekli
- **Veri:** Her mekan için name, address, lat, lng, category

### lib/supabase.ts (~55 satır)
- **Amaç:** Supabase client başlatma
- **Dışa Aktarımlar:** `supabase` (anon client), `supabaseAdmin` (service_role client), `hasAdminClient`
- **Özellikler:**
  - Normal client: sessionStorage tabanlı auth, otomatik token yenileme, URL'deki token algılama
  - Admin client: service_role key ile RLS bypass, farklı storage key ile çakışma önleme

---

## Sayfalar

### Home.tsx (~769 satır) ⭐ Ana Sayfa
- **Amaç:** Ana akış/feed sayfası
- **Props:** `user: User`
- **Özellikler:**
  - Etkinlik listesi (masonry grid: 1-5 kolon responsive)
  - 7 kategori filtresi: Hepsi, Enerji, Huzur, Sosyal, Odak, Hareket, Oyun
  - 4 sıralama seçeneği: Yeni, Popüler, En Vibeli, Tarih
  - Arama (başlık + mekan)
  - Etkinlik oluşturma modal (kapak + galeri fotoğraf yükleme)
  - LocationPicker entegrasyonu
  - Günlük vibe limiti (maks 3/gün, gece yarısı reset)
  - localStorage önbellek (2 dk TTL)
  - Vibe score gösterimi

### Landing.tsx (~595 satır)
- **Amaç:** Herkese açık karşılama sayfası
- **Özellikler:** Animasyonlu gradient hero, Supabase'den canlı istatistikler, gizli admin girişi (logo'ya 3x tıkla), floating navbar, özellik tab'ları, kategori slider, marquee güven göstergeleri, CSS animasyonları

### Auth.tsx (~270 satır)
- **Amaç:** Giriş/kayıt sayfası
- **Özellikler:** Email/şifre giriş+kayıt, Google OAuth, KVKK onay checkbox, form doğrulama, DiceBear varsayılan avatar, detaylı hata yönetimi

### EventDetail.tsx (~796 satır) ⭐ En Büyük Bileşen
- **Amaç:** Etkinlik detay sayfası
- **Özellikler:** Katılma/ayrılma + bildirim, iç içe yorumlar (maks derinlik 2) + oluşturucu rozeti, fotoğraf galerisi (lightbox + çoklu yükleme), Google Maps, düzenleme/silme (sahip için), Supabase Realtime check-in sayacı, katılımcı listesi, vibe score gösterimi

### Friends.tsx (~370 satır)
- **Amaç:** Arkadaşlık yönetimi
- **Özellikler:** İki sekme: "ARKADAŞLARIM" ve "BENİ EKLEYENLER", kart ızgarası (avatar/isim/yaş/cinsiyet), detay modal, 8 cinsiyet seçeneği

### Profile.tsx (~545 satır)
- **Amaç:** Kullanıcı profil sayfası
- **Özellikler:** Avatar yükleme (görüntü sıkıştırma: 500x500 JPEG), profil düzenleme, istatistikler (oluşturulan/katılınan vibeler, bağlantılar, vibe score), iki sekme: "Etkinliklerim" ve "QR'ım & Check-In"

### ProfileSetup.tsx (~250 satır)
- **Amaç:** İlk profil kurulum sayfası
- **Özellikler:** firstName, lastName, yaş (18-30), cinsiyet (8 seçenek), Google OAuth metadata'dan ön doldurma

### ProfileCompletionModal.tsx (~170 satır)
- **Amaç:** Profil tamamlama modal'ı (cinsiyet + doğum tarihi)
- **Özellikler:** Cinsiyet seçimi (3 seçenek), yaş doğrulama (≥13, ≤120)

### Users.tsx (~290 satır)
- **Amaç:** Kullanıcı keşif/tarama sayfası
- **Özellikler:** Tüm kullanıcılar + vibe score, isim/kullanıcı adı arama, arkadaş ekleme + bildirim, detay modal

### CheckInPage.tsx (~200 satır)
- **Amaç:** QR tabanlı check-in işleyicisi
- **Özellikler:** URL parametresinden etkinlik çekme, vibe puanı ödülü, bilet tarzı UI

### MyQR.tsx (~115 satır)
- **Amaç:** Kullanıcının etkinlikleri için QR kod gösterimi
- **Özellikler:** Her etkinlik için check-in URL'li QR kod oluşturma

### CMSPageView.tsx (~250 satır)
- **Amaç:** CMS sayfa oluşturucu — slug'a göre yayınlanan sayfaları görüntüleme
- **Özellikler:** 18+ modül tipi render (heading, text, image, button, spacer, divider, hero, card, video, testimonial, cta, pricing, feature, social, html, embed)

### Mekanlar.tsx (~165 satır)
- **Amaç:** Herkese açık mekan listesi sayfası
- **Özellikler:** Etkinlikleri mekan kartları olarak yükleme, kategori renk eşlemesi

### Topluluk.tsx (~165 satır)
- **Amaç:** Topluluk sayfası (sponsor kartları)
- **Özellikler:** Canlı kullanıcı sayısı, sponsor kartları

### Vibeler.tsx (~160 satır)
- **Amaç:** Canlı istatistik sayfası
- **Özellikler:** Gerçek zamanlı istatistikler (10sn polling), 3 büyük stat kartı

### About.tsx (~55 satır)
- **Amaç:** Statik "Hakkında" sayfası

### Contact.tsx (~80 satır)
- **Amaç:** İletişim sayfası

### Security.tsx (~60 satır)
- **Amaç:** Güvenlik & gizlilik bilgi sayfası

### Guidelines.tsx (~60 satır)
- **Amaç:** Topluluk kuralları sayfası

---

## Admin Sayfaları

### Admin.tsx (~220 satır)
- **Amaç:** Admin dashboard hub
- **Özellikler:** Canlı sayaçlar (kullanıcılar, vibeler, sayfalar, banlar), 4 alt sayfaya navigasyon ızgarası, isAdmin veya localStorage gizli auth ile erişim

### admin/AdminUsers.tsx (~420 satır)
- **Amaç:** Kullanıcı yönetimi
- **Özellikler:** Arama, ban/unban (neden modal), IP ban, rol değiştirme (user↔admin), kullanıcı silme, kendini değiştirme koruması

### admin/AdminVibes.tsx (~310 satır)
- **Amaç:** Etkinlik/vibe yönetimi
- **Özellikler:** Izgarada etkinlik kartları, arama, düzenleme modal, silme

### admin/AdminPages.tsx (~280 satır)
- **Amaç:** CMS sayfa yönetimi
- **Özellikler:** Tablo (başlık, slug, yayın durumu, menü görünürlüğü), yeni sayfa oluşturma, yayınla/geri al toggle, silme, PageEditor'a navigasyon

### admin/AdminBans.tsx (~230 satır)
- **Amaç:** Ban yönetimi
- **Özellikler:** İki sekme: "Banlı Kullanıcılar" ve "Banlı IP'ler", unban butonu

### admin/PageEditor.tsx (~630 satır) ⭐ Gelişmiş CMS Editörü
- **Amaç:** Sürükle-bırak CMS sayfa oluşturucu
- **Özellikler:** 20 modül tipi, sürükle-bırak sıralama, canlı önizleme, özellik paneli, stil editörü (arka plan, metin rengi, dolgu, köşe yuvarlama, hizalama), 4 sütunlu modül seçici modal

### admin/admin-operations.ts (~120 satır)
- **Amaç:** Admin-only işlemler (service_role key)
- **Dışa Aktarımlar:** `deleteUserAccount()`, `getAllUsersAsAdmin()`, `updateUserBanStatus()`, `updateUserRoleAsAdmin()`
- **Özellikler:** Auth + profil + users tablolarından kullanıcı silme, admin API ile tüm kullanıcıları listeleme

---

## Stil & Yapılandırma

### src/index.css (~150 satır)
- **Amaç:** Global stiller ve CSS özel değişkenleri
- **Özellikler:**
  - Karanlık/aydınlık tema CSS değişkenleri
  - `.glass` ve `.glass-card` utility class'ları
  - Özel scrollbar stili
  - Gradient metin yardımcı programları
  - Animasyon sınıfları

### src/vite-env.d.ts (~1 satır)
- **Amaç:** Vite tip referansı

---

## Mimari Özeti

```
┌─────────────────────────────────────────────┐
│                  App.tsx                     │
│            (HashRouter + Routes)             │
├──────────┬──────────┬───────────┬───────────┤
│ AuthCtx  │ ThemeCtx │  Navbar   │ BanScreen │
├──────────┴──────────┴───────────┴───────────┤
│                  Sayfalar                    │
│  Landing│Auth│Home│Events│Users│Friends│...  │
├─────────────────────────────────────────────┤
│          database.ts (50+ metod)            │
├─────────────────────────────────────────────┤
│     lib/supabase.ts (anon + admin)          │
├─────────────────────────────────────────────┤
│           Supabase Backend                  │
│  Auth │ PostgreSQL │ Storage │ Realtime     │
└─────────────────────────────────────────────┘
```

---

## Özet İstatistikler

| Kategori | Dosya Sayısı | Yaklaşık Satır |
|----------|-------------|----------------|
| Kök yapılandırma/giriş | 13 | ~2.160 |
| SQL migration'lar | 21 | ~950 |
| Bileşenler | 5 | ~665 |
| Context | 2 | ~440 |
| Data + Lib | 2 | ~175 |
| Src (stil) | 2 | ~151 |
| Dokümantasyon | 5 | ~330 |
| Sayfalar | 21 | ~6.100 |
| Admin sayfaları | 6 | ~1.990 |
| **TOPLAM** | **77 dosya** | **~12.960 satır** |
