# 📋 Silius Community Platform — Tam Proje Dokümantasyonu

> **Tarih:** 21 Şubat 2026  
> **Proje:** Silius Community Platform  
> **Teknoloji:** React 19 + TypeScript + Vite + Supabase + Tailwind CSS  
> **Amaç:** Muğla bölgesi için sosyal topluluk platformu — Etkinlik (Vibe) oluşturma, arkadaş ekleme, QR check-in, vibe score sistemi

---

## 📁 Proje Yapısı & Dosya Detayları

### 🔧 Konfigürasyon Dosyaları

| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `package.json` | ~35 | Proje manifest. Bağımlılıklar: `react 19.2.3`, `react-dom 19`, `react-router-dom 7.11.0`, `@supabase/supabase-js 2.39.0`, `lucide-react`, `react-hot-toast`, `react-qr-code`. Scripts: dev, build, preview. |
| `vite.config.ts` | ~25 | Vite konfigürasyonu: port 3000, host `0.0.0.0`, React plugin, `GEMINI_API_KEY` env passthrough, `@` alias. |
| `tsconfig.json` | ~25 | ES2022 target, bundler moduleResolution, `@/*` path alias. |
| `tailwind.config.js` | ~30 | darkMode `'class'`, özel fontlar (Plus Jakarta Sans, Outfit), CSS variable renkleri. |
| `postcss.config.js` | ~7 | `@tailwindcss/postcss` + `autoprefixer`. |
| `metadata.json` | ~5 | `{ name: "Silius Community Platform" }`. |
| `index.html` | 127 | Giriş HTML. CSS değişkenleri (tema), glass morphism, animasyonlar, importmap, özel scrollbar, Google Fonts. |

---

### 🧠 Core TypeScript Dosyaları

#### `index.tsx` (~20 satır)
- **Amaç:** Giriş noktası
- **İçerik:** `<AuthProvider><App /></AuthProvider>` yapısını `#root`'a render eder
- **İmportlar:** React, ReactDOM, App, AuthProvider

