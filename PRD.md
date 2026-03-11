# Silius Community Platform — Product Requirements Document (PRD)

**Versiyon:** 1.0  
**Tarih:** 6 Mart 2026  
**Proje Adı:** Silius Community Platform  
**Platform Türü:** Sosyal Topluluk & Etkinlik Keşif Platformu  

---

## 1. Ürün Özeti

Silius, Muğla bölgesindeki gençleri hedef alan modern bir sosyal topluluk platformudur. Kullanıcılar "vibe" adı verilen etkinlikler oluşturarak dijital ve gerçek dünya bağlantılarını birleştirir. Platform; etkinlik keşfi, arkadaşlık sistemi, QR check-in, topluluk oluşturma ve mekan rehberi gibi temel özellikleri bir arada sunar.

**Temel Değer Önerisi:** Her ruh haline uygun etkinlikler — sessiz bir kahve buluşmasından gece kulübü partisine kadar — oluşturup keşfetmeyi sağlayan, mobil öncelikli bir sosyal platform.

---

## 2. Hedef Kitle

| Segment | Açıklama |
|---------|----------|
| **Birincil** | 18-30 yaş arası Muğla bölgesindeki gençler |
| **İkincil** | Tatilciler, üniversite öğrencileri, dijital göçebeler |
| **Üçüncül** | Mekan sahipleri, etkinlik organizatörleri |

### Kullanıcı Personaları

- **Keşifçi Öğrenci:** Üniversite çevresinde sosyalleşmek isteyen, yeni mekanlar arayan genç
- **Parti Organizatörü:** Beach/rave/house partileri düzenleyen, katılımcı toplamak isteyen kişi
- **Sakin Sosyalleşmeci:** Kahve buluşmaları ve küçük gruplarla vakit geçirmeyi tercih eden kullanıcı
- **Turist/Tatilci:** Bölgedeki gece hayatı ve etkinlikleri keşfetmek isteyen ziyaretçi

---

## 3. Teknik Altyapı

### 3.1 Teknoloji Yığını

| Katman | Teknoloji | Versiyon | Amaç |
|--------|-----------|----------|------|
| **Frontend Framework** | React | 19.2.3 | UI bileşen framework'ü |
| **Dil** | TypeScript | 5.8.2 | Tip güvenliği |
| **Build Aracı** | Vite | 6.2.0 | Geliştirme sunucusu & build (port: 3000) |
| **Router** | React Router | 7.11.0 | SPA yönlendirme (HashRouter) |
| **Stilizasyon** | Tailwind CSS | 4.1.18 | Utility-first CSS |
| **İkonlar** | Lucide React | 0.562.0 | SVG ikon kütüphanesi |
| **Bildirimler** | React Hot Toast | 2.6.0 | Toast bildirimleri |
| **QR Kod** | React QR Code | 2.0.18 | QR kod oluşturma |
| **Backend** | Supabase | - | BaaS (Auth, DB, Storage, Realtime) |
| **Veritabanı** | PostgreSQL | - | Supabase üzerinden yönetilen |
| **Deployment** | Docker + Nginx | - | Konteyner tabanlı dağıtım |

### 3.2 Harici Entegrasyonlar

| Entegrasyon | Amaç |
|-------------|------|
| **Google OAuth** | Sosyal giriş (Google hesabıyla) |
| **Google Maps Embed API** | Mekan haritaları & konum gösterimi |
| **Unsplash API** | Etkinlikler için otomatik görsel önerileri |
| **Supabase Storage** | Avatar ve galeri fotoğrafları depolama |
| **Supabase Realtime** | Canlı katılımcı sayısı güncellemeleri |

---

## 4. Fonksiyonel Gereksinimler

### 4.1 Kimlik Doğrulama & Yetkilendirme

#### FR-AUTH-001: E-posta/Şifre Kayıt
- Kullanıcı e-posta ve şifre ile kayıt olabilmeli
- KVKK onay kutucuğu zorunlu olmalı
- Kayıt sonrası `users` tablosuna otomatik profil satırı oluşturulmalı
- Oturum `sessionStorage` ile yönetilmeli (tarayıcı kapanınca temizlenir)

#### FR-AUTH-002: Google OAuth Giriş
- Kullanıcı Google hesabıyla tek tıkla giriş yapabilmeli
- OAuth callback sonrası profil yoksa otomatik oluşturulmalı
- Yönlendirme: `/#/home`

