// Mekan verileri - İlçe bazlı cafe/mekan listesi
// Vibe oluştururken kullanıcı ilçe seçer, sonra o ilçedeki mekanlardan birini seçer
// Tüm koordinatlar Google Haritalar'dan alınmış gerçek konumlardır.

export interface Venue {
  id: string;
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  rating: string;
  reviewCount: string;
  type: string;
  priceRange: string;
}

export interface District {
  id: string;
  name: string;
  label: string;
}

export const DISTRICTS: District[] = [
  { id: 'dalaman', name: 'Dalaman', label: 'Dalaman' },
  { id: 'ortaca', name: 'Ortaca', label: 'Ortaca' },
  { id: 'mugla-merkez', name: 'Muğla Merkez / Kötekli', label: 'Muğla Merkez / Kötekli' },
  { id: 'fethiye', name: 'Fethiye', label: 'Fethiye' },
];

export const VENUES: Venue[] = [
  // ==================== DALAMAN ====================
  { id: 'dal-1', name: 'Wuku Specialty Coffee Shop', address: 'İstiklal Cd. No:54/A, Dalaman', district: 'dalaman', lat: 36.7817738, lng: 28.811132, rating: '4.9', reviewCount: '524', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'dal-2', name: "G'10 Coffee", address: 'Mehmet Akif Ersoy Cad No:22/A, Dalaman', district: 'dalaman', lat: 36.7632691, lng: 28.8030548, rating: '4.5', reviewCount: '304', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'dal-3', name: 'Goodeer coffee', address: 'Mehmet Akif Ersoy 1. Sk. 17a, Dalaman', district: 'dalaman', lat: 36.7636749, lng: 28.8031311, rating: '4.4', reviewCount: '143', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'dal-4', name: 'Nefin Cafe', address: 'Cengiz Topel Cd. 6. Sokak no:9A, Dalaman', district: 'dalaman', lat: 36.7670326, lng: 28.8077075, rating: '4.8', reviewCount: '21', type: 'Kafe', priceRange: '₺100–200' },
  { id: 'dal-5', name: 'Elnade Cafe', address: 'Seyfettin İnce Cd. no:9, Dalaman', district: 'dalaman', lat: 36.766539, lng: 28.8087995, rating: '4.5', reviewCount: '79', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'dal-6', name: 'Dalaman Anne Lezzetleri (D.A.L Kafe Restoran)', address: 'Turgut Reis 12. Sk., Dalaman', district: 'dalaman', lat: 36.7690335, lng: 28.8131804, rating: '4.3', reviewCount: '309', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'dal-7', name: 'Heffalump Coffee Dalaman', address: 'Mehmet Akif Ersoy caddesi No:30 A, Dalaman', district: 'dalaman', lat: 36.7622621, lng: 28.8029652, rating: '5.0', reviewCount: '13', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'dal-8', name: 'Kahve Deryası Dalaman', address: 'Şht. Kubilay Cd. No:1/A, Dalaman', district: 'dalaman', lat: 36.759997, lng: 28.805277, rating: '4.2', reviewCount: '83', type: 'Kafe', priceRange: '₺100–200' },
  { id: 'dal-9', name: 'Dalaman Airport Vesta Cafe', address: 'Kanalbaşı Sok No.40, Dalaman', district: 'dalaman', lat: 36.7337382, lng: 28.809822, rating: '4.8', reviewCount: '66', type: 'Restoran', priceRange: '₺200–400' },
  { id: 'dal-10', name: 'Bayramefendi Osmanlı Kahvecisi', address: 'Atatürk cad. 3, Sokak No: 2 D:E, Dalaman', district: 'dalaman', lat: 36.7665811, lng: 28.8038907, rating: '4.4', reviewCount: '146', type: 'Kafe', priceRange: '₺100–200' },
  { id: 'dal-11', name: "Cafe'deyiz Dalaman", address: 'Hürriyet, Gazi Bulvarı 9. Sk. No:84/D, Dalaman', district: 'dalaman', lat: 36.777951, lng: 28.802501, rating: '4.2', reviewCount: '30', type: 'Kafeterya', priceRange: '' },
  { id: 'dal-12', name: 'Blooming Florist Cafe', address: 'Battal Gazi Cd. 15 B, Dalaman', district: 'dalaman', lat: 36.7832476, lng: 28.8105626, rating: '5.0', reviewCount: '41', type: 'Kafe', priceRange: '' },
  { id: 'dal-13', name: "Glory's Sky Cafe Dalaman", address: 'Ege Cad. NO:12/A, Dalaman', district: 'dalaman', lat: 36.7681614, lng: 28.801354, rating: '4.0', reviewCount: '12', type: 'Kafe', priceRange: '' },
  { id: 'dal-14', name: "Gloria Jean's Coffees Dalaman", address: 'Kenan Evren Bulvarı No:17A, Dalaman', district: 'dalaman', lat: 36.7648407, lng: 28.8000356, rating: '4.7', reviewCount: '65', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'dal-15', name: 'KAHVE SOKAĞI', address: 'Merkez Mahallesi Cumhuriyet Caddesi 1, Sokak No:4, Dalaman', district: 'dalaman', lat: 36.7678067, lng: 28.8019635, rating: '4.0', reviewCount: '426', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'dal-16', name: 'KRAKER', address: 'Atatürk Cad. No:77, Dalaman', district: 'dalaman', lat: 36.766058, lng: 28.80664, rating: '3.5', reviewCount: '272', type: 'Pastane', priceRange: '₺₺' },
  { id: 'dal-17', name: 'Corner Lounge', address: 'Dalaman/Muğla', district: 'dalaman', lat: 36.7661563, lng: 28.8055583, rating: '4.2', reviewCount: '136', type: 'Nargile Salonu', priceRange: '₺400–600' },
  { id: 'dal-18', name: '3in1 COFFEE DALAMAN', address: '3in1 Coffee, Ege Cad., Dalaman', district: 'dalaman', lat: 36.7679202, lng: 28.8011272, rating: '5.0', reviewCount: '12', type: 'Kahve dükkanı', priceRange: '' },
  { id: 'dal-19', name: 'Küçük Ev Park', address: 'Mehmet Akif Ersoy Caddesi No:58, Dalaman', district: 'dalaman', lat: 36.7593317, lng: 28.8030306, rating: '4.5', reviewCount: '878', type: 'Restoran', priceRange: '₺200–400' },
  { id: 'dal-20', name: 'BLISS', address: 'Kocapınar apartmanı, Ömer Musa Siva Cd. 52A, Dalaman', district: 'dalaman', lat: 36.7607161, lng: 28.8090625, rating: '5.0', reviewCount: '31', type: 'Çiçek Tasarımcısı', priceRange: '' },
  { id: 'dal-21', name: 'Boston Drink & Dessert', address: 'Mehmet Akif Ersoy Cad No:28/A, Dalaman', district: 'dalaman', lat: 36.7626183, lng: 28.8029696, rating: '4.7', reviewCount: '69', type: 'Çikolata Dükkanı', priceRange: '' },
  { id: 'dal-22', name: 'MaxBlend Coffee Dalaman', address: 'Celal Bayar Cd. No: 7 D:11, Dalaman', district: 'dalaman', lat: 36.7636128, lng: 28.8017256, rating: '5.0', reviewCount: '24', type: 'Kafe', priceRange: '₺1–200' },
  { id: 'dal-23', name: 'Nar Pub Cafe Restaurant', address: 'Kenan Evren Bulvarı No: 137/C, Dalaman', district: 'dalaman', lat: 36.7497624, lng: 28.8039899, rating: '4.3', reviewCount: '166', type: 'Aile restoranı', priceRange: '' },

  // ==================== ORTACA ====================
  { id: 'ort-1', name: 'La Cafeina Coffee & Croissant', address: 'Atatürk Blv. No:64/A, Ortaca', district: 'ortaca', lat: 36.8434317, lng: 28.7556632, rating: '4.9', reviewCount: '136', type: 'Kafe', priceRange: '₺200–300' },
  { id: 'ort-2', name: 'Coffeemania Ortaca', address: '58. Sk. No:2, Ortaca', district: 'ortaca', lat: 36.8395323, lng: 28.7664436, rating: '4.4', reviewCount: '412', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'ort-3', name: 'Coffee Zemata', address: 'Karaoğlanoğlu Cd. No:45/A, Ortaca', district: 'ortaca', lat: 36.8401433, lng: 28.7662703, rating: '4.7', reviewCount: '136', type: 'Kafe', priceRange: '₺1–200' },
  { id: 'ort-4', name: 'Chemex Coffee Ortaca', address: 'Birol Akkeçeli, 58. Sk. No:4/A, Ortaca', district: 'ortaca', lat: 36.8396376, lng: 28.7665196, rating: '4.7', reviewCount: '84', type: 'Kafe', priceRange: '₺1–400' },
  { id: 'ort-5', name: 'Cetem Kafe Restoran', address: 'Karaoğlanoğlu Cd. No:51/A, Ortaca', district: 'ortaca', lat: 36.840491, lng: 28.765628, rating: '4.3', reviewCount: '185', type: 'Kafe', priceRange: '₺400–600' },
  { id: 'ort-6', name: 'Gua Coffee Company Ortaca', address: 'Atatürk Blv. No:154/1, Ortaca', district: 'ortaca', lat: 36.837924, lng: 28.7667638, rating: '4.4', reviewCount: '68', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'ort-7', name: 'Brew Mood Coffee&Tea ORTACA', address: 'Karaoğlanoğlu Cd. 50a, Ortaca', district: 'ortaca', lat: 36.8406809, lng: 28.7656901, rating: '4.2', reviewCount: '67', type: 'Kafe', priceRange: '₺100–200' },
  { id: 'ort-8', name: 'Luvi Cafe & Bar', address: 'Dalyan Mahallesi, Atatürk Bulvarı, Pirinçler Sk. No:1 C, Ortaca', district: 'ortaca', lat: 36.8345678, lng: 28.6440612, rating: '4.9', reviewCount: '57', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'ort-9', name: 'Coffee Burada', address: 'Atatürk Blv., Ortaca', district: 'ortaca', lat: 36.8420515, lng: 28.7590538, rating: '4.7', reviewCount: '42', type: 'Kahve dükkanı', priceRange: '' },
  { id: 'ort-10', name: 'Kahve Deryasi Ortaca', address: 'Cumhuriyet Cd. No:9, Ortaca', district: 'ortaca', lat: 36.843471, lng: 28.7686521, rating: '4.5', reviewCount: '103', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'ort-11', name: "PEOPLE'S RESTAURANT COFFEE", address: 'Atatürk Blv. No:116 D:C, Ortaca', district: 'ortaca', lat: 36.839988, lng: 28.7630424, rating: '4.7', reviewCount: '852', type: 'Restoran', priceRange: '₺200–600' },
  { id: 'ort-12', name: 'Public Coffee and More Ortaca', address: 'Karaoğlanoğlu Cd. 47/1, Ortaca', district: 'ortaca', lat: 36.8402424, lng: 28.7660456, rating: '4.6', reviewCount: '13', type: 'Kafe', priceRange: '₺200–300' },
  { id: 'ort-13', name: 'Melek Anne Cafe', address: 'Kaunos Sk. No:12, Ortaca', district: 'ortaca', lat: 36.8284624, lng: 28.6362913, rating: '4.4', reviewCount: '690', type: 'Kafe', priceRange: '₺₺' },
  { id: 'ort-14', name: 'Mavi Yasemin Dalyan', address: 'Dalyan Horozlar Köyü, Ortaca', district: 'ortaca', lat: 36.8468269, lng: 28.6275642, rating: '4.9', reviewCount: '215', type: 'Kafe', priceRange: '₺400–600' },
  { id: 'ort-15', name: 'No 8 ART & DESIGN CAFE', address: 'Maraş Cd. No:18, Ortaca', district: 'ortaca', lat: 36.8337853, lng: 28.641839, rating: '4.5', reviewCount: '80', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'ort-16', name: 'Bayramefendi Osmanlı Kahvecisi', address: 'Atatürk Mah 253. Sokak No:6, Ortaca', district: 'ortaca', lat: 36.8400382, lng: 28.7653457, rating: '4.1', reviewCount: '587', type: 'Kahve dükkanı', priceRange: '₺1–100' },
  { id: 'ort-17', name: 'Karamel Cafe', address: '190. Sk. 14-16, Ortaca', district: 'ortaca', lat: 36.8352091, lng: 28.7662407, rating: '4.2', reviewCount: '177', type: 'Kafe', priceRange: '₺200–300' },
  { id: 'ort-18', name: 'Bob Cafe', address: 'Atatürk Blv. No:62/C, Ortaca', district: 'ortaca', lat: 36.8435305, lng: 28.7554558, rating: '5.0', reviewCount: '21', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'ort-19', name: 'Dal Coffee / Sinek 8 / No: 8', address: 'Maraş Cd. No:8, Ortaca', district: 'ortaca', lat: 36.8337649, lng: 28.6417752, rating: '5.0', reviewCount: '75', type: 'Kahve dükkanı', priceRange: '' },
  { id: 'ort-20', name: "Limon's Cafe", address: 'Atatürk Blv. No:53, Ortaca', district: 'ortaca', lat: 36.8423225, lng: 28.7590359, rating: '4.3', reviewCount: '33', type: 'Sağlıklı Yiyecek Mağazası', priceRange: '' },

  // ==================== MUĞLA MERKEZ / KÖTEKLİ ====================
  { id: 'mug-1', name: 'Lightroom Coffee & Kitchen Muğla', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2178987, lng: 28.3644494, rating: '4.5', reviewCount: '449', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'mug-2', name: 'Kontrbus Coffee Co. Muğla', address: 'Merkez/Muğla', district: 'mugla-merkez', lat: 37.2182681, lng: 28.3565143, rating: '4.7', reviewCount: '87', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'mug-3', name: 'Harvest Coffee', address: 'Avcılar Sk. No:6B, Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2130719, lng: 28.36199, rating: '5.0', reviewCount: '52', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'mug-4', name: 'Latife Türk Kahvesi Muğla (Merkez)', address: 'Merkez/Muğla', district: 'mugla-merkez', lat: 37.2158161, lng: 28.3626163, rating: '4.7', reviewCount: '279', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'mug-5', name: 'Salve', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1956723, lng: 28.3685888, rating: '4.6', reviewCount: '235', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'mug-6', name: 'Coffeemania Next Muğla', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1919347, lng: 28.3697387, rating: '4.6', reviewCount: '35', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'mug-7', name: 'Cafe De Son', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1700911, lng: 28.3760043, rating: '4.5', reviewCount: '113', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'mug-8', name: 'Coffy Muğla Merkez', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1920031, lng: 28.3712034, rating: '4.5', reviewCount: '86', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'mug-9', name: 'Yakın Specialty Coffee Shop', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2143218, lng: 28.3590282, rating: '4.8', reviewCount: '41', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'mug-10', name: 'Yeşil Beyaz Muğla Menteşe', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.2117099, lng: 28.362716, rating: '4.0', reviewCount: '124', type: 'Kafe', priceRange: '' },
  { id: 'mug-11', name: 'LUSI Coffee', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.212547, lng: 28.36137, rating: '4.7', reviewCount: '32', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'mug-12', name: 'Assos Extra', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2081921, lng: 28.3638939, rating: '4.1', reviewCount: '663', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'mug-13', name: 'LE PARİS CAFE', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1928353, lng: 28.3695835, rating: '4.6', reviewCount: '57', type: 'Restoran', priceRange: '' },
  { id: 'mug-14', name: 'Pablo Cafe', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1932356, lng: 28.3696141, rating: '4.2', reviewCount: '1600', type: 'Restoran', priceRange: '₺₺' },
  { id: 'mug-15', name: 'JOPLİN COFFEE MUĞLA', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2107155, lng: 28.3596275, rating: '4.4', reviewCount: '93', type: 'Kafe', priceRange: '₺1–100' },
  { id: 'mug-16', name: 'Stand Up! Coffee', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1947187, lng: 28.3691681, rating: '5.0', reviewCount: '17', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'mug-17', name: 'Keyf-i çikin kafe, nargile, okey eğlence bahçesi', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2149664, lng: 28.3651158, rating: '4.7', reviewCount: '89', type: 'Kafe', priceRange: '₺700–800' },
  { id: 'mug-18', name: 'Atapark Menteşe', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2155809, lng: 28.3633405, rating: '4.3', reviewCount: '642', type: 'Kafe', priceRange: '₺1–200' },
  { id: 'mug-19', name: 'MackBear Coffee Co.', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1929712, lng: 28.371505, rating: '4.1', reviewCount: '124', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'mug-20', name: 'Gufo Gastro', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1963367, lng: 28.3690549, rating: '4.4', reviewCount: '320', type: 'Restoran', priceRange: '₺₺' },
  { id: 'mug-21', name: 'GOA Kötekli', address: 'Kötekli, Menteşe/Muğla', district: 'mugla-merkez', lat: 37.168216, lng: 28.382347, rating: '4.1', reviewCount: '64', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'mug-22', name: 'Margo coffee&more', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2113581, lng: 28.3602779, rating: '4.5', reviewCount: '49', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'mug-23', name: 'Yummy Coffee & More - Muğla', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2142557, lng: 28.3622979, rating: '4.8', reviewCount: '28', type: 'Kahve dükkanı', priceRange: '₺1–400' },
  { id: 'mug-24', name: 'Hâne Cafe', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1710072, lng: 28.3782794, rating: '4.4', reviewCount: '49', type: 'Kafe', priceRange: '' },
  { id: 'mug-25', name: 'Bayramefendi Osmanlı Kahvecisi', address: 'Merkez/Muğla', district: 'mugla-merkez', lat: 37.1916125, lng: 28.3719268, rating: '4.3', reviewCount: '68', type: 'Kahve dükkanı', priceRange: '₺1–100' },
  { id: 'mug-26', name: 'Latife Kötekli', address: 'Kötekli, Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1682271, lng: 28.3830957, rating: '4.4', reviewCount: '128', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'mug-27', name: 'Mono coffee', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1683704, lng: 28.3810386, rating: '3.8', reviewCount: '59', type: 'Kafe', priceRange: '₺100–200' },
  { id: 'mug-28', name: 'Mackbear Coffee', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1929712, lng: 28.371505, rating: '3.9', reviewCount: '104', type: 'Kafe', priceRange: '₺1–100' },
  { id: 'mug-29', name: 'Muğla Kötekli Coffy', address: 'Kötekli, Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1699232, lng: 28.380506, rating: '4.4', reviewCount: '91', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'mug-30', name: 'Arabica Coffee House Muğla Kötekli', address: 'Kötekli, Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1694036, lng: 28.3811426, rating: '4.3', reviewCount: '113', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'mug-31', name: 'Müco', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.213914, lng: 28.3590489, rating: '4.3', reviewCount: '1200', type: 'Restoran', priceRange: '₺400–600' },
  { id: 'mug-32', name: 'MOLAPARK MUĞLA', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1766274, lng: 28.4255261, rating: '4.9', reviewCount: '141', type: 'Kafeterya', priceRange: '' },
  { id: 'mug-33', name: 'Nun Cocktails', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1958616, lng: 28.3685694, rating: '4.6', reviewCount: '7', type: 'Kahve dükkanı', priceRange: '' },
  { id: 'mug-34', name: 'Social Park Kötekli', address: 'Kötekli, Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1678089, lng: 28.3836853, rating: '3.7', reviewCount: '91', type: 'Kafe', priceRange: '₺1–100' },
  { id: 'mug-35', name: 'Galata Cafe Kötekli', address: 'Kötekli, Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1681929, lng: 28.3807798, rating: '4.1', reviewCount: '410', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'mug-36', name: 'Brew Mood', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.2138487, lng: 28.365083, rating: '4.3', reviewCount: '18', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'mug-37', name: 'Coffee Break', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.215565, lng: 28.361594, rating: '4.4', reviewCount: '25', type: 'Kahve dükkanı', priceRange: '' },
  { id: 'mug-38', name: 'Pablo Artisan Coffee', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1933882, lng: 28.3697364, rating: '3.9', reviewCount: '26', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'mug-39', name: 'Pablo Artisan Coffee (2)', address: 'Kötekli, Menteşe/Muğla', district: 'mugla-merkez', lat: 37.168961, lng: 28.381327, rating: '4.4', reviewCount: '45', type: 'Kahve dükkanı', priceRange: '₺₺' },
  { id: 'mug-40', name: 'Gua Coffee', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.2177879, lng: 28.3586681, rating: '3.5', reviewCount: '25', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'mug-41', name: 'Yeşilçam Cafe', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1644099, lng: 28.3860024, rating: '4.1', reviewCount: '160', type: 'Kafe', priceRange: '' },
  { id: 'mug-42', name: 'Waffle Inn Cafe', address: 'Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1691899, lng: 28.3815783, rating: '3.9', reviewCount: '82', type: 'Kafeterya', priceRange: '₺100–300' },
  { id: 'mug-43', name: 'Baykuş Cafe', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1655633, lng: 28.3855119, rating: '4.4', reviewCount: '100', type: 'Kafe', priceRange: '₺1–100' },
  { id: 'mug-44', name: 'Kahve Sokağı', address: 'Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1887409, lng: 28.3694164, rating: '4.2', reviewCount: '129', type: 'Kafe', priceRange: '' },
  { id: 'mug-45', name: 'Kukla Cafe&Pub', address: 'Sıtkı Koçman Cd No:62, Kötekli', district: 'mugla-merkez', lat: 37.167615, lng: 28.383118, rating: '4.2', reviewCount: '510', type: 'Pub', priceRange: '₺200–300' },
  { id: 'mug-46', name: 'Mamut Kötekli', address: 'Sıtkı Koçman Cd, Kötekli', district: 'mugla-merkez', lat: 37.1704683, lng: 28.3793656, rating: '3.9', reviewCount: '116', type: 'Bar', priceRange: '₺100–200' },
  { id: 'mug-47', name: 'Mazot Bar Kötekli', address: 'Kötekli, Muğla Merkez/Muğla', district: 'mugla-merkez', lat: 37.1679414, lng: 28.3829713, rating: '3.9', reviewCount: '65', type: 'Bar', priceRange: '₺₺' },
  { id: 'mug-48', name: 'No:62 cafe pub', address: 'Sıtkı Koçman Cd No:60, Kötekli', district: 'mugla-merkez', lat: 37.167727, lng: 28.3832102, rating: '4.7', reviewCount: '24', type: 'Pub', priceRange: '' },
  { id: 'mug-49', name: 'Tosbaa', address: 'Sıtkı Koçman Cd No:107, Kötekli', district: 'mugla-merkez', lat: 37.1676989, lng: 28.3832486, rating: '4.3', reviewCount: '35', type: 'Pub', priceRange: '' },
  { id: 'mug-50', name: 'Gold & black', address: 'Sıtkı Koçman Cd No:59, Kötekli', district: 'mugla-merkez', lat: 37.170488, lng: 28.379581, rating: '4.9', reviewCount: '12', type: 'Pub', priceRange: '' },
  { id: 'mug-51', name: 'Rowdy Pub', address: 'Sıtkı Koçman Cd No:22, Kötekli', district: 'mugla-merkez', lat: 37.170644, lng: 28.378839, rating: '4.2', reviewCount: '39', type: 'Pub', priceRange: '₺1.000+' },
  { id: 'mug-52', name: '50CLPUB KÖTEKLİ', address: 'Sıtkı Koçman Cd No:42/b, Kötekli', district: 'mugla-merkez', lat: 37.1691464, lng: 28.3809907, rating: '2.6', reviewCount: '15', type: 'Pub', priceRange: '' },
  { id: 'mug-53', name: 'Up Stairs Kötekli', address: 'Sıtkı Koçman Cd No:42/b, Kötekli', district: 'mugla-merkez', lat: 37.1691464, lng: 28.3809907, rating: '3.9', reviewCount: '15', type: 'Bar', priceRange: '' },
  { id: 'mug-54', name: 'Kukla Pub Akyaka', address: 'Akyaka, Ula/Muğla', district: 'mugla-merkez', lat: 37.0518376, lng: 28.3258831, rating: '4.7', reviewCount: '92', type: 'Bar', priceRange: '' },
  { id: 'mug-55', name: 'Meyland', address: 'Sıtkı Koçman Cd No:44, Kötekli', district: 'mugla-merkez', lat: 37.168756, lng: 28.381744, rating: '4.0', reviewCount: '2', type: 'Bar', priceRange: '' },
  { id: 'mug-56', name: 'Nazar Etçim', address: 'Ula/Muğla', district: 'mugla-merkez', lat: 37.1150099, lng: 28.3864591, rating: '4.7', reviewCount: '662', type: 'Et Lokantası', priceRange: '₺400–600' },

  // ==================== FETHİYE ====================
  // --- Kafeler & Kahve Dükkanları ---
  { id: 'fet-1', name: 'Chez La Vie Coffee & Eatery', address: 'Karagözler, Fevzi Çakmak Cd. No:91, Fethiye', district: 'fethiye', lat: 36.6203867, lng: 29.0953465, rating: '4.8', reviewCount: '813', type: 'Restoran', priceRange: '₺400–800' },
  { id: 'fet-2', name: 'Doc Coffee Co.', address: 'Yerguzlar Cd. 58 A, Fethiye', district: 'fethiye', lat: 36.6583802, lng: 29.1212342, rating: '4.8', reviewCount: '559', type: 'Kahve dükkanı', priceRange: '₺400–600' },
  { id: 'fet-3', name: 'Köşe Kahve Fethiye', address: 'Kaya Cd. 118 sokak, Fethiye', district: 'fethiye', lat: 36.6202075, lng: 29.1177709, rating: '4.8', reviewCount: '1200', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'fet-4', name: 'C.R.E.A.M. "Coffee Rules Everything Around Me"', address: '38. Sk. No:4, Fethiye', district: 'fethiye', lat: 36.6217424, lng: 29.1077362, rating: '4.7', reviewCount: '335', type: 'Kahve dükkanı', priceRange: '₺400–600' },
  { id: 'fet-5', name: 'Trio Cafe', address: 'Sadi Berkman Cd. No:3, Fethiye', district: 'fethiye', lat: 36.6289559, lng: 29.1179447, rating: '4.7', reviewCount: '783', type: 'Kahvaltı', priceRange: '' },
  { id: 'fet-6', name: 'Romm Coffee Fethiye', address: '500. Sk. No:3 D:A, Fethiye', district: 'fethiye', lat: 36.6238156, lng: 29.1145375, rating: '4.6', reviewCount: '158', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'fet-7', name: 'KeçiCoffeeRoastery', address: '504. Sk., Fethiye', district: 'fethiye', lat: 36.6240272, lng: 29.1137635, rating: '4.8', reviewCount: '460', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'fet-8', name: 'Serazat Kafe', address: '93. Sok no:4 F, Fethiye', district: 'fethiye', lat: 36.6209300, lng: 29.1097142, rating: '4.8', reviewCount: '216', type: 'Nargile Salonu', priceRange: '₺200–400' },
  { id: 'fet-9', name: 'Cofhilus Coffee (Kordon)', address: 'Tuzla mah. Cahit Gündüz Cd. No:18, Fethiye', district: 'fethiye', lat: 36.6289812, lng: 29.1177265, rating: '4.5', reviewCount: '221', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'fet-10', name: '2MB Sole Coffee & Eatery', address: 'Uşaklı villaları, Cahit Gündüz Cd. no:100/1, Fethiye', district: 'fethiye', lat: 36.6432797, lng: 29.1216506, rating: '4.8', reviewCount: '192', type: 'Kafe', priceRange: '₺200–600' },
  { id: 'fet-11', name: 'Homemade', address: 'Dispanser Cd. No:17/A, Fethiye', district: 'fethiye', lat: 36.6233512, lng: 29.1135387, rating: '4.6', reviewCount: '304', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'fet-12', name: 'Cervos Coffee Roasters', address: '1054. Sk., Fethiye', district: 'fethiye', lat: 36.6625936, lng: 29.1083616, rating: '4.6', reviewCount: '214', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'fet-13', name: 'Chemex Coffee Fethiye', address: '93(cmh) Sk No.2, Fethiye', district: 'fethiye', lat: 36.6212114, lng: 29.1095856, rating: '4.4', reviewCount: '107', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'fet-14', name: "EY's Cafe-bistro", address: '1054. Sk. No:80, Fethiye', district: 'fethiye', lat: 36.6653529, lng: 29.1067397, rating: '4.6', reviewCount: '206', type: 'Pub', priceRange: '' },
  { id: 'fet-15', name: 'Coffee de Madrid Fethiye', address: '500. Sk. No:8/A, Fethiye', district: 'fethiye', lat: 36.6240004, lng: 29.1144943, rating: '4.4', reviewCount: '276', type: 'Kahve dükkanı', priceRange: '₺1–400' },
  { id: 'fet-16', name: 'No48coffee', address: 'Atatürk Cd. No:18 D:C, Fethiye', district: 'fethiye', lat: 36.6220003, lng: 29.1081174, rating: '4.8', reviewCount: '356', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'fet-17', name: 'Babafırın', address: 'Yerguzlar Cd. No:49, Fethiye', district: 'fethiye', lat: 36.6589930, lng: 29.1204520, rating: '4.3', reviewCount: '1300', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'fet-18', name: 'Unicorn Coffee', address: 'Baha Şıkman Cd. no:106, Fethiye', district: 'fethiye', lat: 36.6192322, lng: 29.1361716, rating: '4.3', reviewCount: '83', type: 'Kafe', priceRange: '₺1–400' },
  { id: 'fet-19', name: 'YEZİ COFFEE-WINE-FOOD', address: 'Yerguzlar Cd. NO:63/B, Fethiye', district: 'fethiye', lat: 36.6608799, lng: 29.1195299, rating: '4.6', reviewCount: '198', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'fet-20', name: 'Sirius Coffee', address: 'Cumhuriyet Caddesi, 504. Sk. No:3, Fethiye', district: 'fethiye', lat: 36.6241319, lng: 29.1140432, rating: '4.9', reviewCount: '200', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'fet-21', name: 'NOMADES Cafe & Restaurant', address: 'Çarşı Cd., Fethiye', district: 'fethiye', lat: 36.6206001, lng: 29.1138050, rating: '4.7', reviewCount: '1300', type: 'Avrupa', priceRange: '₺₺' },
  { id: 'fet-22', name: 'Gold Semaver', address: 'Cahit Gündüz Cd. No:29, Fethiye', district: 'fethiye', lat: 36.6380124, lng: 29.1212918, rating: '4.3', reviewCount: '2300', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'fet-23', name: 'Çikolata Evim Fethiye', address: '500. Sk. No:4 İç Kapı No:1, Fethiye', district: 'fethiye', lat: 36.6241869, lng: 29.1143996, rating: '4.7', reviewCount: '1300', type: 'Çikolata Dükkanı', priceRange: '' },
  { id: 'fet-24', name: 'Happy Corner Cafe', address: '1054. Sk. No:10, Fethiye', district: 'fethiye', lat: 36.6586716, lng: 29.1102367, rating: '4.3', reviewCount: '30', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'fet-25', name: 'MACKBEAR COFFEE CO. (Fethiye)', address: 'Dispanser Cd. No:15/A, Fethiye', district: 'fethiye', lat: 36.6236671, lng: 29.1135975, rating: '4.2', reviewCount: '202', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'fet-26', name: 'TukTuk Cafee Fethiye', address: 'Şehit Fethi Bey Parkı önü, Sahil bandı girişi, Fethiye', district: 'fethiye', lat: 36.6484141, lng: 29.1216360, rating: '4.5', reviewCount: '58', type: 'Kahve dükkanı', priceRange: '₺1–100' },
  { id: 'fet-27', name: 'Avocado Garden Coffee', address: 'Esenli Sokak 39/2, Fethiye', district: 'fethiye', lat: 36.6997278, lng: 29.0649936, rating: '4.6', reviewCount: '57', type: 'Kahvaltı', priceRange: '₺100–200' },
  { id: 'fet-28', name: 'Nude Restaurant Fethiye', address: '30. Sk. No:43/A, Fethiye', district: 'fethiye', lat: 36.6220532, lng: 29.1032333, rating: '4.6', reviewCount: '202', type: 'Restoran', priceRange: '' },
  { id: 'fet-29', name: 'Cervos Coffee Roasters Akarca', address: 'Yerguzlar Cd. no:25/3, Fethiye', district: 'fethiye', lat: 36.6555331, lng: 29.1222320, rating: '4.5', reviewCount: '93', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'fet-30', name: 'Apple Cafe', address: 'Çarşı Cd. No:35 D:B, Fethiye', district: 'fethiye', lat: 36.6205785, lng: 29.1093869, rating: '4.7', reviewCount: '300', type: 'Kahvaltı', priceRange: '₺600–800' },
  { id: 'fet-31', name: 'Fratelli Coffee Roasters Co.', address: 'Çalış, Foça mah. Mustafa Kemal Bulvarı, 1002. Sk., Fethiye', district: 'fethiye', lat: 36.6608208, lng: 29.1132901, rating: '4.9', reviewCount: '152', type: 'Kahve dükkanı', priceRange: '₺1–100' },
  { id: 'fet-32', name: 'Mior Coffee&Cocktail', address: 'Cumhuriyet Mah. 41. Sokak, Cami Sokağı No:2, Fethiye', district: 'fethiye', lat: 36.6218115, lng: 29.1086742, rating: '4.9', reviewCount: '79', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'fet-33', name: 'Marine Restaurant', address: 'Cahit Gündüz Cd. No:19, Fethiye', district: 'fethiye', lat: 36.6350463, lng: 29.1212019, rating: '4.0', reviewCount: '741', type: 'Restoran', priceRange: '₺400–600' },
  { id: 'fet-34', name: 'Address Restaurant & Cafe Bar', address: 'Cumhuriyet Mh. Kordon Boyu No:9, Fethiye', district: 'fethiye', lat: 36.6230901, lng: 29.1104849, rating: '4.3', reviewCount: '1500', type: 'Kafe', priceRange: '₺₺' },
  { id: 'fet-35', name: 'Cafe MOOD', address: 'Ölüdeniz Cd. no:39/1-A, Fethiye', district: 'fethiye', lat: 36.5788883, lng: 29.1564667, rating: '5.0', reviewCount: '19', type: 'Kahve dükkanı', priceRange: '₺200–300' },
  { id: 'fet-36', name: "Gloria Jean's Coffee", address: '502. Sk. No:03, Fethiye', district: 'fethiye', lat: 36.6229981, lng: 29.1120278, rating: '3.7', reviewCount: '118', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'fet-37', name: 'Onur Cafe Beach', address: 'Foça Mah. Köçek Mustafa Cd. 1439. Sk., Fethiye', district: 'fethiye', lat: 36.6701082, lng: 29.1036975, rating: '4.5', reviewCount: '153', type: 'Akdeniz', priceRange: '₺400–600' },
  { id: 'fet-38', name: 'Tenten Fethiye', address: '500. Sk. No:8/B, Fethiye', district: 'fethiye', lat: 36.6238225, lng: 29.1143969, rating: '4.3', reviewCount: '178', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'fet-39', name: 'LimonH2O cafe bistro', address: 'Atatürk Cd, Cumhuriyet Mh, Fethiye', district: 'fethiye', lat: 36.6224145, lng: 29.1107412, rating: '4.3', reviewCount: '861', type: 'Kafe', priceRange: '₺₺' },
  { id: 'fet-40', name: 'CLOTHO LOUNGE & CONCEPT STORE', address: 'Atatürk Cd. No:22, Fethiye', district: 'fethiye', lat: 36.6220195, lng: 29.1082577, rating: '3.8', reviewCount: '62', type: 'Kafe', priceRange: '₺100–200' },
  { id: 'fet-41', name: 'Coffee Island', address: 'Fethiye/Muğla', district: 'fethiye', lat: 36.6534606, lng: 29.1174163, rating: '4.5', reviewCount: '32', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'fet-42', name: 'Cafe Park Teras', address: 'Gaffar Okkan Cd. Se-Sa İş Merkezi No:8, Fethiye', district: 'fethiye', lat: 36.6245832, lng: 29.1153991, rating: '4.2', reviewCount: '450', type: 'Kafe', priceRange: '₺800–1000' },
  { id: 'fet-43', name: 'Gustorante Cafe More Fethiye', address: 'Yerguzlar Cd. No:40/A, Fethiye', district: 'fethiye', lat: 36.6565129, lng: 29.1224274, rating: '4.3', reviewCount: '493', type: 'Kafe', priceRange: '' },
  { id: 'fet-44', name: 'To Be Social House', address: '905. Sk. No:7, Fethiye', district: 'fethiye', lat: 36.6513914, lng: 29.1245501, rating: '4.5', reviewCount: '477', type: 'Restoran', priceRange: '' },
  { id: 'fet-45', name: 'Martı Coffee', address: '510. Sk. lezzetleri no:12, Fethiye', district: 'fethiye', lat: 36.6246365, lng: 29.1184955, rating: '5.0', reviewCount: '40', type: 'Kahve dükkanı', priceRange: '₺1–200' },
  { id: 'fet-46', name: 'Bizim Kahveci Nargile Cafe Dark Leaf', address: '186. Sk. No:10, Fethiye', district: 'fethiye', lat: 36.5710173, lng: 29.1335897, rating: '4.7', reviewCount: '357', type: 'Kafe', priceRange: '' },
  { id: 'fet-47', name: 'Panama Coffee Fethiye', address: 'Çalış Plajı, 1030. Sk. no:117, Fethiye', district: 'fethiye', lat: 36.6599523, lng: 29.1097370, rating: '4.7', reviewCount: '83', type: 'Kahve dükkanı', priceRange: '₺1–400' },
  { id: 'fet-48', name: 'Middoor Restorant Cafe&Bar', address: '1085. Sk. No:19, Fethiye', district: 'fethiye', lat: 36.6657330, lng: 29.1070030, rating: '4.6', reviewCount: '170', type: 'Restoran', priceRange: '' },
  { id: 'fet-49', name: 'Hann Coffee Roastery', address: '1054. Sk. no:70/b, Fethiye', district: 'fethiye', lat: 36.6637749, lng: 29.1080088, rating: '4.4', reviewCount: '67', type: 'Kahve dükkanı', priceRange: '₺200–400' },
  { id: 'fet-50', name: 'Coffee Teo', address: 'Çarşı Cd. No:40, Fethiye', district: 'fethiye', lat: 36.6205081, lng: 29.1091915, rating: '5.0', reviewCount: '14', type: 'Kahve dükkanı', priceRange: '₺100–200' },
  { id: 'fet-51', name: 'Ruzanna Food & Etc.', address: 'Fevzi Çakmak Cd. No:19, Fethiye', district: 'fethiye', lat: 36.6222212, lng: 29.1040511, rating: '4.3', reviewCount: '148', type: 'Restoran', priceRange: '' },
  { id: 'fet-52', name: 'Ebru Hanım Kahve', address: 'Tuzla Mah. Pürşah Bey Cd. no:39, 97. Sk. No:11/R, Fethiye', district: 'fethiye', lat: 36.6207958, lng: 29.1116835, rating: '4.9', reviewCount: '56', type: 'Kahve dükkanı', priceRange: '₺200–300' },
  { id: 'fet-53', name: 'Kahve Durağı Fethiye', address: 'ERASTA AVM, Ölüdeniz Cd. No:14, Fethiye', district: 'fethiye', lat: 36.6222678, lng: 29.1324911, rating: '3.8', reviewCount: '292', type: 'Kahve Mağazası', priceRange: '₺100–200' },
  { id: 'fet-54', name: 'Yemen Kurukahve ve Cafe Fethiye', address: 'Ölüdeniz Cd. No:26, Fethiye', district: 'fethiye', lat: 36.6203462, lng: 29.1329148, rating: '4.8', reviewCount: '12', type: 'Kahve dükkanı', priceRange: '' },
  { id: 'fet-55', name: 'Kahve Diyarı', address: 'Cahit Gündüz Cd. NO:11, Fethiye', district: 'fethiye', lat: 36.6327192, lng: 29.1194869, rating: '3.9', reviewCount: '743', type: 'Kafe', priceRange: '₺200–300' },
  { id: 'fet-56', name: 'Özsüt', address: 'Atatürk Cd. No:3, Fethiye', district: 'fethiye', lat: 36.6219000, lng: 29.1072758, rating: '3.6', reviewCount: '1200', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'fet-57', name: 'Mancero Kitchen', address: 'Cahit Gündüz Cd. No:13, Fethiye', district: 'fethiye', lat: 36.6334793, lng: 29.1200201, rating: '4.2', reviewCount: '1400', type: 'Restoran', priceRange: '₺₺₺' },
  { id: 'fet-58', name: 'Bolulu Hasan Usta Fethiye', address: 'Cahit Gündüz Cd. No:34/C, Fethiye', district: 'fethiye', lat: 36.6309326, lng: 29.1186668, rating: '4.3', reviewCount: '830', type: 'Tatlı', priceRange: '₺200–400' },
  { id: 'fet-59', name: 'Kül Kafe Restorant', address: 'Fethiye/Muğla', district: 'fethiye', lat: 36.6340347, lng: 29.1203213, rating: '4.0', reviewCount: '1200', type: 'Restoran', priceRange: '₺400–600' },

  // --- Barlar, Publar & Gece Kulüpleri ---
  { id: 'fet-60', name: 'Deep Blue Bar', address: '27 Hamam Sokak, Paspatur, Fethiye', district: 'fethiye', lat: 36.6211336, lng: 29.1079776, rating: '4.5', reviewCount: '1000', type: 'Bar', priceRange: '₺₺' },
  { id: 'fet-61', name: 'Boğa Club & Terrace', address: '45. Sk. No:10, Fethiye', district: 'fethiye', lat: 36.6210902, lng: 29.1082680, rating: '4.0', reviewCount: '547', type: 'Gece kulübü', priceRange: '₺₺₺₺' },
  { id: 'fet-62', name: 'Elma Music & Dance', address: '45. Sk. No:35, Fethiye', district: 'fethiye', lat: 36.6210793, lng: 29.1075201, rating: '3.4', reviewCount: '102', type: 'Gece kulübü', priceRange: '₺1000+' },
  { id: 'fet-63', name: 'Avalon Fethiye', address: '47. Sk. No:9, Fethiye', district: 'fethiye', lat: 36.6214057, lng: 29.1072869, rating: '3.9', reviewCount: '309', type: 'Gece kulübü', priceRange: '' },
  { id: 'fet-64', name: 'Kum Saati Lounge Bar', address: '45.Sokak No:31 Paspatur, Fethiye', district: 'fethiye', lat: 36.6211301, lng: 29.1079324, rating: '3.8', reviewCount: '176', type: 'Bar', priceRange: '' },
  { id: 'fet-65', name: 'Buzz Bar Downtown', address: '45. Sk. No:33, Fethiye', district: 'fethiye', lat: 36.6210960, lng: 29.1076161, rating: '3.5', reviewCount: '118', type: 'Gece kulübü', priceRange: '₺1000+' },
  { id: 'fet-66', name: 'Paspatur Old Town (Eski Şehir)', address: 'Çarşı Cd. No:48/B, Fethiye', district: 'fethiye', lat: 36.6219578, lng: 29.1078515, rating: '4.3', reviewCount: '3700', type: 'Çarşı', priceRange: '' },
  { id: 'fet-67', name: 'Büyükev Pub & Kitchen', address: '96. Sk. No:12, Fethiye', district: 'fethiye', lat: 36.6212194, lng: 29.1102799, rating: '4.5', reviewCount: '539', type: 'Pub', priceRange: '₺400–600' },
  { id: 'fet-68', name: 'Nesil Paspatur', address: '38. Sk. No:17 Paspatur, Fethiye', district: 'fethiye', lat: 36.6211877, lng: 29.1077919, rating: '4.7', reviewCount: '35', type: 'Restoran', priceRange: '₺900–1000' },
  { id: 'fet-69', name: 'Spica', address: 'Paspatur Amintas Kapısı, 53 Sk no:5/B, Fethiye', district: 'fethiye', lat: 36.6205606, lng: 29.1090122, rating: '5.0', reviewCount: '50', type: 'Gece kulübü', priceRange: '' },
  { id: 'fet-70', name: 'XLOUNGEPUB', address: '96. Sk. No:11, Fethiye', district: 'fethiye', lat: 36.6214078, lng: 29.1099800, rating: '4.1', reviewCount: '246', type: 'Bar', priceRange: '₺400–600' },
  { id: 'fet-71', name: 'Mejnun Club', address: 'Fethiye/Muğla', district: 'fethiye', lat: 36.6211906, lng: 29.1077372, rating: '3.5', reviewCount: '94', type: 'Bar', priceRange: '₺300–400' },
  { id: 'fet-72', name: 'The Duck Pond Restaurant Cafe&Bar', address: 'Paspatur Çarşısı, 41. Sk. No:15, Fethiye', district: 'fethiye', lat: 36.6210716, lng: 29.1085865, rating: '4.1', reviewCount: '239', type: 'Öğle Yemeği', priceRange: '₺₺' },
  { id: 'fet-73', name: '4Corner Bar', address: 'Atatürk Cd., Fethiye', district: 'fethiye', lat: 36.6215272, lng: 29.1072987, rating: '4.4', reviewCount: '187', type: 'Bar', priceRange: '' },
  { id: 'fet-74', name: 'Jewel Lounge Bar', address: '96. Sk. No:4, Fethiye', district: 'fethiye', lat: 36.6214255, lng: 29.1096525, rating: '4.6', reviewCount: '166', type: 'Restoran', priceRange: '' },
  { id: 'fet-75', name: 'Minimal Pub', address: 'Fevzi Çakmak Cd. No:11, Fethiye', district: 'fethiye', lat: 36.6210914, lng: 29.1057190, rating: '4.7', reviewCount: '205', type: 'Pub', priceRange: '₺200–300' },
  { id: 'fet-76', name: 'mejnun bar', address: 'Cumhuriyet Mah. 39 sosak no:16, Fethiye', district: 'fethiye', lat: 36.6195761, lng: 29.0929346, rating: '2.8', reviewCount: '16', type: 'Bar', priceRange: '' },
  { id: 'fet-77', name: 'The Mulberry Tree Cafe-Restaurant', address: 'Fethiye/Muğla', district: 'fethiye', lat: 36.6206251, lng: 29.1093553, rating: '4.7', reviewCount: '222', type: 'Restoran', priceRange: '' },
  { id: 'fet-78', name: "Joseph's Bar", address: '996. Sk. No:2, Fethiye', district: 'fethiye', lat: 36.6609911, lng: 29.1117636, rating: '4.6', reviewCount: '66', type: 'Bar', priceRange: '₺1–100' },
  { id: 'fet-79', name: 'Paspatur Kitchen', address: 'Paspatur, Fethiye/Muğla', district: 'fethiye', lat: 36.6210000, lng: 29.1090000, rating: '4.0', reviewCount: '1', type: 'Restoran', priceRange: '' },
  { id: 'fet-80', name: 'Eski Ev Pub & Kitchen', address: 'Çarşı Cd. Üstyol no:194, Fethiye', district: 'fethiye', lat: 36.6205099, lng: 29.1142162, rating: '4.9', reviewCount: '90', type: 'Vegan', priceRange: '' },
  { id: 'fet-81', name: 'Ördek Bar', address: 'Paspatur, Fethiye', district: 'fethiye', lat: 36.6208614, lng: 29.1087395, rating: '3.8', reviewCount: '13', type: 'Bar', priceRange: '' },
  { id: 'fet-82', name: 'PASPATUR MEYHANESİ', address: 'Cumhuriyet Mah. 45. Sokak, no:11, Paspatur, Fethiye', district: 'fethiye', lat: 36.6211000, lng: 29.1078000, rating: '4.7', reviewCount: '31', type: 'Meyhane', priceRange: '' },
  { id: 'fet-83', name: 'Paspatur Döner', address: 'Atatürk Cd. no:22C, Fethiye', district: 'fethiye', lat: 36.6220195, lng: 29.1082577, rating: '5.0', reviewCount: '633', type: 'Dönerci', priceRange: '₺1–200' },
];

// İlçeye göre mekanları getir
export const getVenuesByDistrict = (districtId: string): Venue[] => {
  return VENUES.filter(v => v.district === districtId);
};

// ID'ye göre mekan getir
export const getVenueById = (venueId: string): Venue | undefined => {
  return VENUES.find(v => v.id === venueId);
};