#### `App.tsx` (~260 satır)
- **Amaç:** Ana uygulama bileşeni, routing yönetimi
- **Önemli Bileşenler:**
  - `ProtectedRoute` — Auth + profil tamamlanma kontrolü
  - `AdminRoute` — Supabase admin VEYA gizli localStorage admin (parola: `'Allah4848'`)
  - `AppContent` — Ana içerik, time tracking (5 dk'da bir)
- **Routing:** HashRouter kullanılır (`/#/home`, `/#/auth`, vs.)
- **Tüm Rotalar:**
  - `/` → Landing (giriş yapmamışsa) veya Home'a yönlendirme
  - `/auth` → Giriş/Kayıt
  - `/home` → Ana akış (Protected)
  - `/events/:id` → Etkinlik detayı (Protected)
  - `/users` → Kullanıcı keşfi (Protected)
  - `/friends` → Arkadaşlar (Protected)
  - `/profile` → Profil (Protected)
  - `/my-qr` → QR kodum (Protected)
  - `/profile-setup` → Profil tamamlama
  - `/checkin/:eventId` → QR check-in
  - `/admin` → Admin paneli (AdminRoute)
  - `/admin/users|vibes|pages|bans` → Admin alt sayfaları
  - `/page/:slug` → CMS sayfa görüntüleme
  - `/about|security|guidelines|contact|vibeler|topluluk|mekanlar` → Statik sayfalar
- **Özel Davranışlar:** currentUser fallback mekanizması (profil yüklenemezse auth user'dan minimal profil oluşturur)

#### `types.ts` (~195 satır)
- **Amaç:** Tüm TypeScript arayüzleri
- **Önemli Tipler:**
  - `User` — vibeScore, totalTimeSpent, gender (8 LGBTQ+ seçenek)
  - `Event` — id, title, description, location, date, image, category, user_id, latitude, longitude
  - `Comment` — parent_comment_id ile nested reply desteği
  - `Friend` — user_id, friend_id, created_at
  - `EventGalleryPhoto` — event_id, photo_url
  - `Database` — Supabase şema tipi
  - `BannedUser`, `BannedIP` — Ban sistemi
  - `CMSPage`, `CMSModule`, `CMSModuleStyles` — CMS sistemi (20 modül tipi)

#### `database.ts` (1522 satır) — **ANA VERİTABANI KATMANI**
- **Amaç:** Birincil veritabanı soyutlama katmanı (App.tsx tarafından kullanılır)
- **Önemli Fonksiyonlar:**
  - `getEvents()` / `getEventsWithOwnerVibeScores()` — Etkinlik listesi
  - `saveEvent()` — Etkinlik oluşturma (günlük limit 3/gün)
  - `getParticipantCount()` / `joinEvent()` / `leaveEvent()` — Katılım yönetimi
  - `getComments()` / `addComment()` — Yorum sistemi (düz + nested yanıtlar)
  - `getUser()` / `updateUserProfile()` — Kullanıcı CRUD
  - `addFriend()` / `removeFriend()` / `getFriends()` / `getReverseFriends()` — Arkadaşlık (çift yönlü)
  - `getNotifications()` / `sendNotification()` — Bildirim sistemi
  - `banUser()` / `unbanUser()` / `banIP()` / `isUserBanned()` — Ban yönetimi
  - `getCMSPages()` / `saveCMSPage()` / `getCMSModules()` — CMS sistemi
  - `updateVibeScore()` / `updateTimeSpent()` — Vibe Score & süre takibi
  - `addGalleryPhoto()` / `getEventGallery()` — Etkinlik galerisi
  - `checkIn()` / `getCheckedInCount()` — QR check-in
  - `checkDailyVibeLimit()` — Günlük limit kontrolü
- **Admin İşlemleri:** `getAdminClient()` ile service role key kullanır (RLS bypass)

#### `db.ts` (1346 satır) — **ESKİ/ALTERNATİF VERİTABANI KATMANI**
- **Amaç:** Eski veritabanı katmanı (App.tsx tarafından kullanılmıyor)
- **Fark:** Batch metodları var (`getAllParticipantCounts`, `getUsersByIds`), arkadaşlık için upsert kullanır
- **Eksikler:** Gallery/Check-in fonksiyonları yok
- **Durum:** Muhtemelen legacy — aktif olarak kullanılmıyor

#### `migrate.ts` (~140 satır)
- **Amaç:** Tek seferlik localStorage → Supabase veri göçü scripti
- **Export:** `migrateData()`
- **Not:** "Bir kez çalıştır, sonra sil" — legacy

---

### 📚 Lib

#### `lib/supabase.ts` (~55 satır)
- **Amaç:** İki Supabase istemcisi
- **Exportlar:**
  - `supabase` — Anonim anahtar, sessionStorage auth (tarayıcı kapanınca silinir)
  - `supabaseAdmin` — Service role anahtarı, ayrı storageKey (RLS bypass)
  - `hasAdminClient` — Admin client mevcut mu kontrolü
- **Güvenlik Notu:** Service role key frontend'de `VITE_SUPABASE_SERVICE_ROLE_KEY` ile expose edilmiş

---

### 🔐 Context

#### `context/AuthContext.tsx` (~500 satır)
- **Amaç:** Kimlik doğrulama sağlayıcısı ve hook'u
- **State:** `user`, `profile`, `session`, `loading`, `isAdmin`, `isBanned`, `banInfo`
- **Metotlar:**
  - `signUp(email, password, userData)` — E-posta/şifre ile kayıt + public.users'a upsert
  - `signIn(email, password)` — E-posta/şifre ile giriş
  - `signInWithGoogle()` — Google OAuth ile giriş (`/#/home`'a yönlendirir)
  - `signOut()` — Çıkış + cache temizleme
  - `updateProfile(data)` — Profil güncelleme
  - `refreshProfile()` — Profili yenileme (cache bypass)
- **Optimizasyonlar:**
  - Profil cache (localStorage, 10 dk TTL)
  - Maksimum yükleme süresi 2-3 saniye
  - Paralel ban + profil kontrolü
  - Oto profil oluşturma (Google OAuth / yeni kullanıcılar)
  - KVKK onay takibi
- **Google OAuth Akışı:**
  1. `signInWithGoogle()` → `supabase.auth.signInWithOAuth({ provider: 'google' })`
  2. Kullanıcı Google'a yönlendirilir
  3. Başarılı girişte `redirectTo: window.location.origin + '/#/home'` adresine döner
  4. `onAuthStateChange` tetiklenir → profil yoksa otomatik oluşturulur

#### `context/ThemeContext.tsx` (~55 satır)
- **Amaç:** Tema sağlayıcısı (dark/light)
- **Exportlar:** `ThemeProvider`, `useTheme`
- **Kalıcılık:** `'silius_theme'` localStorage key'i

---

### 🧩 Bileşenler (Components)

#### `components/BanScreen.tsx` (~75 satır)
- Tam ekran ban bildirimi — sebep, tarih, çıkış butonu

#### `components/Navbar.tsx` (~200 satır)
- Sabit alt navigasyon çubuğu (Akış/Kişiler/Çevrem/Ben/QR'ım)
- CMS sayfa linkleri, bildirim zili (okunmamış sayısı), admin ikonu, kullanıcı avatarı

#### `components/LocationPicker.tsx` (~300 satır)
- İki adımlı ilçe → mekan seçimi (statik mekan verileri kullanılır)
- Arama, puan/yorum/fiyat gösterimi, oto koordinatlar

#### `components/MapDisplay.tsx` (~180 satır)
- Google Maps embed (dark tema), özel 3D marker, fallback statik görsel
- Google Maps yol tarifi linki

#### `components/VideoBackground.tsx` (~55 satır)
- Döngüsel video arka planı + gradient overlay

---

### 📄 Sayfalar (Pages)

#### `pages/Landing.tsx` (595 satır)
- Herkese açık giriş sayfası
- Parallax header, DB'den canlı istatistikler, özellik tabları, kategori slider
- Gizli admin girişi: Logo'ya üçlü tıklama → şifre modal (`'Allah4848'`)
- Tema toggle

#### `pages/Auth.tsx` (~280 satır)
- Giriş/Kayıt formu — E-posta+şifre ve Google OAuth
- KVKK onay checkbox'u
- Türkçe hata mesajları
- Animasyonlu gradient UI

#### `pages/Home.tsx` (769 satır)
- Ana etkinlik akışı — **EN ÖNEMLİ SAYFA**
- Kategoriler: HEPSİ/ENERJİ/HUZUR/SOSYAL/ODAK/HAREKET/OYUN
- Sıralama: YENİ/POPÜLER/EN VİBELİ/TARİH
- Arama, günlük vibe limiti (3/gün + geri sayım)
- Etkinlik oluşturma modal'ı (LocationPicker + galeri upload)
- 2 dk event cache (localStorage)
- Masonry grid kartlar
- **TARİH sıralama:** Bugünün tarihine en yakın etkinlikler önce gösterilir

#### `pages/EventDetail.tsx` (796 satır)
- Etkinlik detay sayfası
- Hero görsel, nested yorumlar (yanıtlarla), katılımcı listesi
- Düzenleme/silme (sadece sahip), fotoğraf galerisi (lightbox)
- Canlı check-in sayısı (Supabase Realtime)
- Vibe score, QR kodu, harita gösterimi, katıl/ayrıl butonu

#### `pages/Profile.tsx` (~500 satır)
- Kullanıcı profili
- Avatar yükleme (Supabase Storage — 500x500 sıkıştırma, maks 2MB)
- Düzenleme modu (ad, bio, cinsiyet)
- Sekmeler: Etkinliklerim / QR'ım
- Vibe score, arkadaş sayısı

#### `pages/ProfileSetup.tsx` (~220 satır)
- Kayıt sonrası profil tamamlama
- Yaş (18-30 gerekli), cinsiyet (8 seçenek dahil LGBTQ+), ad alanları
- Tamamlandığında `/home`'a yönlendirir

#### `pages/ProfileCompletionModal.tsx` (~170 satır)
- Profil tamamlama modal'ı
- Cinsiyet (3 seçenek: erkek/kadın/diğer) ve doğum tarihi
- Min yaş 13

#### `pages/Users.tsx` (~370 satır)
- Kullanıcı keşfi — arama, vibe score rozetleri
- Arkadaş ekleme (bildirimle), kullanıcı detay modal'ı

#### `pages/Friends.tsx` (~340 satır)
- İki sekme: "Arkadaşlarım" ve "Beni Ekleyenler" (reverse followers)
- Kullanıcı detay modalları, cinsiyet gösterimi

#### `pages/CheckInPage.tsx` (~200 satır)
- QR ile check-in sayfası — Bilet tarzı UI
- Durum yönetimi: giriş yapılmamış → yönlendirme, zaten check-in, başarılı (+puan), hata

#### `pages/MyQR.tsx` (~110 satır)
- Kullanıcının etkinlikleri için QR kodu gösterimi (react-qr-code)

#### `pages/Vibeler.tsx` (~130 satır)
- Canlı istatistik dashboard'u (kullanıcılar, vibeler, günlük aktif) — 10 sn auto-refresh

#### `pages/Topluluk.tsx` (~110 satır)
- Topluluk sayfası — SpeedSmm sponsor, Silius v1 açık kaynak bağlantıları

#### `pages/Mekanlar.tsx` (~140 satır)
- Herkese açık mekanlar/etkinlik galerisi — Grid kartlar, auth'a yönlendirme

#### `pages/Admin.tsx` (~210 satır)
- Admin dashboard — İstatistikler (kullanıcılar, vibeler, sayfalar, banlar)
- Menü: Kullanıcı/Vibe/Sayfa/Ban yönetimi + Site Ayarları (yakında)

#### `pages/AdminPanel.tsx` (79 satır)
- Eski admin kullanıcı paneli — Basit tablo + silme
- **HATALI İMPORT:** `@/lib/admin-operations` → Gerçek yol: `pages/admin/admin-operations.ts`

#### `pages/CMSPageView.tsx` (285 satır)
- CMS sayfa render'ı — slug ile sayfa getirir
- 20 modül tipi render eder: heading, text, image, button, spacer, divider, hero, card, video, testimonial, cta, pricing, feature, social, html, embed
- 404 fallback

#### `pages/About.tsx` (~55 satır) — Statik hakkında sayfası
#### `pages/Security.tsx` (~55 satır) — Statik güvenlik bilgisi
#### `pages/Guidelines.tsx` (~50 satır) — Topluluk kuralları
#### `pages/Contact.tsx` (~85 satır) — İletişim formu (gerçek gönderim YOK)

---

### 🛡️ Admin Sayfaları

#### `pages/admin/AdminUsers.tsx` (~500 satır)
- Kullanıcı yönetim tablosu — arama
- İşlemler: ban (sebepli), unban, IP ban (IP girişli), rol değiştir (user↔admin), kullanıcı sil

#### `pages/admin/AdminVibes.tsx` (~380 satır)
- Vibe/etkinlik yönetim grid'i
- İşlemler: görüntüleme, düzenleme (başlık/açıklama/konum/tarih modal'ı), silme

#### `pages/admin/AdminPages.tsx` (~380 satır)
- CMS sayfa yönetim tablosu
- Oluşturma modal'ı (title, slug, show_in_menu), yayın/taslak toggle, düzenle → PageEditor, önizleme, silme

#### `pages/admin/AdminBans.tsx` (~350 satır)
- Ban yönetimi — İki sekme: Banlı Kullanıcılar / Banlı IP'ler
- Her iki tablo: bilgi, sebep, tarih, unban

#### `pages/admin/PageEditor.tsx` (730 satır)
- Tam CMS sayfa editörü
- 20 modül tipi — ikonlar/açıklamalar, varsayılan içerik üreticileri
- Sürükle-bırak sıralama, modül önizleme
- Özellik paneli: içerik/stil düzenleme (renkler, padding, border-radius, hizalama)
- Önizleme modu toggle

#### `pages/admin/admin-operations.ts` (~170 satır)
- Admin yardımcı fonksiyonları — `supabaseAdmin` kullanır
- `deleteUserAccount` — Auth + profiles + users tabloları
- `getAllUsersAsAdmin` — Tüm kullanıcıları listele
- `updateUserBanStatus` — Ban durumu güncelle
- `updateUserRoleAsAdmin` — Rol güncelle

---

### 📊 Veri

#### `data/venues.ts` (~235 satır)
- Statik mekan verileri
- `DISTRICTS` — Dalaman, Ortaca, Muğla Merkez/Kötekli, Fethiye
- `VENUES` — ~120 mekan (gerçek Google Maps koordinatları, puanlar, yorum sayıları, fiyat aralıkları)
- Exportlar: `DISTRICTS`, `VENUES`, `getVenuesByDistrict()`, `getVenueById()`

---

### 🎨 CSS

#### `src/index.css` (~170 satır)
- Tailwind import, dark/light CSS değişkenleri
- `.glass` / `.glass-card` / `.glass-morphism` stilleri
- `.text-glow`, `.rose-frame`
- Animasyonlar: marquee, floating, aurora, shake
- Özel scrollbar
- `.btn-primary` / `.btn-secondary` bileşen sınıfları

#### `src/vite-env.d.ts` (1 satır)
- Vite istemci tipleri referansı

---

### 📦 Statik Varlıklar

| Yol | İçerik |
|-----|--------|
| `public/` | `favicon.svg`, `laser-show.mp4` (video arka planı) |
| `image-videos/` | `indir.jpg`, `indir1.jpg`, `World Record...mp4` (lazer show videosu) |

---

### 🗄️ SQL Dosyaları (21 adet)

#### Şema & Kurulum

| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `supabase-schema.sql` | ~160 | İlk şema: `users`, `events`, `event_participants`, `comments`, `friends`. RLS politikaları. Performans indeksleri. |
| `complete-database-setup.sql` | ~280 | Sıfırdan tam DB kurulumu. Drop & yeniden oluşturma + `notifications`. `handle_new_user()` trigger'ı. Storage politikaları. |
| `admin-migration.sql` | ~210 | `banned_users`, `banned_ips`, `cms_pages`, `cms_modules` tabloları ekler. `parent_comment_id` ekler (nested yorum). |

#### Özellik Migration'ları

| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `migration-vibe-score.sql` | ~30 | `totalTimeSpent`, `lastActiveAt`, `dailyVibeCount`, `lastVibeDate` sütunları ekler. |
| `migration-add-gender.sql` | ~35 | 8 değerli CHECK constraint ile `gender` sütunu ekler. |
| `migration-update-gender-constraint.sql` | ~25 | Eski cinsiyet constraint'ini genişletilmiş 8 seçenekli yenisiyle değiştirir. |
| `migration-profile-setup.sql` | ~55 | `age` (18-30 constraint) ve `isProfileComplete` sütunları ekler. |
| `migration-event-gallery.sql` | ~45 | `event_gallery` tablosu oluşturur. RLS politikaları. |
| `migration-add-location-coords.sql` | ~20 | `latitude`/`longitude` ekler. Geo indeks. |
| `migration-add-kvkk.sql` | ~20 | `kvkk_consent` ve `kvkk_consent_date` ekler. |
| `migration-add-checkin.sql` | ~8 | `checked_in` ve `checkin_code` sütunları ekler. |

#### RLS Düzeltme Scriptleri

| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `fix-rls-policy.sql` | 111 | Kapsamlı RLS politika yeniden yazımı. |
| `fix-all-rls.sql` | ~95 | users, friends, notifications için temiz RLS. |
| `fix-admin-rls.sql` | 138 | Admin DELETE/UPDATE politikaları. |
| `fix-users-rls.sql` | ~55 | Temiz SELECT/INSERT/UPDATE politikaları. |
| `fix-friends-rls.sql` | ~95 | Friends + notifications tablo oluşturma + RLS. |
| `fix-friends-rls-v2.sql` | 135 | Geliştirilmiş friends RLS + ekstra indeksler. |
| `fix-friends-final.sql` | 115 | Final friends düzeltmesi — doğru FK ile. |
| `fix-friends-409.sql` | 206 | 409/23503 FK hatasını düzeltir. auth.users → public.users senkronizasyonu. |
| `fix-banned-select.sql` | ~35 | Kullanıcıların kendi ban durumunu kontrol edebilmesi. |
| `check-database.sql` | ~70 | Tanılama sorguları. |

---

### 📝 Markdown Dokümantasyonu

| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `README-NEW.md` | 304 | Proje README — Özellik genel bakışı, teknoloji yığını, kurulum talimatları. |
| `genel_yapı.md` | 602 | Kapsamlı mimari belge (Türkçe). Frontend/backend yapıları, tam dizin yapısı, route tablosu, veritabanı şeması. |
| `SETUP_GOOGLE.md` | ~40 | Google API kurulum rehberi — Maps JavaScript API, OAuth konfigürasyonu. |
| `STORAGE-SETUP.md` | ~85 | Supabase Storage kurulum rehberi — `avatars` bucket, storage RLS. |
| `NASIL-DUZELTILIR.md` | ~75 | Sorun giderme rehberi — RLS politika düzeltme SQL'leri. |

---

## 📊 Özet İstatistikler

| Kategori | Dosya Sayısı | Toplam Satır (yaklaşık) |
|----------|-------------|-------------------------|
| Konfigürasyon | 7 | ~255 |
| Core TS | 6 | ~3,490 |
| Lib | 1 | ~55 |
| Context | 2 | ~555 |
| Components | 5 | ~810 |
| Pages | 19 | ~5,500 |
| Admin Pages | 6 | ~2,510 |
| Data | 1 | ~235 |
| CSS | 2 | ~170 |
| SQL | 21 | ~1,900 |
| MD Docs | 5 | ~1,100 |
| Statik Varlıklar | 5 | — |
| **TOPLAM** | **~80 dosya** | **~16,580** |

---

## ⚠️ Bilinen Sorunlar & Notlar

1. **Çift veritabanı katmanı:** `database.ts` (1522 satır, aktif) vs `db.ts` (1346 satır, eski) — önemli kod tekrarı
2. **Güvenlik endişeleri:** Service role key `VITE_SUPABASE_SERVICE_ROLE_KEY` ile frontend'de açık; hardcoded admin parolası `'Allah4848'`
3. **Cinsiyet seçenekleri tutarsızlığı:** ProfileSetup 8 seçenek vs ProfileCompletionModal 3 seçenek
4. **Kırık import:** AdminPanel.tsx `@/lib/admin-operations` importu — gerçek yol: `pages/admin/admin-operations.ts`
5. **İletişim formu:** Veri göndermiyor — sadece başarı mesajı gösteriyor
6. **21 SQL migration/fix dosyası:** İteratif geliştirme — çok sayıda RLS politika düzeltmesi
