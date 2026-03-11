import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const isValidApiKey = GOOGLE_MAPS_API_KEY &&
  !GOOGLE_MAPS_API_KEY.toLowerCase().includes('your') &&
  GOOGLE_MAPS_API_KEY.startsWith('AIza') &&
  GOOGLE_MAPS_API_KEY.length > 20;

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  locationName: string;
  height?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  latitude,
  longitude,
  locationName,
  height = '200px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    if (!isValidApiKey) {
      return;
    }

    if (window.google?.maps?.Map) {
      setIsGoogleLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.Map) {
          setIsGoogleLoaded(true);
          clearInterval(checkGoogle);
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=tr`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const waitForMap = setInterval(() => {
        if (window.google?.maps?.Map) {
          setIsGoogleLoaded(true);
          clearInterval(waitForMap);
        }
      }, 50);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isGoogleLoaded || !window.google?.maps?.Map) return;

    let map: google.maps.Map;
    try {
    map = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 16,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a3a2a' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c4a6e' }] }
      ],
      disableDefaultUI: true,
      zoomControl: true,
      draggable: true,
      scrollwheel: false
    });

    new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#f43f5e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });
    } catch (e) {
      console.warn('Google Maps yüklenemedi:', e);
    }
  }, [isGoogleLoaded, latitude, longitude]);

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  const openDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
  };

  // API key yoksa veya geçersizse statik görüntü göster
  if (!isValidApiKey) {
    return (
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-800/50">
        <div 
          className="w-full flex items-center justify-center bg-slate-800/50"
          style={{ height }}
        >
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-white mb-1">{locationName}</p>
            <p className="text-[10px] text-slate-500 mb-4">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={openInGoogleMaps}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold"
              >
                <ExternalLink size={14} />
                Haritada Aç
              </button>
              <button
                onClick={openDirections}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500/20 transition-all text-xs font-bold"
              >
                <Navigation size={14} />
                Yol Tarifi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      {/* Harita */}
      <div ref={mapRef} style={{ height }} className="w-full" />
      
      {/* Alt bilgi ve butonlar */}
      <div className="bg-slate-900/80 backdrop-blur p-4 border-t border-white/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="text-rose-500" size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{locationName}</p>
              <p className="text-[10px] text-slate-500">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={openInGoogleMaps}
              className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all text-[10px] font-bold"
            >
              <ExternalLink size={12} />
              Aç
            </button>
            <button
              onClick={openDirections}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500/20 transition-all text-[10px] font-bold"
            >
              <Navigation size={12} />
              Yol Tarifi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;
