import React, { useState, useMemo } from 'react';
import { MapPin, Search, X, Check, ChevronDown, Star, Coffee, Store } from 'lucide-react';
import { DISTRICTS, VENUES, getVenuesByDistrict, Venue } from '../data/venues';

interface LocationPickerProps {
  // Yazılı adres (zorunlu)
  address: string;
  onAddressChange: (address: string) => void;
  // Google Maps koordinatları (isteğe bağlı)
  latitude?: number;
  longitude?: number;
  onCoordinatesChange?: (lat?: number, lng?: number, mapAddress?: string) => void;
  // Gereklilik
  addressRequired?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  address,
  onAddressChange,
  latitude,
  longitude,
  onCoordinatesChange,
  addressRequired = true
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showVenueList, setShowVenueList] = useState(false);

  // İlçeye göre mekanları filtrele
  const filteredVenues = useMemo(() => {
    if (!selectedDistrict) return [];
    const venues = getVenuesByDistrict(selectedDistrict);
    if (!searchQuery.trim()) return venues;
    const q = searchQuery.toLowerCase();
    return venues.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.address.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q)
    );
  }, [selectedDistrict, searchQuery]);

  // İlçe seç
  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedVenue(null);
    setSearchQuery('');
    setShowDistrictDropdown(false);
    setShowVenueList(true);
    // İlçe değiştiğinde önceki mekan bilgilerini temizle
    onAddressChange('');
    if (onCoordinatesChange) {
      onCoordinatesChange(undefined, undefined, '');
    }
  };

  // Mekan seç
  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowVenueList(false);
    // Adres ve koordinatları birlikte ayarla
    const fullAddress = `${venue.name} - ${venue.address}`;
    onAddressChange(fullAddress);
    if (onCoordinatesChange) {
      onCoordinatesChange(venue.lat, venue.lng, fullAddress);
    }
  };

  // Seçimi temizle
  const clearSelection = () => {
    setSelectedDistrict('');
    setSelectedVenue(null);
    setSearchQuery('');
    setShowVenueList(false);
    onAddressChange('');
    if (onCoordinatesChange) {
      onCoordinatesChange(undefined, undefined, '');
    }
  };

  // Seçilen ilçenin adını al
  const getDistrictName = (districtId: string) => {
    return DISTRICTS.find(d => d.id === districtId)?.label || '';
  };

  // Rating'e göre yıldız rengi
  const getRatingColor = (rating: string) => {
    const r = parseFloat(rating);
    if (r >= 4.5) return 'text-emerald-400';
    if (r >= 4.0) return 'text-amber-400';
    if (r >= 3.5) return 'text-orange-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      {/* 1. İLÇE SEÇİMİ */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          <MapPin size={12} className="text-rose-500" />
          İlçe Seçin <span className="text-rose-500">*</span>
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDistrictDropdown(!showDistrictDropdown);
              setShowVenueList(false);
            }}
            className={`w-full flex items-center justify-between bg-white/5 border rounded-2xl px-6 py-4 text-sm font-bold transition-all ${
              showDistrictDropdown ? 'border-rose-500/50 ring-2 ring-rose-500/20' : 'border-white/10 hover:border-white/20'
            } ${selectedDistrict ? 'text-white' : 'text-slate-500'}`}
          >
            <div className="flex items-center gap-3">
              <MapPin size={16} className={selectedDistrict ? 'text-rose-500' : 'text-slate-600'} />
              <span>{selectedDistrict ? getDistrictName(selectedDistrict) : 'İlçe seçiniz...'}</span>
            </div>
            <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${showDistrictDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* İlçe Dropdown */}
          {showDistrictDropdown && (
            <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
              {DISTRICTS.map((district) => {
                const venueCount = VENUES.filter(v => v.district === district.id).length;
                return (
                  <button
                    key={district.id}
                    type="button"
                    onClick={() => handleDistrictSelect(district.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0 ${
                      selectedDistrict === district.id ? 'bg-rose-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedDistrict === district.id ? 'bg-rose-500/20' : 'bg-white/5'
                      }`}>
                        <MapPin size={18} className={selectedDistrict === district.id ? 'text-rose-500' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{district.label}</p>
                        <p className="text-[10px] text-slate-500">{venueCount} mekan</p>
                      </div>
                    </div>
                    {selectedDistrict === district.id && (
                      <Check size={16} className="text-rose-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. MEKAN SEÇİMİ */}
      {selectedDistrict && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Coffee size={12} className="text-indigo-500" />
            Mekan Seçin <span className="text-rose-500">*</span>
          </label>

          {/* Seçilen mekan göster */}
          {selectedVenue ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Check size={20} className="text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-emerald-400 truncate">{selectedVenue.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{selectedVenue.address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star size={10} className={getRatingColor(selectedVenue.rating)} fill="currentColor" />
                        <span className={`text-[10px] font-bold ${getRatingColor(selectedVenue.rating)}`}>{selectedVenue.rating}</span>
                        <span className="text-[10px] text-slate-500">({selectedVenue.reviewCount})</span>
                      </div>
                      {selectedVenue.priceRange && (
                        <span className="text-[10px] text-slate-500">{selectedVenue.priceRange}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVenue(null);
                      setShowVenueList(true);
                    }}
                    className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-all text-[10px] font-bold"
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
              {/* Mekan arama */}
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onClick={() => setShowVenueList(true)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-bold"
                  placeholder={`${getDistrictName(selectedDistrict)} mekanlarında ara...`}
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

              {/* Mekan listesi */}
              {showVenueList && (
                <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-h-80 overflow-y-auto scrollbar-hide">
                  {filteredVenues.length === 0 ? (
                    <div className="p-8 text-center">
                      <Store size={32} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-bold">Mekan bulunamadı</p>
                      <p className="text-[10px] text-slate-600 mt-1">Farklı bir arama terimi deneyin</p>
                    </div>
                  ) : (
                    filteredVenues.map((venue) => (
                      <button
                        key={venue.id}
                        type="button"
                        onClick={() => handleVenueSelect(venue)}
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0 group"
                      >
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500/10 transition-colors">
                          <Coffee size={18} className="text-slate-500 group-hover:text-rose-500 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">{venue.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{venue.address}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Star size={10} className={getRatingColor(venue.rating)} fill="currentColor" />
                              <span className={`text-[10px] font-bold ${getRatingColor(venue.rating)}`}>{venue.rating}</span>
                              <span className="text-[10px] text-slate-600">({venue.reviewCount})</span>
                            </div>
                            <span className="text-[10px] text-slate-600">·</span>
                            <span className="text-[10px] text-slate-500">{venue.type}</span>
                            {venue.priceRange && (
                              <>
                                <span className="text-[10px] text-slate-600">·</span>
                                <span className="text-[10px] text-slate-500">{venue.priceRange}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <MapPin size={14} className="text-slate-600 flex-shrink-0 group-hover:text-rose-500 transition-colors" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Bilgi notu */}
      {!selectedVenue && (
        <p className="text-[10px] text-slate-600 ml-1 flex items-center gap-1">
          <MapPin size={10} className="text-slate-600" />
          İlçe ve mekan seçtiğinizde, vibe detaylarında Google Haritalar üzerinde konumu gösterilecek
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
