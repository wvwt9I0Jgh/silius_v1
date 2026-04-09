# Silius Community Platform - Product Requirements Document (PRD)

**Versiyon:** 1.1 (Mevcut Uygulama Durumu)
**Tarih:** 21 Mart 2026
**Proje Adi:** Silius Community Platform
**Platform Turu:** Sosyal Topluluk ve Etkinlik Kesif Platformu

---

## 1. Urun Ozeti

Silius, Mugla bolgesindeki 18-30 yas arasi kullanicilari hedefleyen mobil-oncelikli bir sosyal topluluk platformudur. Kullanici deneyimi "vibe" (etkinlik) merkezinde kurgulanmistir:

- Etkinlik olusturma ve kesfetme
- Arkadaslik/takip iliskileri
- QR check-in ile fiziksel katilim dogrulama
- Vibe skoru ile topluluk katkisi olcumu
- CMS tabanli dinamik sayfalar
- Site galerisi (topluluk anlari)

Bu dokuman, kod tabaninda aktif olan mevcut ozellikleri baz alir.

---

## 2. Hedef Kitle

| Segment | Aciklama |
|---------|----------|
| Birincil | 18-30 yas arasi Mugla bolgesindeki gencler |
| Ikincil | Tatilciler, universite ogrencileri, dijital gocebeler |
| Ucuncul | Mekan sahipleri, etkinlik organizatorleri |

---

## 3. Teknik Altyapi

### 3.1 Teknoloji Yigini

| Katman | Teknoloji | Versiyon | Amac |
|--------|-----------|----------|------|
| Frontend Framework | React | 19.2.3 | UI bilesenleri |
| Dil | TypeScript | 5.8.2 | Tip guvenligi |
| Build Araci | Vite | 6.2.0 | Gelistirme ve build (port 3000) |
| Router | React Router DOM | 7.11.0 | SPA yonlendirme (HashRouter) |
| Stilizasyon | Tailwind CSS | 4.1.18 | Utility-first CSS |
| Ikon Kutuphanesi | Lucide React | 0.562.0 | SVG ikonlar |
| Bildirimler | React Hot Toast | 2.6.0 | Toast bildirimleri |
| QR Kod Uretimi | react-qr-code | 2.0.18 | QR uretimi |
| QR Tarama | html5-qrcode | 2.3.8 | Kamera ile QR tarama |
| Medya Donusumu | heic2any | 0.0.4 | HEIC gorsel donusumu |
| Backend | Supabase | 2.39.0 | Auth, DB, Storage, Realtime |
| Veritabani | PostgreSQL | Supabase | Kalici veri katmani |
| Dagitim | Docker + Nginx | - | Konteyner tabanli deployment |

### 3.2 Entegrasyonlar

| Entegrasyon | Amac |
|-------------|------|
| Google OAuth | Sosyal giris |
| Google Maps (Embed/Places) | Konum secimi ve mekan gosterimi |
| Supabase Storage | Avatar ve galeri gorselleri |
| Supabase Realtime | Canli katilim/check-in sayaclari |

Not: Uygulama kodunda `GEMINI_API_KEY` build-time degiskeni tanimlidir, ancak cekirdek urun akislarinda zorunlu bagimlilik degildir.

---

## 4. Fonksiyonel Gereksinimler (Mevcut)

### 4.1 Kimlik Dogrulama ve Yetkilendirme

#### FR-AUTH-001: E-posta/Sifre Kayit ve Giris
- E-posta-sifre ile kayit/giris desteklenir.
- KVKK onayi kayit sirasinda alinabilir (`kvkkConsent`).
- Basarili kayit sonrasi `users` tablosunda profil satiri uretilir.
- Oturum `sessionStorage` ile tutulur.

#### FR-AUTH-002: Google OAuth Giris
- Google ile tek tik giris desteklenir.
- OAuth callback hash/query carpisma senaryolari ozel olarak ele alinir.
- Basarili giris sonrasi yonlendirme `/#/home`.

#### FR-AUTH-003: Profil Tamamlama Zorunlulugu
- `isProfileComplete === false` ise kullanici `/#/profile-setup` ekranina yonlendirilir.
- Zorunlu alanlar: ad, soyad, kullanici adi, dogum tarihi, ilce, cinsiyet.
- Yas dogum tarihinden hesaplanir ve 18-30 araligi dogrulanir.

#### FR-AUTH-004: Yukleme ve Cache Davranisi
- Profil cache key: `silius_profile_cache`.
- Cache TTL: 10 dakika.
- Profil fetch timeout: 1.5 saniye.
- Auth loading fail-safe timeout: 2 saniye.
- App-level force-show timeout: 2.5 saniye.

