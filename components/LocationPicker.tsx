import React, { useState, useMemo } from 'react';
import { MapPin, Search, X, Check, ChevronDown, Star, Music, Waves, Navigation, Coffee } from 'lucide-react';
import { DISTRICTS, VENUES, getVenuesByDistrict, Venue } from '../data/venues';

// Sahil verileri
export interface Beach {
  id: string;
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
}

export const BEACHES: Beach[] = [
  // DALAMAN
  { id: 'beach-dal-1', name: 'Dalaman Sarıgerme Plajı', address: 'Sarıgerme, Dalaman', district: 'dalaman', lat: 36.7124, lng: 28.7174 },
  { id: 'beach-dal-2', name: 'Dalaman İztuzu Plajı', address: 'İztuzu, Dalaman', district: 'dalaman', lat: 36.7778, lng: 28.6177 },
  // ORTACA
  { id: 'beach-ort-1', name: 'İztuzu Plajı (Kaplumbağa Sahili)', address: 'Dalyan, Ortaca', district: 'ortaca', lat: 36.7778, lng: 28.6177 },
  { id: 'beach-ort-2', name: 'Ekincik Koyu', address: 'Ekincik, Ortaca', district: 'ortaca', lat: 36.8181, lng: 28.5873 },
  // FETHİYE
  { id: 'beach-fet-1', name: 'Ölüdeniz Plajı', address: 'Ölüdeniz, Fethiye', district: 'fethiye', lat: 36.5494, lng: 29.1147 },
  { id: 'beach-fet-2', name: 'Çalış Plajı', address: 'Çalış, Fethiye', district: 'fethiye', lat: 36.6690, lng: 29.1034 },
  { id: 'beach-fet-3', name: 'Kıdrak Plajı', address: 'Kıdrak, Fethiye', district: 'fethiye', lat: 36.5385, lng: 29.1065 },
  { id: 'beach-fet-4', name: 'Kabak Koyu', address: 'Kabak, Fethiye', district: 'fethiye', lat: 36.4843, lng: 29.0921 },
  { id: 'beach-fet-5', name: 'Gemiler Plajı', address: 'Kayaköy, Fethiye', district: 'fethiye', lat: 36.5530, lng: 29.0646 },
  { id: 'beach-fet-6', name: 'Belcekız Plajı', address: 'Ölüdeniz, Fethiye', district: 'fethiye', lat: 36.5517, lng: 29.1133 },
  { id: 'beach-fet-7', name: 'Katrancı Koyu', address: 'Katrancı, Fethiye', district: 'fethiye', lat: 36.5940, lng: 29.0457 },
  // MUĞLA MERKEZ
  { id: 'beach-mug-1', name: 'Akyaka Plajı', address: 'Akyaka, Ula/Muğla', district: 'mugla-merkez', lat: 37.0560, lng: 28.3268 },
  { id: 'beach-mug-2', name: 'Akbük Koyu', address: 'Akbük, Ula/Muğla', district: 'mugla-merkez', lat: 37.0370, lng: 28.3820 },
];

export const getBeachesByDistrict = (districtId: string): Beach[] => {
  return BEACHES.filter(b => b.district === districtId);
};

// Klüp/gece mekanı filtreleme (club & rave kategorileri için)
const getClubVenuesByDistrict = (districtId: string): Venue[] => {
  return VENUES.filter(v => {
    if (v.district !== districtId) return false;
    const type = v.type.toLowerCase();
    return type.includes('bar') || type.includes('pub') || type.includes('gece') ||
           type.includes('kulüp') || type.includes('club') || type.includes('lounge') ||
           type.includes('nargile') || type.includes('meyhane');
  });
};

// Pub/bar filtreleme (pub kategorisi için)
const getPubVenuesByDistrict = (districtId: string): Venue[] => {
  return VENUES.filter(v => {
    if (v.district !== districtId) return false;
    const type = v.type.toLowerCase();
    return type.includes('bar') || type.includes('pub') ||
           type.includes('lounge') || type.includes('meyhane');
  });
};

// Coffee/kahve filtreleme (coffee kategorisi için)
const getCoffeeVenuesByDistrict = (districtId: string): Venue[] => {
  return VENUES.filter(v => {
    if (v.district !== districtId) return false;
    const type = v.type.toLowerCase();
    return type.includes('kahve') || type.includes('coffee') || type.includes('kafe');
  });
};

