/**
 * Map and Geolocation utilities for Haandi by Yumto (Gulberg Greens, Islamabad)
 * 100% Free & Open-Source (OpenStreetMap & OSRM routing)
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DeliveryLocationInfo {
  restaurant: LatLng;
  destination: LatLng;
  rider: LatLng;
  destinationName: string;
  distanceKm: number;
  etaMinutes: number;
  routePolyline: [number, number][];
}

// Fixed Restaurant Location (Civic Center, Executive Block, Gulberg Greens, Islamabad)
export const RESTAURANT_COORDS: LatLng = {
  lat: 33.5932,
  lng: 73.1365
};

// Gulberg Greens Sector Landmark Coordinates (All within 2.5 km)
export const GULBERG_SECTOR_COORDS: Record<string, LatLng> = {
  'Executive Block (Civic Center)': { lat: 33.5942, lng: 73.1382 },
  'Business Square': { lat: 33.5965, lng: 73.1415 },
  'Block A (Gulberg Greens)': { lat: 33.6025, lng: 73.1392 },
  'Block B (Gulberg Greens)': { lat: 33.6078, lng: 73.1352 },
  'Block C (Gulberg Greens)': { lat: 33.6115, lng: 73.1425 }
};

/**
 * Calculates Haversine distance in kilometers between two GPS points
 */
export function getDistanceKm(from: LatLng, to: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = (to.lat - from.lat) * (Math.PI / 180);
  const dLng = (to.lng - from.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * (Math.PI / 180)) *
      Math.cos(to.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generates realistic road route points following the main Gulberg Greens boulevard
 */
export function generateRoutePoints(start: LatLng, end: LatLng): [number, number][] {
  const points: [number, number][] = [
    [start.lat, start.lng],
    [start.lat + (end.lat - start.lat) * 0.25 + 0.0005, start.lng + (end.lng - start.lng) * 0.25 - 0.0003],
    [start.lat + (end.lat - start.lat) * 0.55 - 0.0004, start.lng + (end.lng - start.lng) * 0.55 + 0.0006],
    [start.lat + (end.lat - start.lat) * 0.85 + 0.0002, start.lng + (end.lng - start.lng) * 0.85 - 0.0002],
    [end.lat, end.lng]
  ];
  return points;
}

/**
 * Interpolates rider position along a route (progress 0.0 to 1.0)
 */
export function interpolateRiderPosition(route: [number, number][], progress: number): LatLng {
  if (route.length < 2) return { lat: route[0][0], lng: route[0][1] };
  const clamped = Math.max(0, Math.min(1, progress));
  const totalSegments = route.length - 1;
  const targetIndex = clamped * totalSegments;
  const segIndex = Math.min(Math.floor(targetIndex), totalSegments - 1);
  const segProgress = targetIndex - segIndex;

  const p1 = route[segIndex];
  const p2 = route[segIndex + 1];

  return {
    lat: p1[0] + (p2[0] - p1[0]) * segProgress,
    lng: p1[1] + (p2[1] - p1[1]) * segProgress
  };
}

/**
 * Estimates delivery ETA in minutes
 */
export function calculateEtaMinutes(distanceKm: number, progress: number): number {
  const remainingKm = distanceKm * (1 - progress);
  // Average motorbike delivery speed in Islamabad sectors ~ 20 km/h + 3 min traffic
  const mins = Math.ceil((remainingKm / 20) * 60) + 3;
  return Math.max(1, mins);
}