#### FR-AUTH-005: Gizli Admin Girisi
- Landing uzerinden logo tiklama deseni ile gizli admin erisimi acilabilir.
- `localStorage` anahtari: `silius_admin_auth`.
- Normal admin rolune ek olarak bu mekanizma da admin rotalarina gecis saglar.

### 4.2 Vibe (Etkinlik) Sistemi

#### FR-VIBE-001: Etkinlik Olusturma
- Kategoriler: `club`, `rave`, `beach`, `house`, `street`, `pub`, `coffee`, `other`.
- Alanlar: baslik, aciklama, tarih, konum, kategori, gorsel.
- Koordinat alanlari (`latitude`, `longitude`) opsiyoneldir.
- Gunluk limit: kullanici basi 3 vibe/gun.
- Etkinlik sahibi olusturdugu etkinlige otomatik katilimci ve `checked_in = true` olarak eklenir.

#### FR-VIBE-002: Etkinlik Listeleme
- En yeniye gore listeleme temel davranistir.
- Ek filtreleme/siralama UI tarafinda desteklenir.

#### FR-VIBE-003: Etkinlik Detay
- Baslik, aciklama, tarih, konum, harita, katilim ve check-in bilgileri gosterilir.
- Etkinlik galerisi, yorumlar ve nested reply destegi vardir.

#### FR-VIBE-004: Katilim Isletimi
- `joinEvent(eventId)` ile katilim.
- `leaveEvent(eventId)` ile ayrilma.
- `getParticipantCount` ve `getLiveParticipantCount` ile metrikler.

### 4.3 QR Check-in Sistemi

#### FR-CHECKIN-001: QR Uretim
- Her etkinlik icin check-in URL'si `/#/checkin/:eventId` formatinda olusturulur.
- `MyQR` sayfasinda kullanicinin etkinliklerine ait QR kodlar listelenir.

#### FR-CHECKIN-002: QR Check-in
- QR tarama sonrasi CheckIn sayfasina yonlendirme.
- `checkInToEvent(eventId, userId)` ile kullanici check-in durumuna gecirilir.
- Gerekirse kayit `delete + insert` stratejisi ile RLS uyumlu sekilde yenilenir.

### 4.4 Arkadaslik Sistemi

#### FR-FRIEND-001: Tek Yonlu Arkadas Ekleme
- Arkadaslik iliskisi tek yonludur (`friends.user_id -> friend_id`).
- Kendini ekleme engellenir.
- Duplicate durumlari idempotent ele alinir.

#### FR-FRIEND-002: Iki Liste Gorunumu
- "Cevrem": kullanicinin ekledikleri (`getFriends`).
- "Beni Ekleyenler": ters iliski (`getReverseFriends`).

Not: Kod tabaninda su an `removeFriend` operasyonu bulunmamaktadir.

### 4.5 Vibe Skor ve Aktivite

#### FR-SCORE-001: Skor Bilesenleri
- Olusturulan etkinlikler.
- Katilinan etkinlikler.
- Platformda gecirilen sure (`totalTimeSpent`).

#### FR-SCORE-002: Sure Takibi
- Uygulama acikken her 5 dakikada bir kullanici suresi guncellenir (`updateTimeSpent`).

#### FR-SCORE-003: Skor Listeleri
- `getAllUsersWithVibeScores` ve `getEventsWithOwnerVibeScores` ile skor turetimleri.

### 4.6 Kullanici Profili

#### FR-PROFILE-001: Profil Alanlari
- `firstName`, `lastName`, `username`, `bio`, `avatar`, `birthDate`, `age`, `district`, `gender`.

#### FR-PROFILE-002: Cinsiyet Secenekleri
- `male`, `female`, `transgender`, `lesbian`, `gay`, `bisexual_male`, `bisexual_female`, `prefer_not_to_say`.

### 4.7 Bildirim Sistemi

#### FR-NOTIF-001: Bildirim Akisi
- Son 20 bildirim listelenir.
- Okunmamis sayaç navbar'da gosterilir.
- Tekil (`markNotificationAsRead`) ve toplu (`markAllNotificationsAsRead`) okundu islemleri desteklenir.

### 4.8 Yorum Sistemi

#### FR-COMMENT-001: Yorum ve Yanit
- Duz yorum (`saveComment`) ve nested yanit (`saveCommentReply`) desteklenir.
- `getCommentsWithReplies` parent-child yapisini dondurur.

### 4.9 Etkinlik Galerisi

#### FR-GALLERY-001: Event Gallery
- Etkinlik bazli galeri fotograflari saklanir (`event_gallery`).
- Tekli/coklu foto yukleme ve silme desteklenir.

### 4.10 Site Galerisi

#### FR-SITE-GALLERY-001: Topluluk Galerisi
- Public galeri sayfasi: `/#/galerimiz`.
- Admin panelinden gorsel ekleme/silme: `/#/admin/gallery`.
- Veri kaynagi: `site_gallery` tablosu + Supabase Storage.

