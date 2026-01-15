# 🔴 SAYFA AÇILMIYOR SORUNU - ÇÖZÜM

## Problem
Giriş yapıyorsunuz ama sayfa açılmıyor veya sonsuz yükleme gösteriyor.

## Sebep
Supabase'de **RLS (Row Level Security) Policy** eksik. Veritabanı kullanıcı profillerini döndürmüyor.

## Çözüm (2 DAKİKA)

### ADIM 1: Supabase Dashboard'a Git
1. **https://supabase.com/dashboard** adresine git
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ı aç

### ADIM 2: SQL Kodunu Çalıştır

Aşağıdaki kodu **kopyala** ve SQL Editor'a **yapıştır**:

```sql
-- TÜM ESKİ POLICY'LERİ SİL
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own" ON public.users;
DROP POLICY IF EXISTS "Admins can do anything" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "public_users_select" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

-- RLS'İ AKTİF ET
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- YENİ POLICY'LER OLUŞTUR
CREATE POLICY "public_users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- BAŞARI MESAJI
SELECT '✅ RLS POLICY KURULDU!' as status;
```

### ADIM 3: RUN Butonuna Bas
1. Sağ üstteki **RUN** butonuna tıkla
2. `✅ RLS POLICY KURULDU!` mesajını gör

### ADIM 4: Tarayıcıyı Yenile
1. **Tarayıcıyı tamamen kapat** (tüm sekmeleri)
2. Tekrar aç
3. Giriş yap

## ✅ Başarı Kontrolü

Console'da (F12) şu mesajları göreceksiniz:
```
🔐 Auth Event: SIGNED_IN User: true
📋 Profile loaded: true  ← BU MESAJ GELMELİ!
```

Eğer `Profile loaded: false` görüyorsanız SQL'i tekrar çalıştırın.

## Alternatif: Tam Kurulum

Eğer yukarıdaki çalışmazsa, `complete-database-setup.sql` dosyasını çalıştırın (her şeyi sıfırdan kurar).

---

**Not:** Bu dosyayı sildikten sonra sorun çözülmüş demektir 🎉
