// Mekan verileri - İlçe bazlı bar, pub, gece kulübü, lounge, meyhane ve kahve dükkanı listesi
// Gece hayatı mekanları + kahve dükkanları — Tüm koordinatlar Google Haritalar'dan doğrulanmıştır.

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
  { id: 'bodrum', name: 'Bodrum', label: 'Bodrum' },
  { id: 'marmaris', name: 'Marmaris', label: 'Marmaris' },
];

export const VENUES: Venue[] = [
  // ==================== DALAMAN ====================
  { id: 'dal-1', name: 'CHEERS BLACK MOON', address: 'Cumhuriyet Cad. No:7 D:A, Dalaman', district: 'dalaman', lat: 36.7670492, lng: 28.8024024, rating: '4.1', reviewCount: '23', type: 'Bar', priceRange: '₺200–400' },
  { id: 'dal-2', name: 'Hayal Bar', address: 'Karakuş Sk. No:4, Dalaman', district: 'dalaman', lat: 36.765779, lng: 28.8092819, rating: '3.9', reviewCount: '13', type: 'Bar', priceRange: '₺200–400' },
  { id: 'dal-3', name: 'Corner Lounge', address: 'Atatürk Cd., Dalaman/Muğla', district: 'dalaman', lat: 36.7661563, lng: 28.8055583, rating: '4.2', reviewCount: '137', type: 'Nargile & Lounge', priceRange: '₺400–600' },
  { id: 'dal-4', name: 'Nar Pub Cafe Restaurant', address: 'Kenan Evren Bulvarı No: 137/C, Dalaman', district: 'dalaman', lat: 36.7497624, lng: 28.8039899, rating: '4.4', reviewCount: '168', type: 'Pub', priceRange: '₺200–400' },
  { id: 'dal-5', name: 'Fasil Gazinosu', address: 'D555, Dalaman', district: 'dalaman', lat: 36.7958803, lng: 28.8109061, rating: '5.0', reviewCount: '3', type: 'Gece kulübü', priceRange: '₺400–600' },
  { id: 'dal-6', name: 'Club Sunsmile', address: 'Adnan Menderes Blv. No:4, Dalaman', district: 'dalaman', lat: 36.803022, lng: 28.814904, rating: '4.0', reviewCount: '5', type: 'Gece kulübü', priceRange: '₺400–800' },
  { id: 'dal-7', name: 'North Pub', address: 'Merkez, Sarıgerme/Dalaman', district: 'dalaman', lat: 36.7115009, lng: 28.7025702, rating: '4.1', reviewCount: '38', type: 'Pub', priceRange: '₺200–400' },
  { id: 'dal-8', name: 'Zumzum Cask & Cup', address: 'Dalaman/Muğla', district: 'dalaman', lat: 36.7469339, lng: 28.8069429, rating: '5.0', reviewCount: '1', type: 'Bar', priceRange: '₺200–400' },

  // ==================== ORTACA / DALYAN ====================
  { id: 'ort-1', name: 'Sofra Bar', address: 'Maraş Cd., Dalyan/Ortaca', district: 'ortaca', lat: 36.8333343, lng: 28.6410021, rating: '4.6', reviewCount: '310', type: 'Bar', priceRange: '₺₺' },
  { id: 'ort-2', name: 'Retro Bar', address: 'Gülpınar Cd. No:44, Dalyan/Ortaca', district: 'ortaca', lat: 36.8369558, lng: 28.6414667, rating: '4.4', reviewCount: '39', type: 'Bar', priceRange: '₺200–400' },
  { id: 'ort-3', name: 'Public Dalyan', address: 'Belediye Sk. No:9/D, Dalyan/Ortaca', district: 'ortaca', lat: 36.8334601, lng: 28.6405069, rating: '4.8', reviewCount: '121', type: 'Bar', priceRange: '₺400–600' },
  { id: 'ort-4', name: 'Jazz Bar', address: 'Gülpınar Cd. No:28, Dalyan/Ortaca', district: 'ortaca', lat: 36.8357482, lng: 28.642025, rating: '4.4', reviewCount: '637', type: 'Canlı Müzik Bar', priceRange: '₺300–500' },
  { id: 'ort-5', name: 'The Rum Bar', address: 'Dalyan/Ortaca', district: 'ortaca', lat: 36.8336176, lng: 28.6409504, rating: '4.6', reviewCount: '75', type: 'Bar', priceRange: '₺300–500' },
  { id: 'ort-6', name: 'Dalyan Nil Lounge Restaurant Bar', address: 'Kahveci Tahsin Sk. No:6, Dalyan/Ortaca', district: 'ortaca', lat: 36.8338302, lng: 28.6442028, rating: '4.9', reviewCount: '37', type: 'Lounge Bar', priceRange: '₺1.000+' },
  { id: 'ort-7', name: 'Mustang Bar', address: 'Maraş Cd. No:59/B, Dalyan/Ortaca', district: 'ortaca', lat: 36.8313799, lng: 28.6393422, rating: '4.6', reviewCount: '109', type: 'Bar', priceRange: '₺200–400' },
  { id: 'ort-8', name: 'Waterfall Bar', address: 'Belediyesi, Dalyan/Ortaca', district: 'ortaca', lat: 36.8323204, lng: 28.6446669, rating: '4.5', reviewCount: '69', type: 'Bar', priceRange: '₺' },
  { id: 'ort-9', name: 'Dalyan Lounge', address: 'Dalyan/Ortaca', district: 'ortaca', lat: 36.8334616, lng: 28.6408712, rating: '4.4', reviewCount: '28', type: 'Lounge', priceRange: '₺300–500' },
  { id: 'ort-10', name: 'Blue Bar Dalyan', address: 'Yalı Sk. No:6, Dalyan/Ortaca', district: 'ortaca', lat: 36.832022, lng: 28.6392559, rating: '5.0', reviewCount: '20', type: 'Bar', priceRange: '₺300–400' },
  { id: 'ort-11', name: 'Tequila Bar', address: 'Dalyan/Ortaca', district: 'ortaca', lat: 36.8343308, lng: 28.6426269, rating: '4.5', reviewCount: '2', type: 'Gece kulübü', priceRange: '₺300–500' },
  { id: 'ort-12', name: 'Rumours Bar', address: 'Belediyesi, Dalyan/Ortaca', district: 'ortaca', lat: 36.8309805, lng: 28.6389984, rating: '3.8', reviewCount: '217', type: 'Bar', priceRange: '₺₺' },

  // ==================== MUĞLA MERKEZ / KÖTEKLİ ====================
  { id: 'mug-1', name: 'Belfast Irish Pub Kötekli', address: 'Sıtkı Koçman Cd No:26A, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1705072, lng: 28.3791711, rating: '4.9', reviewCount: '50', type: 'Pub', priceRange: '₺200–400' },
  { id: 'mug-2', name: 'Kukla Cafe&Pub', address: 'Sıtkı Koçman Cd No:62, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1677724, lng: 28.3831649, rating: '4.2', reviewCount: '511', type: 'Pub', priceRange: '₺200–300' },
  { id: 'mug-3', name: 'No:62 Cafe Pub', address: 'Sıtkı Koçman Cd No:60, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.167727, lng: 28.3832102, rating: '4.6', reviewCount: '25', type: 'Pub', priceRange: '₺200–400' },
  { id: 'mug-4', name: 'Mamut Kötekli', address: 'Sıtkı Koçman Cd, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1704683, lng: 28.3793656, rating: '3.9', reviewCount: '117', type: 'Bar', priceRange: '₺100–200' },
  { id: 'mug-5', name: 'Mazot Bar Kötekli', address: 'Kötekli, Menteşe/Muğla', district: 'mugla-merkez', lat: 37.1679414, lng: 28.3829713, rating: '3.9', reviewCount: '65', type: 'Bar', priceRange: '₺₺' },
  { id: 'mug-6', name: 'Mabolla Center', address: 'Recai Güreli Cd. No:29, Menteşe/Muğla', district: 'mugla-merkez', lat: 37.2169587, lng: 28.3597632, rating: '4.1', reviewCount: '484', type: 'Bar', priceRange: '₺₺' },
  { id: 'mug-7', name: 'Tosbaa', address: 'Sıtkı Koçman Cd No:107, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1676989, lng: 28.3832486, rating: '4.3', reviewCount: '35', type: 'Pub', priceRange: '₺200–400' },
  { id: 'mug-8', name: 'Gold & Black', address: 'Sıtkı Koçman Cd No:59, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.170488, lng: 28.379581, rating: '4.9', reviewCount: '12', type: 'Pub', priceRange: '₺200–400' },
  { id: 'mug-9', name: 'Rowdy Pub', address: 'Sıtkı Koçman Cd No:22, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.170644, lng: 28.378839, rating: '4.2', reviewCount: '39', type: 'Pub', priceRange: '₺1.000+' },
  { id: 'mug-10', name: '50CL PUB Kötekli', address: 'Sıtkı Koçman Cd No:42/B, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1691464, lng: 28.3809907, rating: '2.6', reviewCount: '15', type: 'Pub', priceRange: '₺200–400' },
  { id: 'mug-11', name: 'Up Stairs Kötekli', address: 'Sıtkı Koçman Cd No:42/B, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1691464, lng: 28.3809907, rating: '3.9', reviewCount: '15', type: 'Bar', priceRange: '₺200–400' },
  { id: 'mug-12', name: 'Kukla Pub Akyaka', address: 'Akyaka, Ula/Muğla', district: 'mugla-merkez', lat: 37.0518376, lng: 28.3258831, rating: '4.7', reviewCount: '92', type: 'Bar', priceRange: '₺200–400' },
  { id: 'mug-13', name: 'Meyland', address: 'Sıtkı Koçman Cd No:44, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.168756, lng: 28.381744, rating: '4.0', reviewCount: '2', type: 'Bar', priceRange: '₺200–400' },
  { id: 'mug-14', name: 'Şanzelize Club', address: 'Kötekli 292. Sokak No:10 D:6, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1673713, lng: 28.3804887, rating: '4.0', reviewCount: '0', type: 'Gece kulübü', priceRange: '₺400–600' },

  // ==================== FETHİYE ====================
  { id: 'fet-1', name: 'Deep Blue Bar', address: '27 Hamam Sokak, Paspatur, Fethiye', district: 'fethiye', lat: 36.6211336, lng: 29.1079776, rating: '4.5', reviewCount: '1016', type: 'Bar', priceRange: '₺₺' },
  { id: 'fet-2', name: 'Boğa Club & Terrace', address: '45. Sk. No:10, Fethiye', district: 'fethiye', lat: 36.6210902, lng: 29.108268, rating: '4.0', reviewCount: '545', type: 'Gece kulübü', priceRange: '₺₺₺₺' },
  { id: 'fet-3', name: 'Avalon Fethiye', address: '47. Sk. No:9, Fethiye', district: 'fethiye', lat: 36.6214057, lng: 29.1072869, rating: '3.9', reviewCount: '308', type: 'Gece kulübü', priceRange: '₺2.000+' },
  { id: 'fet-4', name: 'Bikap Pub & Bistro', address: '504/1. Sk. No: 9/B, Fethiye', district: 'fethiye', lat: 36.6243508, lng: 29.113859, rating: '4.9', reviewCount: '185', type: 'Pub', priceRange: '₺200–400' },
  { id: 'fet-5', name: 'Meri Bar', address: 'Foça, Mustafa Kemal Blv. 1002. Sk. No:1, Fethiye', district: 'fethiye', lat: 36.660759, lng: 29.1133764, rating: '4.6', reviewCount: '382', type: 'Bar', priceRange: '₺300–500' },
  { id: 'fet-6', name: 'Spica', address: 'Paspatur Amintas Kapısı, 53 Sk No:5/B, Fethiye', district: 'fethiye', lat: 36.6205606, lng: 29.1090122, rating: '5.0', reviewCount: '49', type: 'Gece kulübü', priceRange: '₺400–800' },
  { id: 'fet-7', name: 'Kum Saati Lounge Bar', address: '45.Sokak No:31 Paspatur, Fethiye', district: 'fethiye', lat: 36.6211301, lng: 29.1079324, rating: '3.8', reviewCount: '176', type: 'Bar', priceRange: '₺300–500' },
  { id: 'fet-8', name: "Joseph's Bar", address: '996. Sk. No:2, Fethiye', district: 'fethiye', lat: 36.6609911, lng: 29.1117636, rating: '4.6', reviewCount: '67', type: 'Bar', priceRange: '₺1–100' },
  { id: 'fet-9', name: 'Mejnun Club', address: 'Paspatur, Fethiye', district: 'fethiye', lat: 36.6211906, lng: 29.1077372, rating: '3.5', reviewCount: '94', type: 'Gece kulübü', priceRange: '₺300–400' },
  { id: 'fet-10', name: 'Büyükev Pub & Kitchen', address: '96. Sk. No:12, Fethiye', district: 'fethiye', lat: 36.6212194, lng: 29.1102799, rating: '4.5', reviewCount: '544', type: 'Pub', priceRange: '₺400–600' },
  { id: 'fet-11', name: 'Ocean Blue Bar & Pub', address: 'Barış Manço Blv., Çalış/Fethiye', district: 'fethiye', lat: 36.6608412, lng: 29.111007, rating: '4.4', reviewCount: '98', type: 'Bar', priceRange: '₺300–500' },
  { id: 'fet-12', name: 'Minimal Pub', address: 'Fevzi Çakmak Cd. No:11, Fethiye', district: 'fethiye', lat: 36.6210342, lng: 29.1065179, rating: '4.7', reviewCount: '205', type: 'Pub', priceRange: '₺200–300' },
  { id: 'fet-13', name: 'BIG BOSS PUB PİZZA', address: 'Dispanser Cd. No:6, Beşkaza Meydanı, Fethiye', district: 'fethiye', lat: 36.62385, lng: 29.1126488, rating: '4.8', reviewCount: '370', type: 'Pub', priceRange: '₺400–600' },
  { id: 'fet-14', name: 'Buzz Bar Downtown', address: '45. Sk. No:33, Fethiye', district: 'fethiye', lat: 36.621096, lng: 29.1076161, rating: '3.5', reviewCount: '117', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'fet-15', name: 'XLOUNGEPUB', address: '96. Sk. No:11, Fethiye', district: 'fethiye', lat: 36.6214078, lng: 29.10998, rating: '4.0', reviewCount: '247', type: 'Pub', priceRange: '₺400–600' },
  { id: 'fet-16', name: 'Jewel Lounge Bar', address: '96. Sk. No:4 D:16, Fethiye', district: 'fethiye', lat: 36.6214255, lng: 29.1096525, rating: '4.6', reviewCount: '165', type: 'Lounge Bar', priceRange: '₺400–600' },
  { id: 'fet-17', name: 'Elma Music & Dance', address: '45. Sk. No:35, Fethiye', district: 'fethiye', lat: 36.6210793, lng: 29.1075201, rating: '3.4', reviewCount: '102', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'fet-18', name: 'Little Pub', address: 'Barış Manço Blv. B Blok No:46/2, Fethiye', district: 'fethiye', lat: 36.6626406, lng: 29.1234019, rating: '4.8', reviewCount: '44', type: 'Pub', priceRange: '₺200–400' },
  { id: 'fet-19', name: "Re'member Bar & Club", address: '45. Sk. NO:35/A, Fethiye', district: 'fethiye', lat: 36.6211212, lng: 29.1075655, rating: '4.5', reviewCount: '23', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'fet-20', name: 'Sunzest Pub', address: '502/1 Sk. Balcı Apt No:5A, Fethiye', district: 'fethiye', lat: 36.6237126, lng: 29.1131904, rating: '5.0', reviewCount: '30', type: 'Pub', priceRange: '₺400–600' },
  { id: 'fet-21', name: 'Wine Pub Fethiye', address: '45. Sk. No:17, Fethiye', district: 'fethiye', lat: 36.6207149, lng: 29.1081515, rating: '4.8', reviewCount: '10', type: 'Pub', priceRange: '₺400–600' },
  { id: 'fet-22', name: 'Serazat Kafe', address: '93. Sok No:4 F, Fethiye', district: 'fethiye', lat: 36.62093, lng: 29.1097142, rating: '4.8', reviewCount: '216', type: 'Nargile Salonu', priceRange: '₺200–400' },
  { id: 'fet-23', name: '4Corner Bar', address: 'Atatürk Cd., Paspatur, Fethiye', district: 'fethiye', lat: 36.6215272, lng: 29.1072987, rating: '4.4', reviewCount: '187', type: 'Bar', priceRange: '₺300–500' },
  { id: 'fet-24', name: 'PASPATUR MEYHANESİ', address: 'Cumhuriyet Mah. 45. Sokak No:11, Paspatur, Fethiye', district: 'fethiye', lat: 36.6211, lng: 29.1078, rating: '4.7', reviewCount: '31', type: 'Meyhane', priceRange: '₺400–600' },
  { id: 'fet-25', name: 'minimalfethiye', address: 'Fevzi Çakmak Cd. No:3, Fethiye', district: 'fethiye', lat: 36.6210914, lng: 29.105719, rating: '4.7', reviewCount: '149', type: 'Kokteyl Bar', priceRange: '₺400–600' },

  // --- Fethiye Merkez Yeni Gece Kulüpleri ---
  { id: 'fet-26', name: 'ONYX Fethiye', address: '45. Sk. No:11, Fethiye', district: 'fethiye', lat: 36.6209645, lng: 29.1082521, rating: '4.4', reviewCount: '26', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'fet-27', name: 'QUE Fethiye by CRIMSON', address: '1054(FCA) Sokak No:42, Çalış/Fethiye', district: 'fethiye', lat: 36.6609353, lng: 29.1091503, rating: '4.2', reviewCount: '5', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'fet-28', name: 'Voi Social', address: '97 (CMH) Sk No:4, Fethiye', district: 'fethiye', lat: 36.6206173, lng: 29.1095886, rating: '4.8', reviewCount: '10', type: 'Gece kulübü', priceRange: '₺500–600' },

  // --- Hisarönü / Ölüdeniz Gece Kulüpleri ---
  { id: 'fet-29', name: 'The Reef Bar Bistro Club', address: 'Ata Caddesi No:5, Hisarönü/Fethiye', district: 'fethiye', lat: 36.5741081, lng: 29.1365909, rating: '4.3', reviewCount: '251', type: 'Gece kulübü', priceRange: '₺400–800' },
  { id: 'fet-30', name: 'Loca Luna', address: 'Cumhuriyet Cd. 27/1, Hisarönü/Fethiye', district: 'fethiye', lat: 36.5723037, lng: 29.1350822, rating: '4.4', reviewCount: '107', type: 'Gece kulübü', priceRange: '₺400–800' },
  { id: 'fet-31', name: 'Skyfall Arena', address: 'Cumhuriyet Cd. No:25, Hisarönü/Fethiye', district: 'fethiye', lat: 36.5724055, lng: 29.1352572, rating: '4.1', reviewCount: '243', type: 'Gece kulübü', priceRange: '₺2.000+' },
  { id: 'fet-32', name: 'Oh Yes Cocktail Bar', address: '194. Sk. No:1, Hisarönü/Fethiye', district: 'fethiye', lat: 36.5739627, lng: 29.135426, rating: '4.8', reviewCount: '180', type: 'Kokteyl Bar', priceRange: '₺800–1.000' },
  { id: 'fet-33', name: 'Crystal Lounge', address: 'Stad Cd. No:28, Hisarönü/Fethiye', district: 'fethiye', lat: 36.573729, lng: 29.1375272, rating: '4.7', reviewCount: '46', type: 'Lounge Bar', priceRange: '₺400–600' },
  { id: 'fet-34', name: 'Taboo Pub Hisarönü', address: 'Cumhuriyet Cd. No:18, Hisarönü/Fethiye', district: 'fethiye', lat: 36.5715569, lng: 29.1380438, rating: '4.8', reviewCount: '27', type: 'Pub', priceRange: '₺200–300' },
  { id: 'fet-35', name: 'Talk Of The Town', address: 'Hisarönü/Fethiye', district: 'fethiye', lat: 36.5707195, lng: 29.1380733, rating: '4.7', reviewCount: '176', type: 'Bar', priceRange: '₺1–200' },
  { id: 'fet-36', name: 'Oldieshead Bar', address: 'Cumhuriyet Cd. No:66, Hisarönü/Fethiye', district: 'fethiye', lat: 36.5716681, lng: 29.1322291, rating: '4.9', reviewCount: '108', type: 'Bar', priceRange: '₺400–500' },
  { id: 'fet-37', name: 'Grand Boozey Club Bar', address: 'Cumhuriyet Cd. 27a, Hisarönü/Fethiye', district: 'fethiye', lat: 36.5722133, lng: 29.1350342, rating: '3.6', reviewCount: '39', type: 'Gece kulübü', priceRange: '₺400–800' },

  // ==================== COFFEE / KAHVE DÜKKANLARI ====================

  // --- Dalaman Kahve Dükkanları ---
  { id: 'cof-dal-1', name: 'Goodeer Coffee', address: 'Mehmet Akif Ersoy 1. Sk. 17a, Dalaman', district: 'dalaman', lat: 36.7636749, lng: 28.8031311, rating: '4.4', reviewCount: '144', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-dal-2', name: 'Wuku Specialty Coffee Shop', address: 'İstiklal Cd. No:54/A, Dalaman', district: 'dalaman', lat: 36.7817738, lng: 28.811132, rating: '4.9', reviewCount: '529', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-dal-3', name: 'Gramada Coffee', address: 'Cumhuriyet 1. Sok No4 Z03, Dalaman', district: 'dalaman', lat: 36.7673496, lng: 28.8019689, rating: '4.1', reviewCount: '38', type: 'Kafe', priceRange: '₺100–200' },
  { id: 'cof-dal-4', name: "G'10 Coffee", address: 'Mehmet Akif Ersoy Cad No:22/A, Dalaman', district: 'dalaman', lat: 36.7632691, lng: 28.8030548, rating: '4.5', reviewCount: '310', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-dal-5', name: 'Heffalump Coffee Dalaman', address: 'Mehmet Akif Ersoy Cad. No:30 A, Dalaman', district: 'dalaman', lat: 36.7622621, lng: 28.8029652, rating: '5.0', reviewCount: '13', type: 'Kahve Dükkanı', priceRange: '₺100–200' },

  // --- Dalaman Sahil ---
  { id: 'beach-dal-1', name: 'Dalaman Plajı', address: 'Ege, 48770 Dalaman', district: 'dalaman', lat: 36.6957948, lng: 28.7640547, rating: '3.9', reviewCount: '82', type: 'Kumsal', priceRange: 'Ücretsiz' },

  // --- Ortaca / Dalyan Kahve Dükkanları ---
  { id: 'cof-ort-1', name: 'Dal Coffee / Sinek 8', address: 'Maraş Cd. No:8, Dalyan/Ortaca', district: 'ortaca', lat: 36.8337649, lng: 28.6417752, rating: '5.0', reviewCount: '75', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-ort-2', name: 'No 8 ART & DESIGN CAFE', address: 'Maraş Cd. No:18, Dalyan/Ortaca', district: 'ortaca', lat: 36.8337853, lng: 28.641839, rating: '4.5', reviewCount: '82', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-ort-3', name: 'Goodeer Coffee Dalyan', address: 'Atatürk Blv. No:22, Dalyan/Ortaca', district: 'ortaca', lat: 36.8349848, lng: 28.6447658, rating: '4.0', reviewCount: '37', type: 'Kahve Dükkanı', priceRange: '₺200–300' },
  { id: 'cof-ort-4', name: 'Luvi Cafe & Bar', address: 'Atatürk Bulvarı, Pirinçler Sk. No:1 C, Dalyan/Ortaca', district: 'ortaca', lat: 36.8345678, lng: 28.6440612, rating: '4.9', reviewCount: '59', type: 'Kafe', priceRange: '₺100–200' },
  { id: 'cof-ort-5', name: 'Asaf Bey Tatlı Kahve Dondurma', address: 'Atatürk Blv. No:43 D:B, Dalyan/Ortaca', district: 'ortaca', lat: 36.8359595, lng: 28.6470659, rating: '4.9', reviewCount: '269', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'cof-ort-6', name: 'Le Cafe', address: 'Belediye Sk. No:14, Dalyan/Ortaca', district: 'ortaca', lat: 36.8329763, lng: 28.6410138, rating: '4.6', reviewCount: '60', type: 'Kafe', priceRange: '₺100–200' },

  // --- Muğla Merkez / Kötekli Kahve Dükkanları ---
  { id: 'cof-mug-1', name: 'Muğla Kötekli Coffy', address: 'Sıtkı Koçman Cd No:71/A, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1699232, lng: 28.380506, rating: '4.4', reviewCount: '91', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-mug-2', name: 'Arabica Coffee House', address: 'Sıtkı Koçman Cd No:81/A, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1694036, lng: 28.3811426, rating: '4.3', reviewCount: '113', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-mug-3', name: 'BİBLİON Coffee & Library', address: 'Sıtkı Koçman Cad. No:117A, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1666782, lng: 28.3845478, rating: '4.7', reviewCount: '81', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-mug-4', name: 'GOA Kötekli', address: 'Sıtkı Koçman Cd 50/A, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.168216, lng: 28.382347, rating: '4.1', reviewCount: '64', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-mug-5', name: 'Latife Kötekli', address: 'Sıtkı Koçman Cd No:103, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1682271, lng: 28.3830957, rating: '4.4', reviewCount: '132', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-mug-6', name: 'Soulmate Coffee & Bakery', address: 'Sıtkı Koçman Cd No:40, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1690024, lng: 28.3814113, rating: '4.0', reviewCount: '110', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-mug-7', name: 'Coffee and Stuff', address: '263. Sk. 24/B, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.1682395, lng: 28.3807945, rating: '4.5', reviewCount: '109', type: 'Kafe', priceRange: '₺200–300' },
  { id: 'cof-mug-8', name: 'Pablo Artisan Coffee', address: '263. Sk. No:21/A, Kötekli/Muğla', district: 'mugla-merkez', lat: 37.168961, lng: 28.381327, rating: '3.9', reviewCount: '27', type: 'Kahve Dükkanı', priceRange: '₺100–200' },

  // --- Fethiye Kahve Dükkanları ---
  { id: 'cof-fet-1', name: 'Doc Coffee Co.', address: 'Yerguzlar Cd. 58 A, Fethiye', district: 'fethiye', lat: 36.6583802, lng: 29.1212342, rating: '4.8', reviewCount: '563', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-fet-2', name: 'Coffee de Madrid', address: '500. Sk. No:8/A, Fethiye', district: 'fethiye', lat: 36.6240004, lng: 29.1144943, rating: '4.4', reviewCount: '276', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-fet-3', name: 'Fratelli Coffee Roasters Co.', address: 'Foça Mah. 1002. Sk., Çalış/Fethiye', district: 'fethiye', lat: 36.6608208, lng: 29.1132901, rating: '4.9', reviewCount: '152', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-fet-4', name: 'Sirius Coffee', address: 'Cumhuriyet Cad. 504. Sk. No:3, Fethiye', district: 'fethiye', lat: 36.6241319, lng: 29.1140432, rating: '4.9', reviewCount: '200', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-fet-5', name: 'C.R.E.A.M. Coffee', address: '38. Sk. No:4, Paspatur/Fethiye', district: 'fethiye', lat: 36.6217424, lng: 29.1077362, rating: '4.7', reviewCount: '339', type: 'Kahve Dükkanı', priceRange: '₺400–600' },
  { id: 'cof-fet-6', name: 'Romm Coffee Fethiye', address: '500. Sk. No:3 D:A, Fethiye', district: 'fethiye', lat: 36.6238156, lng: 29.1145375, rating: '4.6', reviewCount: '165', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-fet-7', name: 'Chemex Coffee Fethiye', address: '93. Sk No:2, Paspatur/Fethiye', district: 'fethiye', lat: 36.6212114, lng: 29.1095856, rating: '4.4', reviewCount: '108', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-fet-8', name: 'Cofhilus Social House', address: 'Tuzla Mah. Cahit Gündüz Cad. No:18, Fethiye', district: 'fethiye', lat: 36.6289812, lng: 29.1177265, rating: '4.5', reviewCount: '222', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-fet-9', name: '2MB Sole Coffee & Eatery', address: 'Cahit Gündüz Cd. No:100/1, Fethiye', district: 'fethiye', lat: 36.6432797, lng: 29.1216506, rating: '4.8', reviewCount: '208', type: 'Kahve Dükkanı', priceRange: '₺200–400' },

  // --- Fethiye Sahil & Beach ---
  { id: 'beach-fet-1', name: 'Çalış Plajı', address: 'Çalış, Fethiye', district: 'fethiye', lat: 36.6690608, lng: 29.1040858, rating: '4.0', reviewCount: '3993', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-fet-2', name: 'Fethiye Sahil', address: 'Cahit Gündüz Cd. No:19, Fethiye', district: 'fethiye', lat: 36.6395332, lng: 29.1212086, rating: '4.6', reviewCount: '1812', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-fet-3', name: 'Help Beach', address: 'Fethiye', district: 'fethiye', lat: 36.6211225, lng: 29.0798389, rating: '3.9', reviewCount: '349', type: 'Beach Club', priceRange: '₺200–400' },
  { id: 'beach-fet-4', name: 'Küçük Samanlık Plajı', address: 'Fethiye', district: 'fethiye', lat: 36.6438025, lng: 29.0907693, rating: '4.0', reviewCount: '1306', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-fet-5', name: 'İnlice Halk Plajı', address: 'İnlice, Fethiye', district: 'fethiye', lat: 36.7308491, lng: 28.9670494, rating: '4.2', reviewCount: '4403', type: 'Kumsal', priceRange: 'Ücretsiz' },

  // ==================== BODRUM ====================
  { id: 'bod-1', name: 'Marina Yacht Club Bodrum', address: 'Neyzen Tevfik Cd. No:5, Bodrum', district: 'bodrum', lat: 37.0341331, lng: 27.4223303, rating: '4.5', reviewCount: '3367', type: 'Bar', priceRange: '₺2.000+' },
  { id: 'bod-2', name: 'Deep Sea Pub', address: 'Taşlık Sk. No:7, Bodrum', district: 'bodrum', lat: 37.0333787, lng: 27.4312646, rating: '4.6', reviewCount: '190', type: 'Pub', priceRange: '₺300–500' },
  { id: 'bod-3', name: 'Yula Bodrum - Drink & Chill', address: 'Uslu Sk. No:54/A, Bodrum', district: 'bodrum', lat: 37.0333194, lng: 27.4335676, rating: '4.2', reviewCount: '1736', type: 'Kokteyl Bar', priceRange: '₺400–600' },
  { id: 'bod-4', name: 'Tunnel Bodrum', address: 'Cumhuriyet Cd. No:84 D, Bodrum', district: 'bodrum', lat: 37.0330449, lng: 27.4347238, rating: '4.5', reviewCount: '431', type: 'Pub', priceRange: '₺600–800' },
  { id: 'bod-5', name: 'Kule Rock City Bar', address: 'Çarşı Mh Cumhuriyet Cd., Barlar Sokağı No:55, Bodrum', district: 'bodrum', lat: 37.0336224, lng: 27.433267, rating: '4.2', reviewCount: '1279', type: 'Bar', priceRange: '₺400–600' },
  { id: 'bod-6', name: 'Afilli Bar Bodrum', address: 'Çarşı Mah. Cumhuriyet Cd., Meydan Sk. No:8/A, Bodrum', district: 'bodrum', lat: 37.0359751, lng: 27.4327557, rating: '3.4', reviewCount: '47', type: 'Bar', priceRange: '₺1.000+' },
  { id: 'bod-7', name: 'Divan Pub Bodrum', address: 'Neyzen Tevfik Cd. No:5, Bodrum', district: 'bodrum', lat: 37.0353515, lng: 27.4230792, rating: '4.4', reviewCount: '154', type: 'Pub', priceRange: '₺1.000+' },

  // --- Bodrum Gece Kulüpleri ---
  { id: 'bod-8', name: 'Adamik', address: 'Meyhane Sok No:23, Bodrum', district: 'bodrum', lat: 37.0331342, lng: 27.4302051, rating: '4.7', reviewCount: '61', type: 'Gece kulübü', priceRange: '₺700–800' },
  { id: 'bod-9', name: 'Sapphire Gece Klübü', address: 'Yarbay Sabri Ergüden Sk. No:8, Bodrum', district: 'bodrum', lat: 37.0338604, lng: 27.4018075, rating: '3.5', reviewCount: '284', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'bod-10', name: 'Catamaran Club Bodrum', address: '1025. Sk. No:12, Bodrum', district: 'bodrum', lat: 37.0327505, lng: 27.430967, rating: '4.1', reviewCount: '195', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'bod-11', name: 'WI CLUB BODRUM', address: 'Neyzen Tevfik Cd. No:60/B, Bodrum', district: 'bodrum', lat: 37.0363997, lng: 27.4271797, rating: '2.7', reviewCount: '75', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'bod-12', name: 'Mandalin', address: 'Dr. Alim Bey Cd. 1025. Sokak, Bodrum', district: 'bodrum', lat: 37.032858, lng: 27.4308024, rating: '4.0', reviewCount: '831', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'bod-13', name: 'BARREL BEER HOUSE', address: 'Atatürk Cd. No:90, Bodrum', district: 'bodrum', lat: 37.0328796, lng: 27.4379852, rating: '4.9', reviewCount: '73', type: 'Pub', priceRange: '₺100–200' },
  { id: 'bod-14', name: 'Gara Pub', address: 'Çarşı Mah. M. Hilmi Konday Sok No:8, Bodrum', district: 'bodrum', lat: 37.0337994, lng: 27.4301452, rating: '4.7', reviewCount: '224', type: 'Pub', priceRange: '₺600–800' },
  { id: 'bod-15', name: 'The Irish Pub by Vittoria', address: 'Cevat Şakir Cd. No:4, Bodrum', district: 'bodrum', lat: 37.0347823, lng: 27.4312581, rating: '4.1', reviewCount: '23', type: 'Bar', priceRange: '₺400–600' },
  { id: 'bod-16', name: 'HOT PUB', address: 'Eski Hükümet Sk. No:22, Bodrum', district: 'bodrum', lat: 37.0353651, lng: 27.4311413, rating: '4.9', reviewCount: '90', type: 'Pub', priceRange: '₺100–200' },

  // --- Bodrum Kahve Dükkanları ---
  { id: 'cof-bod-1', name: 'Cafe Chives', address: 'Cafer Paşa Cd. No:57/A, Bodrum', district: 'bodrum', lat: 37.036625, lng: 27.414537, rating: '4.8', reviewCount: '914', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'cof-bod-2', name: 'Coffee LAB Bodrum', address: 'Neyzen Tevfik Cd. No:52, Bodrum', district: 'bodrum', lat: 37.0363305, lng: 27.427586, rating: '3.9', reviewCount: '122', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-bod-3', name: 'New Zealand Coffee House', address: 'Hacı Resul Sk. No:11A/B, Bodrum', district: 'bodrum', lat: 37.0395079, lng: 27.4320347, rating: '4.9', reviewCount: '157', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-bod-4', name: 'Kahve Dünyası - Bodrum Marina', address: 'Marina Çarşısı, Neyzen Tevfik Cd., Bodrum', district: 'bodrum', lat: 37.034743, lng: 27.421911, rating: '4.0', reviewCount: '976', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-bod-5', name: "Madam'ın Kahvesi Bodrum", address: '1013. Sk. 8/A, Bodrum', district: 'bodrum', lat: 37.0339554, lng: 27.4345394, rating: '4.8', reviewCount: '38', type: 'Kafe', priceRange: '₺100–200' },
  { id: 'cof-bod-6', name: 'Gibi Bodrum', address: 'Neyzen Tevfik Cd. No:98, Bodrum', district: 'bodrum', lat: 37.0365157, lng: 27.4244742, rating: '4.3', reviewCount: '528', type: 'Kafe', priceRange: '₺200–400' },
  { id: 'cof-bod-7', name: 'Mahfel Cafe', address: 'Çarşı Mah., Bodrum', district: 'bodrum', lat: 37.0332841, lng: 27.4341402, rating: '4.4', reviewCount: '2944', type: 'Kafe', priceRange: '₺200–400' },

  // --- Bodrum Sahil & Beach Club ---
  { id: 'beach-bod-1', name: 'Sarnıç Beach Club', address: 'Çökertme Cd. No:23, Bodrum', district: 'bodrum', lat: 37.0242991, lng: 27.3739704, rating: '4.1', reviewCount: '550', type: 'Beach Club', priceRange: '₺400–800' },
  { id: 'beach-bod-2', name: 'Bi Beach Club', address: 'Gümbet, Bodrum', district: 'bodrum', lat: 37.029329, lng: 27.4202264, rating: '3.5', reviewCount: '120', type: 'Beach Club', priceRange: '₺400–600' },
  { id: 'beach-bod-3', name: 'Maja Beach Club', address: 'Ayaz Cd. No:6, Bodrum', district: 'bodrum', lat: 37.0323416, lng: 27.402187, rating: '4.1', reviewCount: '20', type: 'Beach Club', priceRange: '₺400–800' },
  { id: 'beach-bod-4', name: 'The Millionaires Beach Club', address: 'Zengin Hüseyin Sk. No:9, Bodrum', district: 'bodrum', lat: 37.0320679, lng: 27.4011334, rating: '4.6', reviewCount: '39', type: 'Beach Club', priceRange: '₺1.000+' },
  { id: 'beach-bod-5', name: 'Bodrum Plajı', address: 'Bodrum Merkez', district: 'bodrum', lat: 37.0288617, lng: 27.4403418, rating: '4.1', reviewCount: '539', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-bod-6', name: 'Bodrum Belediyesi Halk Plajı', address: 'Atatürk Cd. No:151, Bodrum', district: 'bodrum', lat: 37.084677, lng: 27.456471, rating: '4.1', reviewCount: '782', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-bod-7', name: 'Deve Plajı (Camel Beach)', address: 'Ortakent, Bodrum', district: 'bodrum', lat: 37.0138189, lng: 27.3300755, rating: '4.2', reviewCount: '2754', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-bod-8', name: 'Yahşi Plajı', address: 'Ortakent-Yahşi, Bodrum', district: 'bodrum', lat: 37.0194268, lng: 27.3412961, rating: '4.4', reviewCount: '1892', type: 'Kumsal', priceRange: 'Ücretsiz' },

  // ==================== MARMARİS ====================
  { id: 'mar-1', name: 'Tigers Tavern Beach Club', address: '207. Sk. No:80, Marmaris', district: 'marmaris', lat: 36.8447422, lng: 28.2570652, rating: '3.7', reviewCount: '166', type: 'Gece kulübü', priceRange: '₺400–800' },
  { id: 'mar-2', name: 'Barlar Sokağı', address: '35. Sk. No:18, Marmaris', district: 'marmaris', lat: 36.852999, lng: 28.2759044, rating: '4.2', reviewCount: '255', type: 'Bar', priceRange: '₺1.000+' },
  { id: 'mar-3', name: 'Alice Marmaris', address: 'Barbaros Cd. No:209, Marmaris', district: 'marmaris', lat: 36.8525613, lng: 28.275754, rating: '4.8', reviewCount: '147', type: 'Kokteyl Bar', priceRange: '₺600–800' },
  { id: 'mar-4', name: 'Brits Pub', address: 'Seyfettin Elgin Bulvarı No:27, Marmaris', district: 'marmaris', lat: 36.8475572, lng: 28.2592979, rating: '4.7', reviewCount: '320', type: 'Bar', priceRange: '₺300–500' },
  { id: 'mar-5', name: 'IBROX BAR', address: '205. Sk. 88/1, Marmaris', district: 'marmaris', lat: 36.8449116, lng: 28.2566146, rating: '4.5', reviewCount: '361', type: 'Bar', priceRange: '₺200–400' },
  { id: 'mar-6', name: 'Green House Night Club', address: 'Barlar Sokağı, Marmaris', district: 'marmaris', lat: 36.8530102, lng: 28.2757726, rating: '3.8', reviewCount: '234', type: 'Gece kulübü', priceRange: '₺1.000+' },
  { id: 'mar-7', name: "Roxy's Show Bar", address: 'Barbaros Cd. No:24, İçmeler/Marmaris', district: 'marmaris', lat: 36.8290505, lng: 28.2430421, rating: '4.4', reviewCount: '103', type: 'Bar', priceRange: '₺200–400' },
  { id: 'mar-8', name: 'Pop İn Bar Marmaris', address: 'Cumhuriyet Blv. 266. Sk. No:40/12, Marmaris', district: 'marmaris', lat: 36.8352793, lng: 28.2454048, rating: '4.8', reviewCount: '38', type: 'Bar', priceRange: '₺200–400' },
  { id: 'mar-9', name: 'Anfield Bar', address: '203. Sk., Marmaris', district: 'marmaris', lat: 36.8451688, lng: 28.2564863, rating: '4.4', reviewCount: '179', type: 'Bar', priceRange: '₺100–200' },
  { id: 'mar-10', name: 'PARKHEAD BAR MARMARIS', address: 'Adnan Menderes Cd. No:14/1, Marmaris', district: 'marmaris', lat: 36.8553899, lng: 28.252715, rating: '4.5', reviewCount: '157', type: 'Bar', priceRange: '₺100–200' },

  // --- Marmaris Kahve Dükkanları ---
  { id: 'cof-mar-1', name: 'Books & Coffee Marmaris', address: 'Barbaros Cd. No:203, Marmaris', district: 'marmaris', lat: 36.8524504, lng: 28.2756915, rating: '4.9', reviewCount: '548', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-mar-2', name: 'Marmaris Çarşı Kahve Dükkanı', address: '38. Sk. No:39, Marmaris', district: 'marmaris', lat: 36.8534317, lng: 28.2735028, rating: '4.8', reviewCount: '67', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-mar-3', name: 'Fredonia Coffee', address: 'Barbaros Cd. Yat Limanı No:1, Marmaris', district: 'marmaris', lat: 36.851131, lng: 28.273456, rating: '4.3', reviewCount: '1158', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-mar-4', name: 'Artukbey Coffee Shop', address: 'Barbaros Cd. No:57, Marmaris', district: 'marmaris', lat: 36.8498656, lng: 28.2743813, rating: '4.3', reviewCount: '281', type: 'Kahve Dükkanı', priceRange: '₺200–400' },
  { id: 'cof-mar-5', name: 'AVLU Coffee, Etc.', address: 'Cumhuriyet Blv. No:24, Marmaris', district: 'marmaris', lat: 36.8366019, lng: 28.2465189, rating: '5.0', reviewCount: '83', type: 'Kahve Dükkanı', priceRange: '₺100–200' },
  { id: 'cof-mar-6', name: 'Kahve Dünyası - Marmaris Marina', address: 'Marmaris Marina Gönlücek Yolu, Marmaris', district: 'marmaris', lat: 36.8537966, lng: 28.2780432, rating: '4.3', reviewCount: '1930', type: 'Kahve Dükkanı', priceRange: '₺200–400' },

  // --- Marmaris Sahil & Beach Club ---
  { id: 'beach-mar-1', name: 'Yali Beach Club', address: '207. Sk., Marmaris', district: 'marmaris', lat: 36.845997, lng: 28.2584528, rating: '4.5', reviewCount: '243', type: 'Beach Club', priceRange: '₺400–800' },
  { id: 'beach-mar-2', name: 'Aida Beach Marmaris', address: '207. Sk. No:50, Marmaris', district: 'marmaris', lat: 36.8464649, lng: 28.2592564, rating: '4.7', reviewCount: '564', type: 'Beach Club', priceRange: '₺400–800' },
  { id: 'beach-mar-3', name: 'Marmaris Halk Plajı', address: '105. Sk. No:23, Marmaris', district: 'marmaris', lat: 36.8511878, lng: 28.2659311, rating: '4.1', reviewCount: '3442', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-mar-4', name: 'Marmaris Uzunyalı Plajı', address: 'Atatürk Cd. No:28, Marmaris', district: 'marmaris', lat: 36.850977, lng: 28.2652192, rating: '4.3', reviewCount: '289', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-mar-5', name: 'İçmeler Plajı', address: 'İçmeler, Marmaris', district: 'marmaris', lat: 36.8034428, lng: 28.2338791, rating: '4.3', reviewCount: '5997', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-mar-6', name: 'Turunç Plajı', address: 'Turunç, Marmaris', district: 'marmaris', lat: 36.7758993, lng: 28.2486914, rating: '4.3', reviewCount: '1304', type: 'Kumsal', priceRange: 'Ücretsiz' },
  { id: 'beach-mar-7', name: 'Kızkumu Plajı', address: 'Bozburun Yolu, Marmaris', district: 'marmaris', lat: 36.7592818, lng: 28.1304396, rating: '4.3', reviewCount: '8344', type: 'Kumsal', priceRange: 'Ücretsiz' },
];

// İlçeye göre mekanları getir
export const getVenuesByDistrict = (districtId: string): Venue[] => {
  return VENUES.filter(v => v.district === districtId);
};

// ID'ye göre mekan getir
export const getVenueById = (venueId: string): Venue | undefined => {
  return VENUES.find(v => v.id === venueId);
};
