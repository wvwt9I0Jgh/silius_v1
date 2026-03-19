const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const isValidApiKey =
  GOOGLE_MAPS_API_KEY &&
  !GOOGLE_MAPS_API_KEY.toLowerCase().includes('your') &&
  GOOGLE_MAPS_API_KEY.startsWith('AIza') &&
  GOOGLE_MAPS_API_KEY.length > 20;

let mapsLoaderPromise: Promise<boolean> | null = null;

const normalizeQuery = (value: string) => value.trim().replace(/\s+/g, ' ');

export const loadGooglePlacesLibrary = async (): Promise<boolean> => {
  if (!isValidApiKey) return false;

  if (window.google?.maps?.places?.PlacesService) {
    return true;
  }

  if (mapsLoaderPromise) {
    return mapsLoaderPromise;
  }

  mapsLoaderPromise = new Promise<boolean>((resolve) => {
    const existingScript = document.querySelector('script[data-silius-google-maps="true"]') as HTMLScriptElement | null;

    if (existingScript) {
      const waitForGoogle = setInterval(() => {
        if (window.google?.maps?.places?.PlacesService) {
          clearInterval(waitForGoogle);
          resolve(true);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(waitForGoogle);
        resolve(!!window.google?.maps?.places?.PlacesService);
      }, 8000);
      return;
    }

    const script = document.createElement('script');
    script.dataset.siliusGoogleMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=tr`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const waitForGoogle = setInterval(() => {
        if (window.google?.maps?.places?.PlacesService) {
          clearInterval(waitForGoogle);
          resolve(true);
        }
      }, 60);

      setTimeout(() => {
        clearInterval(waitForGoogle);
        resolve(!!window.google?.maps?.places?.PlacesService);
      }, 5000);
    };

    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return mapsLoaderPromise;
};

interface FetchPlacePhotosParams {
  query: string;
  latitude?: number;
  longitude?: number;
  maxPhotos?: number;
}

const buildPhotoSearchQueries = (query: string): string[] => {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const parts = normalized
    .split('-')
    .map((part) => normalizeQuery(part))
    .filter(Boolean);

  const placeName = parts[0] || normalized;
  const addressPart = parts.slice(1).join(' ');

  const querySet = new Set<string>([
    normalized,
    placeName,
    `${placeName} ${addressPart}`.trim(),
    `${placeName} mugla`.trim(),
    `${placeName} muğla`.trim(),
  ]);

  return Array.from(querySet).filter(Boolean);
};

const getPhotoUrlsFromPlace = (place: google.maps.places.PlaceResult | null | undefined): string[] => {
  if (!place?.photos?.length) return [];

  return place.photos
    .slice(0, 10)
    .map((photo) => photo.getUrl({ maxWidth: 1600, maxHeight: 1000 }))
    .filter(Boolean);
};

export const fetchLocationPhotoUrls = async ({
  query,
  latitude,
  longitude,
  maxPhotos = 6,
}: FetchPlacePhotosParams): Promise<string[]> => {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return [];

  const loaded = await loadGooglePlacesLibrary();
  if (!loaded || !window.google?.maps?.places?.PlacesService) return [];

  const container = document.createElement('div');
  const service = new window.google.maps.places.PlacesService(container);

  const uniqueUrls = new Set<string>();
  const handledPlaceIds = new Set<string>();

  const addPhotosFromPlace = async (place: google.maps.places.PlaceResult) => {
    const placePhotos = getPhotoUrlsFromPlace(place);
    for (const url of placePhotos) {
      uniqueUrls.add(url);
      if (uniqueUrls.size >= maxPhotos) return;
    }

    if (!place.place_id || handledPlaceIds.has(place.place_id) || uniqueUrls.size >= maxPhotos) return;
    handledPlaceIds.add(place.place_id);

    const details = await new Promise<google.maps.places.PlaceResult | null>((resolve) => {
      service.getDetails(
        {
          placeId: place.place_id,
          fields: ['photos', 'name'],
        },
        (result, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
            resolve(result);
            return;
          }
          resolve(null);
        }
      );
    });

    const detailPhotos = getPhotoUrlsFromPlace(details);
    for (const url of detailPhotos) {
      uniqueUrls.add(url);
      if (uniqueUrls.size >= maxPhotos) return;
    }
  };

  if (typeof latitude === 'number' && typeof longitude === 'number') {
    const nearbyResults = await new Promise<google.maps.places.PlaceResult[]>((resolve) => {
      service.nearbySearch(
        {
          location: new window.google.maps.LatLng(latitude, longitude),
          rankBy: window.google.maps.places.RankBy.DISTANCE,
          keyword: normalizedQuery,
          language: 'tr',
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
            resolve(results);
            return;
          }
          resolve([]);
        }
      );
    });

    for (const place of nearbyResults) {
      await addPhotosFromPlace(place);
      if (uniqueUrls.size >= maxPhotos) return Array.from(uniqueUrls);
    }
  }

  const queryCandidates = buildPhotoSearchQueries(normalizedQuery);

  for (const queryCandidate of queryCandidates) {
    const request: google.maps.places.TextSearchRequest = {
      query: queryCandidate,
      language: 'tr',
    };

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      request.location = new window.google.maps.LatLng(latitude, longitude);
      request.radius = 600;
    }

    const searchResults = await new Promise<google.maps.places.PlaceResult[]>((resolve) => {
      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
          resolve(results);
          return;
        }
        resolve([]);
      });
    });

    for (const place of searchResults) {
      await addPhotosFromPlace(place);
      if (uniqueUrls.size >= maxPhotos) return Array.from(uniqueUrls);
    }
  }

  return Array.from(uniqueUrls);
};

export const geocodeAddressToCoordinates = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  const normalizedQuery = normalizeQuery(address);
  if (!normalizedQuery) return null;

  const loaded = await loadGooglePlacesLibrary();
  if (!loaded || !window.google?.maps?.Geocoder) return null;

  const geocoder = new window.google.maps.Geocoder();

  const result = await new Promise<google.maps.GeocoderResult | null>((resolve) => {
    geocoder.geocode({ address: normalizedQuery }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        resolve(results[0]);
        return;
      }
      resolve(null);
    });
  });

  if (!result?.geometry?.location) return null;

  return {
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng(),
  };
};