#### FR-AUTH-003: Profil Tamamlama
- İlk giriş sonrası `isProfileComplete === false` ise ProfileSetup sayfasına yönlendirilme
- Ad, soyad, kullanıcı adı, yaş, cinsiyet, bio zorunlu alanlar
- Tamamlanmadan platforma erişim engellenmeli

#### FR-AUTH-004: Oturum Yönetimi
- Profil cache: `silius_profile_cache` (localStorage, 10 dakika TTL)
- Token otomatik yenileme (`autoRefreshToken: true`)
- Maksimum yükleme süresi: 3 saniye (timeout sonrası UI gösterilir)
- Profil fetch timeout: 2 saniye

#### FR-AUTH-005: Gizli Admin Girişi
- Landing sayfasında logoya 3 kez tıklama ile gizli admin paneli
- Şifre doğrulama ile `localStorage` tabanlı admin yetkisi
- Supabase Auth rolü gerektirmeden admin erişimi sağlama

### 4.2 Vibe (Etkinlik) Sistemi

#### FR-VIBE-001: Etkinlik Oluşturma
- 8 kategori: `club`, `rave`, `beach`, `house`, `street`, `pub`, `coffee`, `other`
- Zorunlu alanlar: başlık, açıklama, tarih, konum, kategori, görsel
- Günlük limit: Kullanıcı başına **3 vibe/gün** (gece yarısı sıfırlanır)
- Limit aşıldığında kalan süre gösterilmeli
- LocationPicker ile mekan seçimi (İlçe → Mekan veya manuel giriş)

#### FR-VIBE-002: Etkinlik Listeleme & Filtreleme
- Sıralama seçenekleri: En yeni, En popüler, En yüksek vibe skoru, Tarih (en yakın)
- Kategori filtresi (tek veya çoklu)
- Metin araması (başlık + açıklama)
- 2 dakikalık localStorage cache

#### FR-VIBE-003: Etkinlik Detay
- Tam bilgi gösterimi: başlık, açıklama, tarih, konum, harita
- Galeri fotoğrafları (lightbox görünüm)
- Katılımcı listesi
- Yorumlar (iç içe yanıtlar destekli)
- Oluşturanın vibe skoru
- Check-in sayacı (gerçek zamanlı)
- QR kod gösterimi

#### FR-VIBE-004: Etkinliğe Katılma/Ayrılma
- Tek tıkla katılma (`event_participants` ekleme)
- Katılımdan çıkma
- Katılımcı sayısı gerçek zamanlı güncelleme

### 4.3 QR Check-in Sistemi

#### FR-CHECKIN-001: QR Kod Oluşturma
- Her etkinlik için benzersiz QR kod
- URL formatı: `https://domain/#/checkin/{eventId}`
- MyQR sayfasında kullanıcının kendi etkinliklerinin QR kodları

#### FR-CHECKIN-002: Check-in İşlemi
- QR tarama → CheckInPage'e yönlendirme
- Otomatik etkinliğe katılma + `checked_in = true` işaretleme
- Vibe puanı kazanma animasyonu
- Canlı katılımcı sayısı (Supabase Realtime)

### 4.4 Arkadaşlık Sistemi

#### FR-FRIEND-001: Arkadaş Ekleme
- Tek yönlü ilişki (A→B, B→A otomatik değil)
- Ekleme sonrası bildirim oluşturma

#### FR-FRIEND-002: Arkadaş Listeleri
- "Ağınız" sekmesi: Kullanıcının eklediği arkadaşlar
- "Takipçilerim" sekmesi: Kullanıcıyı ekleyenler
- Cinsiyet ikonları ile gösterim

#### FR-FRIEND-003: Arkadaş Silme
- Tek yönlü ilişki kaldırma

### 4.5 Vibe Skor Sistemi

#### FR-SCORE-001: Skor Hesaplama
- Oluşturulan etkinlik sayısı
- Katılınan etkinlik sayısı
- Platformda geçirilen süre (5 dakikada bir izleme)
- Check-in'lerden kazanılan puanlar

#### FR-SCORE-002: Liderlik Tablosu
- Vibeler sayfasında skor sıralaması
- Kullanıcı sayısı, aktif vibe sayısı, günlük aktif kullanıcı istatistikleri

