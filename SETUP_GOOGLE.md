# Google API Kurulumu

Projenizdeki harita ve giriş özellikleri için Google API anahtarlarına ihtiyacınız vardır.

## 1. Google Maps API

Harita özelliklerinin (`MapDisplay` ve `LocationPicker`) çalışması için:

1.  [Google Cloud Console](https://console.cloud.google.com/) adresine gidin.
2.  Yeni bir proje oluşturun veya mevcut bir projeyi seçin.
3.  **APIs & Services > Library** menüsünden aşağıdaki API'leri etkinleştirin:
    *   Maps JavaScript API
    *   Places API (Konum seçici ve otomatik tamamlama için)
4.  **APIs & Services > Credentials** menüsünden "Create Credentials" -> "API Key" seçin.
5.  Oluşturulan anahtarı kopyalayın.
6.  Projenizin ana dizinindeki `.env` dosyasını açın ve aşağıdaki satıra yapıştırın:

```dotenv
VITE_GOOGLE_MAPS_API_KEY=AIzaSy... (sizin anahtarınız)
```

> **Önemli:** Güvenlik için bu anahtarı sadece belirli domainlerde (localhost ve canlı siteniz) çalışacak şekilde kısıtlamanız önerilir.

## 2. Google ile Giriş (Google Login)

Google ile giriş kütüphanesi Supabase üzerinden yönetilmektedir. Kodunuzda herhangi bir değişiklik yapmanıza gerek yoktur, ancak Supabase panelinde yapılandırma yapmalısınız.

1.  [Supabase Dashboard](https://supabase.com/dashboard) adresine gidin.
2.  Projenizi seçin ve **Authentication > Providers** menüsüne gidin.
3.  **Google** sağlayıcısını bulun ve etkinleştirin (Enable).
4.  Client ID ve Client Secret değerlerini girmek için:
    *   Google Cloud Console'da **APIs & Services > Credentials** sayfasına gidin.
    *   "Create Credentials" -> "OAuth client ID" seçin.
    *   Application type olarak "Web application" seçin.
    *   **Authorized redirect URIs** kısmına Supabase panelindeki "Callback URL (for OAuth)" değerini yapıştırın (örn: `https://...supabase.co/auth/v1/callback`).
    *   Oluşturulan **Client ID** ve **Client Secret** değerlerini Supabase paneline yapıştırın ve kaydedin.
5.  Bu işlemden sonra uygulamanızdaki "Google ile Giriş" butonu çalışacaktır.

## Not
Kodlarınız zaten bu yapılandırmaları kullanacak şekilde hazırlanmıştır. Sadece `.env` dosyasını güncellemeniz ve Supabase panel ayarlarını yapmanız yeterlidir.