### 4.11 CMS Sistemi

#### FR-CMS-001: Sayfa Yonetimi
- Sayfa CRUD: `cms_pages`.
- Slug bazli yayin: `/#/page/:slug`.
- Menude gosterim ve siralama alanlari desteklenir.

#### FR-CMS-002: Modul Yonetimi
- Modul CRUD + siralama (`reorderCMSModules`).
- Modul tipleri (20 adet):
`text`, `heading`, `image`, `button`, `spacer`, `card`, `hero`, `grid`, `video`, `divider`, `accordion`, `tabs`, `gallery`, `testimonial`, `pricing`, `feature`, `cta`, `social`, `html`, `embed`.

---

## 5. Admin Panel Gereksinimleri

### FR-ADMIN-001: Admin Erisim Modeli
- Erisim, iki yolla saglanir:
1. `users.role === 'admin'`
2. `localStorage.silius_admin_auth === 'true'`

### FR-ADMIN-002: Kullanici Yonetimi
- Kullanici listeleme, rol degistirme, silme, ban/unban islemleri.

### FR-ADMIN-003: Etkinlik Yonetimi
- Tum etkinlikleri listeleme, duzenleme, silme.

### FR-ADMIN-004: Ban Yonetimi
- Kullanici ve IP banlari (`banned_users`, `banned_ips`).

### FR-ADMIN-005: CMS ve Galeri Yonetimi
- CMS sayfalari/modulleri yonetimi.
- Site galerisi icerik yonetimi.

### FR-ADMIN-006: Service Role Fallback
- `VITE_SUPABASE_SERVICE_ROLE_KEY` varsa admin client kullanilir (RLS bypass).
- Anahtar yoksa standart client fallback ile calisir.

---

## 6. Veritabani Semasi (Guncel)

### 6.1 Ana Tablolar

```
users
events
event_participants
event_gallery
comments
friends
notifications
banned_users
banned_ips
cms_pages
cms_modules
site_gallery
```

### 6.2 Kritik Alanlar

- `users`: `birthDate`, `district`, `kvkkConsent`, `isProfileComplete`, `dailyVibeCount`, `lastVibeDate`, `totalTimeSpent`, `lastActiveAt`
- `events`: `category`, `latitude`, `longitude`, `checkin_code`
- `event_participants`: `checked_in`
- `cms_modules`: `module_type`, `content (JSON)`, `styles (JSON)`, `order_index`

### 6.3 RLS

- Tablolarda RLS aktiftir.
- Admin islemleri service-role client ile bypass edilebilir.

---

## 7. Non-Fonksiyonel Gereksinimler

### 7.1 Performans
- Ilk yukleme hedefi: hizli acilis (lazy-loading + cache mekanizmasi)
- Profil cache TTL: 10 dakika
- Profil fetch timeout: 1.5 saniye
- Auth loading fail-safe: 2 saniye
- App force-show: 2.5 saniye

### 7.2 Guvenlik
- Session saklama: `sessionStorage`
- Token yenileme: `autoRefreshToken: true`
- KVKK ve profil tamamlama akislari destekli
- Ban kontrolu app girisinde yapilir

### 7.3 Kullanilabilirlik
- Mobile-first
- Karanlik/aydinlik tema
- Alt navigasyon + bildirim popup
- Dinamik CMS menu entegrasyonu

---

## 8. Sayfa ve Route Haritasi (Guncel)

### 8.1 Public Route'lar

| Route | Sayfa |
|------|------|
| `/` | Landing |
| `/auth` | Auth |
| `/about` | About |
| `/security` | Security |
| `/guidelines` | Guidelines |
| `/cookie-policy` | Cookie |
| `/contact` | Contact |
| `/nasil-kullanilir` | HowToUse |
| `/vibeler` | Vibeler |
| `/topluluk` | Topluluk |
| `/mekanlar` | Mekanlar |
| `/info` | Info |
| `/galerimiz` | Galerimiz |
| `/checkin/:eventId` | CheckInPage |
| `/page/:slug` | CMSPageView |

### 8.2 Korumali Route'lar

| Route | Sayfa |
|------|------|
| `/profile-setup` | ProfileSetup (oturum var, profil eksikse) |
| `/home` | Home |
| `/events/:id` | EventDetail |
| `/users` | Users |
| `/friends` | Friends |
| `/profile` | Profile |
| `/my-qr` | MyQR |

### 8.3 Admin Route'lar

| Route | Sayfa |
|------|------|
| `/admin` | Admin |
| `/admin/users` | AdminUsers |
| `/admin/vibes` | AdminVibes |
| `/admin/pages` | AdminPages |
| `/admin/pages/:id` | PageEditor |
| `/admin/bans` | AdminBans |
| `/admin/gallery` | AdminGallery |