interface LocationPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  latitude?: number;
  longitude?: number;
  onCoordinatesChange?: (lat?: number, lng?: number, mapAddress?: string) => void;
  addressRequired?: boolean;
  partyCategory?: 'club' | 'rave' | 'beach' | 'house' | 'street' | 'pub' | 'coffee' | 'other';
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  address,
  onAddressChange,
  latitude,
  longitude,
  onCoordinatesChange,
  addressRequired = true,
  partyCategory = 'club'
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showVenueList, setShowVenueList] = useState(false);
  const [manualAddress, setManualAddress] = useState(address || '');

  // Kategori bazlı mod
  const isVenueMode = partyCategory === 'club' || partyCategory === 'rave' || partyCategory === 'pub' || partyCategory === 'coffee';
  const isBeachMode = partyCategory === 'beach';
  const isManualMode = partyCategory === 'house' || partyCategory === 'street';

  // İlçeye göre filtreleme - kategori bazlı (cafe fallback YOK)
  const filteredVenues = useMemo(() => {
    if (!selectedDistrict) return [];
    let venues: Venue[];
    if (partyCategory === 'pub') {
      // Pub: sadece bar, pub, lounge, meyhane
      venues = getPubVenuesByDistrict(selectedDistrict);
    } else if (partyCategory === 'coffee') {
      // Coffee: sadece kahve dükkanı, kafe
      venues = getCoffeeVenuesByDistrict(selectedDistrict);
    } else if (partyCategory === 'club' || partyCategory === 'rave') {
      // Club & Rave: gece kulübü, bar, pub, lounge, nargile, meyhane
      venues = getClubVenuesByDistrict(selectedDistrict);
    } else {
      venues = getVenuesByDistrict(selectedDistrict);
    }
    if (!searchQuery.trim()) return venues;
    const q = searchQuery.toLowerCase();
    return venues.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.address.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q)
    );
  }, [selectedDistrict, searchQuery, partyCategory]);

  const filteredBeaches = useMemo(() => {
    if (!selectedDistrict || !isBeachMode) return [];
    const beaches = getBeachesByDistrict(selectedDistrict);
    if (!searchQuery.trim()) return beaches;
    const q = searchQuery.toLowerCase();
    return beaches.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q)
    );
  }, [selectedDistrict, searchQuery, isBeachMode]);

  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedVenue(null);
    setSelectedBeach(null);
    setSearchQuery('');
    setShowDistrictDropdown(false);
    setShowVenueList(true);
    onAddressChange('');
    if (onCoordinatesChange) onCoordinatesChange(undefined, undefined, '');
  };

  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setSelectedBeach(null);
    setShowVenueList(false);
    const fullAddress = `${venue.name} - ${venue.address}`;
    onAddressChange(fullAddress);
    if (onCoordinatesChange) onCoordinatesChange(venue.lat, venue.lng, fullAddress);
  };

  const handleBeachSelect = (beach: Beach) => {
    setSelectedBeach(beach);
    setSelectedVenue(null);
    setShowVenueList(false);
    const fullAddress = `${beach.name} - ${beach.address}`;
    onAddressChange(fullAddress);
    if (onCoordinatesChange) onCoordinatesChange(beach.lat, beach.lng, fullAddress);
  };

  const handleManualAddressChange = (value: string) => {
    setManualAddress(value);
    onAddressChange(value);
  };

  const clearSelection = () => {
    setSelectedDistrict('');
    setSelectedVenue(null);
    setSelectedBeach(null);
    setSearchQuery('');
    setManualAddress('');
    setShowVenueList(false);
    onAddressChange('');
    if (onCoordinatesChange) onCoordinatesChange(undefined, undefined, '');
  };

  const getDistrictName = (districtId: string) => {
    return DISTRICTS.find(d => d.id === districtId)?.label || '';
  };

  const getRatingColor = (rating: string) => {
    const r = parseFloat(rating);
    if (r >= 4.5) return 'text-emerald-400';
    if (r >= 4.0) return 'text-amber-400';
    if (r >= 3.5) return 'text-orange-400';
    return 'text-slate-400';
  };

  // ==============================
  // MANUEL MOD (Ev & Sokak Partisi)
  // ==============================
  if (isManualMode) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Navigation size={12} className="text-fuchsia-500" />
            {partyCategory === 'house' ? 'Ev Adresi' : 'Sokak / Konum'} <span className="text-fuchsia-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-fuchsia-500" size={16} />
            <input
              type="text"
              value={manualAddress}
              onChange={e => handleManualAddressChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 transition-all text-sm font-bold"
              placeholder={partyCategory === 'house' ? 'Ev adresini girin (ör: Kötekli Mah. No:12)' : 'Sokak / park / meydan adresini girin...'}
              required={addressRequired}
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-600 ml-1 flex items-center gap-1">
          <MapPin size={10} className="text-slate-600" />
          {partyCategory === 'house'
            ? 'Ev adresiniz sadece katılımcılara gösterilecek'
            : 'Konumunuz katılımcıların sizi bulmasını kolaylaştıracak'}
        </p>
      </div>
    );
  }

  // ==============================
  // MEKAN BAZLI MOD (Club/Rave/Sahil)
  // ==============================
  const selectedItem = selectedVenue || selectedBeach;

  return (
    <div className="space-y-4">
      {/* 1. İLÇE SEÇİMİ */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <MapPin size={12} className="text-fuchsia-500" />
          İlçe Seçin <span className="text-fuchsia-500">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDistrictDropdown(!showDistrictDropdown);
              setShowVenueList(false);
            }}
            className={`w-full flex items-center justify-between bg-white/5 border rounded-2xl px-6 py-4 text-sm font-bold transition-all ${
              showDistrictDropdown ? 'border-fuchsia-500/50 ring-2 ring-fuchsia-500/20' : 'border-white/10 hover:border-white/20'
            } ${selectedDistrict ? 'text-white' : 'text-slate-500'}`}
          >
            <div className="flex items-center gap-3">
              <MapPin size={16} className={selectedDistrict ? 'text-fuchsia-500' : 'text-slate-600'} />
              <span>{selectedDistrict ? getDistrictName(selectedDistrict) : 'İlçe seçiniz...'}</span>
            </div>
            <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${showDistrictDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDistrictDropdown && (
            <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
              {DISTRICTS.map((district) => {
                let itemCount: number;
                let itemLabel: string;
                if (isBeachMode) {
                  itemCount = BEACHES.filter(b => b.district === district.id).length;
                  itemLabel = 'sahil';
                } else if (partyCategory === 'pub') {
                  itemCount = getPubVenuesByDistrict(district.id).length;
                  itemLabel = 'pub/bar';
                } else if (partyCategory === 'coffee') {
                  itemCount = getCoffeeVenuesByDistrict(district.id).length;
                  itemLabel = 'kahve dükkanı';
                } else if (partyCategory === 'club' || partyCategory === 'rave') {
                  itemCount = getClubVenuesByDistrict(district.id).length;
                  itemLabel = 'gece mekanı';
                } else {
                  itemCount = VENUES.filter(v => v.district === district.id).length;
                  itemLabel = 'mekan';
                }
                return (
                  <button
                    key={district.id}
                    type="button"
                    onClick={() => handleDistrictSelect(district.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0 ${
                      selectedDistrict === district.id ? 'bg-fuchsia-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedDistrict === district.id ? 'bg-fuchsia-500/20' : 'bg-white/5'
                      }`}>
                        <MapPin size={18} className={selectedDistrict === district.id ? 'text-fuchsia-500' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{district.label}</p>
                        <p className="text-[10px] text-slate-500">
                          {itemCount} {itemLabel}
                        </p>
                      </div>
                    </div>
                    {selectedDistrict === district.id && (
                      <Check size={16} className="text-fuchsia-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. MEKAN / SAHİL SEÇİMİ */}
      {selectedDistrict && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            {isBeachMode
              ? <Waves size={12} className="text-cyan-500" />
              : partyCategory === 'coffee'
              ? <Coffee size={12} className="text-orange-500" />
              : <Music size={12} className="text-violet-500" />
            }
            {isBeachMode ? 'Sahil Seçin' : partyCategory === 'coffee' ? 'Kahve Dükkanı Seçin' : partyCategory === 'pub' ? 'Pub / Bar Seçin' : partyCategory === 'rave' ? 'Rave Mekanı Seçin' : 'Club / Gece Mekanı Seçin'} <span className="text-fuchsia-500">*</span>
          </label>

          {/* Seçilen öğe */}
          {selectedItem ? (
            <div className="p-4 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-fuchsia-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Check size={20} className="text-fuchsia-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-fuchsia-400 truncate">{selectedItem.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{selectedItem.address}</p>
                    {selectedVenue && (
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={10} className={getRatingColor(selectedVenue.rating)} fill="currentColor" />
                        <span className={`text-[10px] font-bold ${getRatingColor(selectedVenue.rating)}`}>{selectedVenue.rating}</span>
                        <span className="text-[10px] text-slate-500">({selectedVenue.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVenue(null);
                      setSelectedBeach(null);
                      setShowVenueList(true);
                    }}
                    className="px-3 py-2 bg-fuchsia-500/20 border border-fuchsia-500/30 rounded-xl text-fuchsia-400 hover:bg-fuchsia-500/30 transition-all text-[10px] font-bold"
                  >
                    Değiştir
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-3 py-2 bg-slate-500/20 border border-slate-500/30 rounded-xl text-slate-400 hover:bg-slate-500/30 transition-all text-[10px] font-bold"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onClick={() => setShowVenueList(true)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 transition-all text-sm font-bold"
                  placeholder={`${getDistrictName(selectedDistrict)} ${isBeachMode ? 'sahillerinde' : partyCategory === 'coffee' ? 'kahve dükkanlarında' : partyCategory === 'pub' ? 'pub/barlarında' : 'gece mekanlarında'} ara...`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Liste */}
              {showVenueList && (
                <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-h-80 overflow-y-auto scrollbar-hide">
                  {isBeachMode ? (
                    filteredBeaches.length === 0 ? (
                      <div className="p-8 text-center">
                        <Waves size={32} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-bold">Sahil bulunamadı</p>
                      </div>
                    ) : (
                      filteredBeaches.map((beach) => (
                        <button
                          key={beach.id}
                          type="button"
                          onClick={() => handleBeachSelect(beach)}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0 group"
                        >
                          <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                            <Waves size={18} className="text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{beach.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{beach.address}</p>
                          </div>
                          <MapPin size={14} className="text-slate-600 flex-shrink-0 group-hover:text-cyan-500 transition-colors" />
                        </button>
                      ))
                    )
                  ) : (
                    filteredVenues.length === 0 ? (
                      <div className="p-8 text-center">
                        <Music size={32} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-bold">
                          {partyCategory === 'coffee' ? 'Bu ilçede kahve dükkanı bulunamadı' : partyCategory === 'pub' ? 'Bu ilçede pub/bar bulunamadı' : 'Bu ilçede gece mekanı bulunamadı'}
                        </p>
                      </div>
                    ) : (
                      filteredVenues.map((venue) => (
                        <button
                          key={venue.id}
                          type="button"
                          onClick={() => handleVenueSelect(venue)}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0 group"
                        >
                          <div className="w-10 h-10 bg-fuchsia-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-fuchsia-500/20 transition-colors">
                            <Music size={18} className="text-fuchsia-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate group-hover:text-fuchsia-400 transition-colors">{venue.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{venue.address}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Star size={10} className={getRatingColor(venue.rating)} fill="currentColor" />
                                <span className={`text-[10px] font-bold ${getRatingColor(venue.rating)}`}>{venue.rating}</span>
                                <span className="text-[10px] text-slate-600">({venue.reviewCount})</span>
                              </div>
                              <span className="text-[10px] text-slate-600">·</span>
                              <span className="text-[10px] text-fuchsia-400/70">{venue.type}</span>
                              {venue.priceRange && (
                                <>
                                  <span className="text-[10px] text-slate-600">·</span>
                                  <span className="text-[10px] text-slate-500">{venue.priceRange}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <MapPin size={14} className="text-slate-600 flex-shrink-0 group-hover:text-fuchsia-500 transition-colors" />
                        </button>
                      ))
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Bilgi notu */}
      {!selectedItem && (
        <p className="text-[10px] text-slate-600 ml-1 flex items-center gap-1">
          <MapPin size={10} className="text-slate-600" />
          {isBeachMode
            ? 'İlçe ve sahil seçtiğinizde, parti detaylarında haritada gösterilecek'
            : 'İlçe ve mekan seçtiğinizde, parti detaylarında haritada gösterilecek'}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