### 4.6 Kullanıcı Profili

#### FR-PROFILE-001: Profil Görüntüleme & Düzenleme
- Avatar yükleme (500x500px sıkıştırma, maks 2MB)
- Ad, soyad, kullanıcı adı, bio, yaş, cinsiyet düzenleme
- "Etkinliklerim" ve "Katıldıklarım" listeleri
- Arkadaş listesi

#### FR-PROFILE-002: Cinsiyet Seçenekleri
- 8 seçenek: Erkek, Kadın, Transgender, Lezbiyen, Gay, Biseksüel (erkek), Biseksüel (kadın), Belirtmek istemiyorum

### 4.7 Bildirim Sistemi

#### FR-NOTIF-001: Bildirim Türleri
- `friend_request`: Arkadaşlık isteği
- `event_join`: Etkinliğe katılım
- `event_comment`: Etkinlik yorumu

#### FR-NOTIF-002: Bildirim Yönetimi
- Son 20 bildirim listeleme
- Okunmamış sayacı (Navbar'da kırmızı badge)
- Tekil veya toplu okundu işaretleme

### 4.8 Yorum Sistemi

#### FR-COMMENT-001: Yorum Oluşturma
- Düz yorum veya yanıt (`parent_comment_id` ile iç içe)
- Etkinlik sahibinin yorumları üstte sabitlenme

#### FR-COMMENT-002: Yorum Silme
- Sadece kendi yorumunu silme
- Admin tüm yorumları silebilme

### 4.9 Mekan Rehberi

#### FR-VENUE-001: Mekan Veritabanı
- 100+ doğrulanmış mekan (GPS koordinatlı)
- 4 ana ilçe: Dalaman, Ortaca/Dalyan, Muğla Merkez/Kötekli, Fethiye
- Kategoriler: Barlar, Kulüpler, Kafeler, Plajlar
- Her mekan: ad, ilçe, kategori, koordinatlar

#### FR-VENUE-002: Mekan Gösterimi
- İlçelere göre gruplandırılmış liste
- Google Maps ile harita üzerinde gösterim
- Karanlık/aydınlık tema desteği

### 4.10 CMS (İçerik Yönetim Sistemi)

#### FR-CMS-001: Sayfa Yönetimi
- Dinamik sayfa oluşturma/düzenleme/yayınlama
- URL slug ile erişim (`/page/:slug`)
- Menüde gösterilme sırası ayarı

#### FR-CMS-002: Modül Editörü
- 20 modül tipi: metin, başlık, resim, düğme, boşluk, kart, hero, grid, video, ayırıcı, akordeon, sekmeler, galeri, referans, fiyatlandırma, özellik, CTA, sosyal medya, ham HTML, embed
- Görsel stil özelleştirme
- Sıralama (drag & drop mantığı)

---

## 5. Admin Panel Gereksinimleri

### 5.1 Kullanıcı Yönetimi (FR-ADMIN-001)
- Tüm kullanıcıları listeleme (Supabase Auth admin API)
- Kullanıcı hesabı silme (Auth + DB cascade)
- Rol değiştirme (`user` ↔ `admin`)
- Kullanıcı banlama (sebep + süre)
- Ban kaldırma

### 5.2 Etkinlik Yönetimi (FR-ADMIN-002)
- Tüm etkinlikleri listeleme (katılımcı sayıları ile)
- Etkinlik silme (admin RLS bypass)
- Etkinlik düzenleme

### 5.3 Ban Yönetimi (FR-ADMIN-003)
- Kullanıcı banı: user_id, sebep, bitiş tarihi
- IP banı: IP adresi, ilişkili user_id, sebep
- Otomatik ban süresi dolumu
- Ban listesi görüntüleme

### 5.4 CMS Yönetimi (FR-ADMIN-004)
- Sayfa CRUD işlemleri
- 20 modül tipli görsel editör
- Yayın durumu yönetimi
- Menü sıralama

### 5.5 Admin İstemci (FR-ADMIN-005)
- **Supabase Service Role Key** ile RLS bypass
- Ortam değişkeni: `VITE_SUPABASE_SERVICE_ROLE_KEY`
- Service key yoksa normal istemciye fallback
- Tüm admin işlemlerinde console log

---

## 6. Veritabanı Şeması

### 6.1 Tablolar

```
users                    # Kullanıcı profilleri
├── id (UUID, PK, FK → auth.users)
├── email, firstName, lastName, username
├── bio, avatar, age, gender
├── role (user | admin)
├── hasAcceptedTerms, isProfileComplete, kvkkConsent
├── created_at, lastActiveAt, totalTimeSpent
└── dailyVibeCount, lastVibeDate

events                   # Etkinlikler (Vibeler)
├── id (UUID, PK)
├── user_id (FK → users)
├── title, description, date, location
├── latitude, longitude, image
├── category (8 enum)
├── checkin_code
└── created_at

event_participants       # Etkinlik katılımcıları
├── id (UUID, PK)
├── event_id (FK → events)
├── user_id (FK → users)
├── checked_in (boolean)
├── joined_at
└── UNIQUE(event_id, user_id)

event_checkins           # QR check-in kayıtları
├── id (UUID, PK)
├── event_id, user_id
├── checked_in_at
└── vibe_points_earned

event_gallery            # Etkinlik galerileri
├── id (UUID, PK)
├── event_id, user_id
├── image_url, caption
├── display_order, created_at

comments                 # Yorumlar (iç içe)
├── id (UUID, PK)
├── event_id, user_id, text
├── parent_comment_id (FK → comments, nullable)
└── created_at

friends                  # Arkadaşlık ilişkileri (tek yönlü)
├── id (UUID, PK)
├── user_id, friend_id
├── created_at
└── UNIQUE(user_id, friend_id)

notifications            # Bildirimler
├── id (UUID, PK)
├── user_id, type, title, message, link
├── is_read, from_user_id, event_id
└── created_at

banned_users             # Kullanıcı banları
├── id, user_id, banned_by
├── reason, banned_at, expires_at

banned_ips               # IP banları
├── id, ip_address, user_id
├── reason, banned_at, banned_by

cms_pages                # CMS sayfaları
├── id, slug, title
├── is_published, show_in_menu, menu_order
├── created_by, created_at, updated_at

cms_modules              # CMS modülleri (20 tip)
├── id, page_id, module_type
├── content (JSON), styles (JSON)
└── order_index
```

### 6.2 Row Level Security (RLS)
- Tüm tablolarda RLS aktif
- Kullanıcılar kendi verilerini okuma/yazma
- Admin işlemleri Service Role Key ile RLS bypass
- Çoklu migration dosyası ile RLS politika düzeltmeleri

---

## 7. Non-Fonksiyonel Gereksinimler

### 7.1 Performans
| Metrik | Hedef |
|--------|-------|
| İlk yükleme süresi | < 3 saniye |
| Profil fetch timeout | < 2 saniye |
| Profil cache TTL | 10 dakika |
| Etkinlik listesi cache | 2 dakika |
| Avatar sıkıştırma | 500x500px, maks 2MB |

### 7.2 Güvenlik
- KVKK (Kişisel Verilerin Korunması Kanunu) uyumluluğu
- Row Level Security (RLS) ile veri izolasyonu
- Service Role Key sadece admin işlemlerinde kullanılma
- Oturum: sessionStorage (tarayıcı kapatılınca temizlenir)
- IP bazlı banlama desteği
- CORS ve güvenlik başlıkları (Nginx)

### 7.3 Kullanılabilirlik
- Mobil öncelikli (mobile-first) tasarım
- Karanlık/aydınlık tema desteği
- Alt navigasyon çubuğu (5 ikon + bildirim + admin + kullanıcı menüsü)
- Glass morphism efektleri
- Yumuşak geçişler ve animasyonlar
- Toast bildirimleri ile kullanıcı geri bildirimi

### 7.4 Erişilebilirlik
- 8 LGBTQ+ cinsiyet kimliği desteği
- Türkçe dil desteği (ana dil)
- Responsive tasarım (tüm ekran boyutları)

### 7.5 Ölçeklenebilirlik
- Docker konteyner tabanlı deployment
- Nginx reverse proxy
- Supabase managed backend (otomatik ölçeklendirme)

---

## 8. Sayfa & Route Haritası

### 8.1 Genel (Kimlik Doğrulama Gerektirmeyen)

| Route | Sayfa | Açıklama |
|-------|-------|----------|
| `/` | Landing | Ana sayfa, özellikler, vibe galerisi |
| `/auth` | Auth | Giriş/kayıt (e-posta + Google) |
| `/about` | About | Platform hakkında |
| `/security` | Security | Güvenlik & gizlilik |
| `/guidelines` | Guidelines | Topluluk kuralları |
| `/contact` | Contact | İletişim |
| `/how-to-use` | HowToUse | Kullanım kılavuzu |
| `/page/:slug` | CMSPageView | Dinamik CMS sayfaları |

### 8.2 Korumalı (Oturum + Profil Tamamlanmış)

| Route | Sayfa | Açıklama |
|-------|-------|----------|
| `/home` | Home | Etkinlik akışı, oluşturma, filtreleme |
| `/events/:id` | EventDetail | Etkinlik detay, galeri, yorumlar |
| `/profile` | Profile | Profil görüntüleme/düzenleme |
| `/profile-setup` | ProfileSetup | İlk profil tamamlama |
| `/friends` | Friends | Arkadaş listesi |
| `/users` | Users | Kullanıcı keşfi |
| `/my-qr` | MyQR | Etkinlik QR kodları |
| `/checkin/:eventId` | CheckInPage | QR check-in sayfası |
| `/vibeler` | Vibeler | İstatistikler & liderlik tablosu |
| `/topluluk` | Topluluk | Topluluk vitrin sayfası |
| `/mekanlar` | Mekanlar | Mekan rehberi |

### 8.3 Admin

| Route | Sayfa | Açıklama |
|-------|-------|----------|
| `/admin` | Admin | Admin dashboard |
| `/admin/users` | AdminUsers | Kullanıcı yönetimi |
| `/admin/vibes` | AdminVibes | Etkinlik yönetimi |
| `/admin/pages` | AdminPages | CMS sayfa yönetimi |
| `/admin/bans` | AdminBans | Ban yönetimi |
| `/admin/pages/:id/edit` | PageEditor | Sayfa modül editörü |

---

## 9. API / Veritabanı Operasyonları Özeti

### 9.1 Etkinlik İşlemleri
- `getEvents()` — Tüm etkinlikler (en yeni önce)
- `getEventById(id)` — Tekil etkinlik
- `saveEvent(data)` — Etkinlik oluşturma + günlük limit kontrolü
- `updateEvent(id, updates)` — Etkinlik düzenleme
- `deleteEvent(id)` — Etkinlik silme (sahip veya admin)
- `getEventsWithOwnerVibeScores()` — Etkinlikler + oluşturanın skoru
- `checkDailyVibeLimit(userId)` — 3/gün limit kontrolü
- `incrementDailyVibeCount(userId)` — Oluşturma sonrası sayaç artırma

### 9.2 Katılımcı İşlemleri
- `joinEvent(eventId)` — Etkinliğe katılma
- `leaveEvent(eventId)` — Etkinlikten ayrılma
- `getParticipantCount(eventId)` — Toplam katılımcı
- `getLiveParticipantCount(eventId)` — Check-in yapan sayısı
- `getEventParticipants(eventId)` — Katılımcı ID listesi
- `isUserParticipant(eventId, userId)` — Katılım kontrolü

### 9.3 Kullanıcı İşlemleri
- `getUsers()` — Tüm kullanıcılar
- `getUserById(id)` — Tekil kullanıcı
- `updateUserProfile(data)` — Profil güncelleme
- `getAllUsersWithVibeScores()` — Skorlu kullanıcı listesi
- `getCurrentUser()` — Mevcut oturum kullanıcısı

### 9.4 Arkadaşlık İşlemleri
- `addFriend(friendId)` — Arkadaş ekleme
- `removeFriend(friendId)` — Arkadaş silme
- `getFriends(userId)` — Arkadaş listesi
- `getReverseFriends(userId)` — Takipçi listesi
- `isFriend(userId, friendId)` — Arkadaşlık kontrolü

### 9.5 Yorum İşlemleri
- `getCommentsWithReplies(eventId, creatorId)` — İç içe yorumlar
- `addComment(eventId, text, parentCommentId?)` — Yorum/yanıt ekleme
- `deleteComment(commentId)` — Yorum silme

### 9.6 Bildirim İşlemleri
- `getNotifications(userId)` — Son 20 bildirim
- `getUnreadNotificationCount(userId)` — Okunmamış sayısı
- `markNotificationAsRead(id)` / `markAllNotificationsAsRead(userId)`
- `createNotification(type, title, message, link)` — Bildirim oluşturma

### 9.7 Ban İşlemleri
- `banUser()` / `unbanUser()` / `isUserBanned()` / `getBanInfo()`
- `banIP()` — IP bazlı banlama

### 9.8 Galeri İşlemleri
- `addGalleryPhoto(eventId, photoUrl)` — Fotoğraf ekleme
- `getEventGallery(eventId)` — Etkinlik galerisi

### 9.9 CMS İşlemleri
- `getCMSPages()` / `getCMSPage(slug)` / `saveCMSPage(page)`
- `getCMSModules(pageId)` / `saveCMSModule(module)` / `deleteCMSModule(moduleId)`

---

## 10. Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase proje URL'si | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonim anahtar | ✅ |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | ⚠️ Admin işlemleri için |
| `GEMINI_API_KEY` | Google Gemini API anahtarı | ❌ |

---

## 11. Deployment Mimarisi

```
                    ┌─────────────┐
                    │   İstemci   │
                    │  (Tarayıcı) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Nginx    │
                    │   (Proxy)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Docker    │
                    │ (Vite App)  │
                    │  Port 3000  │
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │       Supabase          │
              │  ┌────┐ ┌──────┐ ┌───┐ │
              │  │Auth│ │  DB  │ │S3 │ │
              │  └────┘ └──────┘ └───┘ │
              │  ┌────────┐ ┌────────┐ │
              │  │Realtime│ │  Edge  │ │
              │  └────────┘ └────────┘ │
              └─────────────────────────┘
```

---

## 12. Riskler & Kısıtlamalar

| Risk | Etki | Azaltma |
|------|------|---------|
| Service Role Key frontend'de açık | Yüksek | Sadece admin işlemlerinde kullanılmalı, ideal olarak Edge Function'a taşınmalı |
| sessionStorage oturum yönetimi | Orta | Her yeni sekme/pencerede yeniden giriş gerekir |
| Tek yönlü arkadaşlık sistemi | Düşük | UX'te "takip" olarak yeniden çerçeveleme |
| Günlük 3 vibe limiti | Düşük | Premium plan ile artırılabilir |
| Bölgesel mekan verisi (sadece Muğla) | Orta | Kullanıcı katkılı mekan ekleme özelliği planlanabilir |
| RLS politikalarında çoklu düzeltme ihtiyacı | Orta | Kapsamlı RLS test suite oluşturulmalı |

---

## 13. Gelecek Geliştirmeler (Backlog)

- [ ] Push bildirimleri (Web Push API)
- [ ] Mesajlaşma / DM sistemi
- [ ] Etkinlik davet sistemi
- [ ] Premium üyelik & ödeme entegrasyonu
- [ ] Kullanıcı katkılı mekan ekleme
- [ ] Etkinlik hatırlatıcıları
- [ ] Sosyal medya paylaşım entegrasyonu
- [ ] Çoklu dil desteği (İngilizce)
- [ ] PWA (Progressive Web App) desteği
- [ ] Edge Functions ile backend mantığını sunucu tarafına taşıma
- [ ] Analytics dashboard (kullanım istatistikleri)
- [ ] Etkinlik önerisi algoritması (ML tabanlı)

---

## 14. Başarı Metrikleri

| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|----------------|
| Kayıtlı kullanıcı sayısı | İlk 3 ayda 500+ | Supabase Auth |
| Günlük aktif kullanıcı | %20+ kayıtlı kullanıcı | lastActiveAt tracking |
| Oluşturulan vibe sayısı | Haftalık 50+ | events tablosu |
| QR check-in oranı | Katılımcıların %30+'ı | event_checkins tablosu |
| Ortalama oturum süresi | 10+ dakika | totalTimeSpent tracking |
| Arkadaşlık bağlantı sayısı | Kullanıcı başına 5+ | friends tablosu |

---

*Bu PRD, Silius Community Platform'un mevcut durumunu ve tüm fonksiyonel/teknik gereksinimlerini belgelemektedir. Proje geliştikçe güncellenmelidir.*