---

## 9. API ve Veritabani Operasyonlari (Kod Bazli Ozet)

### 9.1 Event
- `getEvents()`
- `getEventById(eventId)`
- `saveEvent(event)`
- `updateEvent(eventId, updates)`
- `deleteEvent(eventId)`
- `checkDailyVibeLimit(userId)`
- `incrementDailyVibeCount(userId)`

### 9.2 Katilim ve Check-in
- `joinEvent(eventId)`
- `leaveEvent(eventId)`
- `getParticipantCount(eventId)`
- `getLiveParticipantCount(eventId)`
- `isUserParticipant(eventId, userId)`
- `isUserCheckedIn(eventId, userId)`
- `checkInToEvent(eventId, userId)`

### 9.3 Kullanici
- `getUsers()`
- `getUserById(userId)`
- `updateUser(userId, updates)`
- `getCurrentUser()`

### 9.4 Arkadaslik
- `getFriends(userId)`
- `getReverseFriends(userId)`
- `getFriendIds(userId)`
- `addFriend(friendId)`
- `isFriend(userId, friendId)`

### 9.5 Yorum
- `getComments(eventId)`
- `saveComment(eventId, text)`
- `getCommentsWithReplies(eventId, eventOwnerId)`
- `saveCommentReply(eventId, parentCommentId, text)`

### 9.6 Bildirim
- `getNotifications(userId)`
- `getUnreadNotificationCount(userId)`
- `markNotificationAsRead(notificationId)`
- `markAllNotificationsAsRead(userId)`
- `createNotification(notification)`

### 9.7 Ban
- `banUser(userId, reason, bannedBy, expiresAt?)`
- `unbanUser(userId)`
- `isUserBanned(userId)`
- `getBanInfo(userId)`
- `banIP(ip, userId, reason, bannedBy)`
- `unbanIP(ip)`

### 9.8 CMS
- `getCMSPages()`
- `getCMSPage(slugOrId)`
- `saveCMSPage(page)`
- `updateCMSPage(pageId, updates)`
- `deleteCMSPage(pageId)`
- `getCMSModules(pageId)`
- `saveCMSModule(module)`
- `updateCMSModule(moduleId, updates)`
- `deleteCMSModule(moduleId)`
- `reorderCMSModules(pageId, moduleIds)`

### 9.9 Galeri
- Event gallery: `getEventGallery`, `addGalleryPhoto`, `addMultipleGalleryPhotos`, `deleteGalleryPhoto`, `getGalleryCount`
- Site gallery: `getSiteGalleryImages`, `addSiteGalleryImage`, `deleteSiteGalleryImage`

### 9.10 Vibe Score ve Aktivite
- `getAllUsersWithVibeScores()`
- `getEventsWithOwnerVibeScores()`
- `incrementVibeScore(userId, points)`
- `updateTimeSpent(userId, minutesToAdd)`

---

## 10. Ortam Degiskenleri

| Degisken | Aciklama | Zorunlu |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase proje URL | Evet |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Evet |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Admin islemleri icin service role | Admin senaryolari icin onerilir |
| `VITE_GOOGLE_OAUTH_CALLBACK_PATH` | OAuth callback path override | Opsiyonel |
| `VITE_GOOGLE_OAUTH_REDIRECT_TO` | OAuth redirect URL override | Opsiyonel |
| `GEMINI_API_KEY` | Build-time API key (opsiyonel) | Opsiyonel |

---

## 11. Deployment Mimarisi

```
Tarayici (Client)
    -> Nginx (reverse proxy)
    -> Vite Build (React SPA)
    -> Supabase (Auth + Postgres + Storage + Realtime)
```

---

## 12. Riskler ve Kisitlar

| Risk | Etki | Durum |
|------|------|-------|
| Service role key'in istemci tarafinda kullanimi | Yuksek | Kisa vadede mevcut, uzun vadede Edge Function'a tasinmali |
| Tek yonlu arkadaslik modeli | Orta | UX'te takip mantigiyla aciklanir |
| Arkadas silme operasyonunun olmamasi | Orta | Yol haritasi adayi |
| SessionStorage oturumu | Orta | Sekme/pencere davranislari kullaniciya aciklanmali |
| RLS migration bagimliligi | Orta | SQL migration'larin dogru sirada uygulanmasi gerekli |

---

## 13. Kisa Backlog Onerisi

- Arkadasliktan cikarma (`removeFriend`) operasyonu
- Event check-in puanlarinin raporlanmasi
- Admin islemlerinin Edge Functions'a tasinmasi
- Coklu dil destegi (TR/EN)
- Push notification entegrasyonu

---

Bu PRD, su anki kod tabanina (route'lar, veri modeli, servis katmani ve aktif UI akislarina) gore guncellenmistir.
