import { useEffect, useRef, useState } from 'react';

// Declare google maps types for TypeScript
declare global {
  interface Window {
    google?: any;
  }
  namespace google {
    namespace maps {
      type Map = any;
      type Marker = any;
      type Polyline = any;
      const Map: any;
      const Marker: any;
      const Polyline: any;
      const LatLngBounds: any;
      const InfoWindow: any;
      const SymbolPath: any;
      const Animation: any;
      const event: any;
    }
  }
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyD8k81PfKebE2wQmKLSUCQz6C3AbQTHhHY';

interface TrackingData {
  volunteerId: string;
  volunteerName: string;
  phone: string;
  lat: number;
  lng: number;
  status: string;
  donationId: string;
  destination?: string;
  donorName?: string;
  donorLat?: number;
  donorLng?: number;
  foodName?: string;
  lastUpdated?: string;
}

interface DonorLocation {
  id: string;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
}

interface AdminLiveMapProps {
  trackingData: Record<string, TrackingData>;
  donors: DonorLocation[];
}

export function AdminLiveMap({ trackingData, donors }: AdminLiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-api-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      existingScript.addEventListener('error', () => setScriptError(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptError(true);
    document.head.appendChild(script);
  }, []);

  // Initialize and update map
  useEffect(() => {
    if (!scriptLoaded || !mapContainerRef.current) return;

    const defaultCenter = { lat: 11.3962, lng: 79.6936 };

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d7e0' }] },
          { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f0f4f0' }] },
        ],
      });
    }

    const map = mapRef.current;

    // Clear previous markers and polylines
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    // Add DONOR markers (green restaurant icon)
    const donorLocations: { lat: number; lng: number; name: string }[] = [];

    // From tracking data (donor locations sent by volunteer app)
    Object.values(trackingData).forEach(item => {
      if (item.donorLat && item.donorLng) {
        donorLocations.push({
          lat: item.donorLat,
          lng: item.donorLng,
          name: item.donorName || 'Food Donor'
        });
      }
    });

    // From donors list
    donors.forEach(d => {
      if (d.lat && d.lng) {
        donorLocations.push({ lat: d.lat, lng: d.lng, name: d.name });
      }
    });

    // Add unique donor markers
    const donorKeys = new Set<string>();
    donorLocations.forEach(donor => {
      const key = `${donor.lat.toFixed(4)}-${donor.lng.toFixed(4)}`;
      if (donorKeys.has(key)) return;
      donorKeys.add(key);

      const marker = new window.google.maps.Marker({
        position: { lat: donor.lat, lng: donor.lng },
        map,
        title: `🏢 ${donor.name} (Food Donor)`,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 7,
          fillColor: '#16A34A',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding:8px;font-family:system-ui;min-width:150px;">
            <div style="font-weight:800;font-size:13px;color:#166534;">🏢 ${donor.name}</div>
            <div style="font-size:11px;color:#6B7280;margin-top:4px;">Food Donor Pickup Location</div>
            <div style="font-size:10px;color:#16A34A;margin-top:4px;font-weight:600;">📍 ${donor.lat.toFixed(4)}°N, ${donor.lng.toFixed(4)}°E</div>
          </div>
        `
      });
      marker.addListener('click', () => infoWindow.open(map, marker));

      markersRef.current.push(marker);
      bounds.extend({ lat: donor.lat, lng: donor.lng });
      hasPoints = true;
    });

    // Add VOLUNTEER markers (blue bicycle icon) with live GPS
    Object.values(trackingData).forEach(item => {
      if (!item.lat || !item.lng) return;

      const volunteerMarker = new window.google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map,
        title: `🚴 ${item.volunteerName} (Volunteer)`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#2563EB',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        animation: window.google.maps.Animation.DROP,
      });

      const statusLabel = item.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding:8px;font-family:system-ui;min-width:180px;">
            <div style="font-weight:800;font-size:13px;color:#1E40AF;">🚴 ${item.volunteerName}</div>
            <div style="font-size:11px;color:#6B7280;margin-top:2px;">📱 ${item.phone}</div>
            <div style="display:inline-block;background:#DBEAFE;color:#1E40AF;font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;margin-top:6px;">
              ${statusLabel}
            </div>
            <div style="font-size:10px;color:#16A34A;margin-top:6px;font-weight:600;">
              📍 ${item.lat.toFixed(4)}°N, ${item.lng.toFixed(4)}°E
            </div>
            ${item.destination ? `<div style="font-size:10px;color:#6B7280;margin-top:4px;">🏁 ${item.destination}</div>` : ''}
            ${item.lastUpdated ? `<div style="font-size:9px;color:#9CA3AF;margin-top:4px;">Last ping: ${item.lastUpdated}</div>` : ''}
          </div>
        `
      });
      volunteerMarker.addListener('click', () => infoWindow.open(map, volunteerMarker));

      markersRef.current.push(volunteerMarker);
      bounds.extend({ lat: item.lat, lng: item.lng });
      hasPoints = true;

      // Draw route line from volunteer to donor
      if (item.donorLat && item.donorLng) {
        const routeLine = new window.google.maps.Polyline({
          path: [
            { lat: item.lat, lng: item.lng },
            { lat: item.donorLat, lng: item.donorLng },
          ],
          geodesic: true,
          strokeColor: '#2563EB',
          strokeOpacity: 0.6,
          strokeWeight: 3,
          icons: [{
            icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, fillColor: '#2563EB', fillOpacity: 1, strokeWeight: 0 },
            offset: '50%',
          }],
          map,
        });
        polylinesRef.current.push(routeLine);
      }
    });

    // Fit map to bounds
    if (hasPoints) {
      map.fitBounds(bounds);
      const listener = window.google.maps.event.addListener(map, 'bounds_changed', () => {
        if (map.getZoom()! > 16) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [scriptLoaded, trackingData, donors]);

  if (scriptError) {
    return (
      <div className="w-full h-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-4 text-center gap-1.5">
        <span className="text-lg">⚠️</span>
        <p className="text-[10px] font-bold text-slate-600">Failed to load Google Maps</p>
      </div>
    );
  }

  if (!scriptLoaded) {
    return (
      <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center p-4 animate-pulse">
        <div className="w-6 h-6 rounded-full border-2 border-[#16A34A] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '220px' }} />
      {/* Map legend */}
      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-md border border-gray-100 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[9px] font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
          <span className="text-slate-600">Food Donor</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span className="text-slate-600">Volunteer (Live)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold">
          <span className="w-4 h-0.5 bg-[#2563EB] rounded" />
          <span className="text-slate-600">Route</span>
        </div>
      </div>
    </div>
  );
}
