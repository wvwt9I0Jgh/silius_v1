# Supabase Storage Kurulumu

## Avatars Bucket Oluşturma

Profil resimlerinin yüklenebilmesi için Supabase'de bir storage bucket oluşturmanız gerekiyor.

### Adımlar:

1. **Supabase Dashboard'a gidin**: https://app.supabase.com

2. **Projenizi seçin**

3. **Storage menüsüne tıklayın** (sol menüden)

4. **"New Bucket" butonuna tıklayın**

5. **Bucket ayarlarını yapın**:
   - **Name**: `avatars`
   - **Public bucket**: ✅ (İşaretli olsun)
   - **File size limit**: 5 MB (önerilen)
   - **Allowed MIME types**: `image/*` (tüm resim formatları)

6. **"Create bucket" butonuna tıklayın**

### Storage Policy Ayarları

Bucket oluşturduktan sonra, aşağıdaki SQL komutlarını çalıştırın:

#### SQL Editor'da çalıştırın:

```sql
-- Mevcut tüm policy'leri sil (temiz başlangıç için)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Authenticated users can update" on storage.objects;
drop policy if exists "Authenticated users can delete" on storage.objects;

-- YENİ POLİCY'LER (Basit ve Çalışır)

-- 1. Herkes avatarları görebilir (SELECT)
create policy "Anyone can view avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 2. Kimlik doğrulaması yapılmış kullanıcılar yükleyebilir (INSERT)
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

-- 3. Kimlik doğrulaması yapılmış kullanıcılar güncelleyebilir (UPDATE)
create policy "Authenticated users can update avatars"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' );

-- 4. Kimlik doğrulaması yapılmış kullanıcılar silebilir (DELETE)
create policy "Authenticated users can delete avatars"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'avatars' );
```

**ÖNEMLİ NOT:** Bu policy'ler kimlik doğrulaması yapan tüm kullanıcıların avatars bucket'ındaki tüm dosyaları yönetmesine izin verir. Güvenlik için production ortamında daha kısıtlayıcı policy'ler kullanabilirsiniz.

## Test

Kurulum tamamlandıktan sonra:

1. Uygulamayı başlatın
2. Profil sayfasına gidin
3. Profil resminin üzerine gelin
4. "YÜKLE" butonuna tıklayın
5. Bir resim seçin (otomatik olarak 500x500 piksel ve maksimum 2MB'a sıkıştırılacak)
6. Resim yüklendikten sonra sayfa yenilenmeden görünmelidir

## Sorun Giderme

### "Row Level Security policy violation" hatası alıyorsanız:
- Storage policies'in doğru kurulduğundan emin olun
- Supabase Dashboard > Storage > avatars > Policies bölümünü kontrol edin

### "Bucket not found" hatası alıyorsanız:
- Bucket adının tam olarak `avatars` olduğundan emin olun
- Bucket'ın public olarak işaretlendiğinden emin olun

### Resim yüklenmiyor ancak hata yok:
- Browser console'u kontrol edin (F12)
- Network tab'ında upload isteğinin başarılı olup olmadığına bakın
- Supabase'deki Storage bölümünde dosyanın yüklenip yüklenmediğini kontrol edin
