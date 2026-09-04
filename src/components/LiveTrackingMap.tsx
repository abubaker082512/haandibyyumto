import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RESTAURANT_COORDS,
  GULBERG_SECTOR_COORDS,
  getDistanceKm,
  generateRoutePoints,
  interpolateRiderPosition,
  calculateEtaMinutes,
  type LatLng
} from '../utils/mapUtils';
import { Bike, MapPin, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

interface LiveTrackingMapProps {
  orderId?: string;
  riderName?: string;
  riderPhone?: string;
  customerSector?: string;
  customerAddress?: string;
  orderStatus?: string; // 'COOKING' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED'
  height?: string;
  showControls?: boolean;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  orderId = 'ORD-ISB-2026',
  riderName = 'Zahid Rider (Islamabad)',
  riderPhone = '0345-6789012',
  customerSector = 'Block B (Gulberg Greens)',
  customerAddress = 'House 14, Street 7, Block B, Gulberg Greens, Islamabad',
  orderStatus = 'SHIPPED',
  height = '380px',
  showControls = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Initial progress based on real order status
  const getInitialProgress = (status: string) => {
    switch (status) {
      case 'PENDING': return 0.0;
      case 'PREPARING': return 0.08;
      case 'READY': return 0.18;
      case 'ON_THE_WAY': case 'SHIPPED': return 0.35;
      case 'COMPLETED': case 'DELIVERED': return 1.0;
      default: return 0.35;
    }
  };

  // Rider progress along the route (0.0 to 1.0)
  const [progress, setProgress] = useState<number>(() => getInitialProgress(orderStatus));
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Sync progress when orderStatus prop changes in real-time
  useEffect(() => {
    if (orderStatus === 'PENDING') {
      setProgress(0.0);
    } else if (orderStatus === 'PREPARING') {
      setProgress(0.08);
    } else if (orderStatus === 'READY') {
      setProgress(0.18);
    } else if (orderStatus === 'ON_THE_WAY' || orderStatus === 'SHIPPED') {
      setProgress(prev => (prev < 0.25 || prev >= 1.0 ? 0.25 : prev));
      setIsPlaying(true);
    } else if (orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED') {
      setProgress(1.0);
    }
  }, [orderStatus]);

  // Target destination coords based on sector
  const destCoords: LatLng = GULBERG_SECTOR_COORDS[customerSector] || GULBERG_SECTOR_COORDS['Block B (Gulberg Greens)'];
  const distanceKm = getDistanceKm(RESTAURANT_COORDS, destCoords);
  const etaMinutes = calculateEtaMinutes(distanceKm, progress);
  const routePoints = generateRoutePoints(RESTAURANT_COORDS, destCoords);
  const currentRiderPos = interpolateRiderPosition(routePoints, progress);

  // Setup Leaflet Map on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent double initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Free OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 1. Restaurant Marker
    const restaurantIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="
          background: #8B1E1E; color: white; width: 36px; height: 36px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(139,30,30,0.5); border: 2.5px solid #ffffff;
          font-weight: 900; font-size: 16px;
        ">
          🍲
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    L.marker([RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lng], { icon: restaurantIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #8B1E1E; font-size: 13px;">Haandi by Yumto</strong><br/>
          <span style="font-size: 11px; color: #555;">Civic Center, Gulberg Greens</span>
        </div>
      `);

    // 2. Customer Destination Marker
    const destinationIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="
          background: #15803D; color: white; width: 36px; height: 36px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(21,128,61,0.5); border: 2.5px solid #ffffff;
          font-weight: 900; font-size: 16px;
        ">
          🏠
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    L.marker([destCoords.lat, destCoords.lng], { icon: destinationIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #15803D; font-size: 13px;">Delivery Destination</strong><br/>
          <span style="font-size: 11px; color: #555;">${customerSector}</span>
        </div>
      `);

    // 3. Route Polyline
    const polyline = L.polyline(routePoints, {
      color: '#E85D04',
      weight: 5,
      opacity: 0.85,
      dashArray: '10, 6'
    }).addTo(map);
    routePolylineRef.current = polyline;

    // 4. Moving Rider Marker
    const riderIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="
          background: linear-gradient(135deg, #E85D04, #F4C430); color: #1A120B; width: 40px; height: 40px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 6px rgba(232,93,4,0.3), 0 4px 14px rgba(0,0,0,0.4);
          border: 2.5px solid #ffffff; font-size: 18px;
        ">
          🛵
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const riderMarker = L.marker([currentRiderPos.lat, currentRiderPos.lng], { icon: riderIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #E85D04; font-size: 13px;">${riderName}</strong><br/>
          <span style="font-size: 11px; color: #555;">Speed: ~24 km/h · En Route</span>
        </div>
      `);
    riderMarkerRef.current = riderMarker;

    // Fit bounds to show entire delivery path
    const bounds = L.latLngBounds([
      [RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lng],
      [destCoords.lat, destCoords.lng]
    ]);
    map.fitBounds(bounds.pad(0.2));

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [customerSector]);

  // Live simulation tick: updates rider along the road
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1.0) {
          return 1.0;
        }
        return Math.min(1.0, prev + 0.02);
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update rider marker position smoothly
  useEffect(() => {
    if (riderMarkerRef.current) {
      const pos = interpolateRiderPosition(routePoints, progress);
      riderMarkerRef.current.setLatLng([pos.lat, pos.lng]);
    }
  }, [progress]);

  const isDelivered = progress >= 1.0 || orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED';

  const getStatusHeadline = () => {
    if (orderStatus === 'PENDING') return 'Order Verified & Queued';
    if (orderStatus === 'PREPARING') return 'Kitchen: Cooking in Handi';
    if (orderStatus === 'READY') return 'Order Packed · Ready for Rider';
    if (orderStatus === 'ON_THE_WAY' || orderStatus === 'SHIPPED') return isDelivered ? 'Order Arrived at Doorstep!' : 'Rider On The Way (Live GPS)';
    if (orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED') return 'Order Delivered Hot & Fresh!';
    return 'Live GPS Tracking';
  };

  return (
    <div style={{
      borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #EADBCC',
      background: '#ffffff', boxShadow: '0 10px 30px rgba(26,18,11,0.1)',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Live Header Status */}
      <div style={{
        background: 'linear-gradient(135deg, #1A120B 0%, #2A1F17 100%)',
        color: '#ffffff', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: (orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED' || isDelivered) ? '#15803D' : '#E85D04', width: '32px', height: '32px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {(orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED' || isDelivered) ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : <Bike style={{ width: '18px', height: '18px' }} />}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{getStatusHeadline()}</span>
              <span style={{
                background: 'rgba(232,93,4,0.3)', color: '#F4C430', fontSize: '10px',
                padding: '2px 6px', borderRadius: '6px', fontWeight: '700'
              }}>
                LIVE GPS
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '10px',
                padding: '2px 6px', borderRadius: '6px', fontWeight: '600'
              }}>
                #{orderId.slice(-6).toUpperCase()} · {orderStatus}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              {riderName} · {riderPhone}
            </div>
          </div>
        </div>

        {/* ETA badge */}
        <div style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px', padding: '6px 12px', textAlign: 'right'
        }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estimated Arrival
          </div>
          <div style={{ fontSize: '14px', fontWeight: '900', color: '#F4C430' }}>
            {isDelivered ? 'Arrived at Doorstep' : `${etaMinutes} mins (${distanceKm} km)`}
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height,
          position: 'relative',
          zIndex: 1
        }}
      />

      {/* Delivery Details Footer & Simulation Controls */}
      <div style={{
        padding: '10px 16px', background: '#FBF8F3', borderTop: '1px solid #EADBCC',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '10px', fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B3E32' }}>
          <MapPin style={{ width: '15px', height: '15px', color: '#8B1E1E', flexShrink: 0 }} />
          <span style={{ fontWeight: '700' }}>To:</span>
          <span style={{ color: '#1A120B' }}>{customerAddress}</span>
        </div>

        {showControls && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setIsPlaying(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: '#ffffff', border: '1.5px solid #EADBCC', borderRadius: '8px',
                padding: '5px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                color: '#1A120B'
              }}
              title={isPlaying ? 'Pause Simulation' : 'Resume Live Movement'}
            >
              {isPlaying ? <Pause style={{ width: '12px', height: '12px' }} /> : <Play style={{ width: '12px', height: '12px' }} />}
              <span>{isPlaying ? 'Pause GPS' : 'Resume GPS'}</span>
            </button>

            <button
              onClick={() => { setProgress(0.1); setIsPlaying(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: '#ffffff', border: '1.5px solid #EADBCC', borderRadius: '8px',
                padding: '5px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                color: '#6B5B4C'
              }}
              title="Restart delivery route"
            >
              <RotateCcw style={{ width: '12px', height: '12px' }} />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
