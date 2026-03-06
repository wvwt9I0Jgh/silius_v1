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
];

// İlçeye göre mekanları getir
export const getVenuesByDistrict = (districtId: string): Venue[] => {
  return VENUES.filter(v => v.district === districtId);
};

// ID'ye göre mekan getir
export const getVenueById = (venueId: string): Venue | undefined => {
  return VENUES.find(v => v.id === venueId);
};
