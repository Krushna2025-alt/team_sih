/**
 * Geolocation and distance calculation utilities.
 * Uses browser Geolocation API and free OpenStreetMap Nominatim reverse geocoding.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodedAddress {
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  formattedLocation: string;
}

/**
 * Requests user's current GPS position via browser Geolocation API.
 */
export function getCurrentCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        let msg = 'Could not get location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can enter your location manually.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location position unavailable. Please enter manually.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please enter manually.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

/**
 * Reverse geocodes coordinates to village/city, district, state, and pincode using OpenStreetMap Nominatim.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();
    const addr = data.address || {};

    const village = addr.village || addr.town || addr.city || addr.suburb || addr.hamlet || '';
    const district = addr.county || addr.state_district || addr.district || '';
    const state = addr.state || '';
    const pincode = addr.postcode || '';

    const parts = [village, district, state].filter(Boolean);
    const formattedLocation = parts.join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || 'Unknown Location';

    return {
      village,
      district,
      state,
      pincode,
      formattedLocation,
    };
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return {
      formattedLocation: `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
    };
  }
}

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | undefined {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return undefined;
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Combines village, district, state into a single clean location label.
 */
export function formatLocationString(village?: string, district?: string, state?: string): string {
  const parts = [village, district, state].map((s) => s?.trim()).filter(Boolean);
  return parts.join(', ');
}
