/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Info, CheckCircle2, Navigation } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyD8k81PfKebE2wQmKLSUCQz6C3AbQTHhHY';

export interface MarkerData {
  id: string;
  name: string;
  portions: number;
  classification: string;
  lat: number;
  lng: number;
  location?: string;
  notes?: string;
}

interface GoogleMapProps {
  mode: 'donor_select' | 'volunteer_view_all' | 'volunteer_route';
  markers?: MarkerData[];
  selectedMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  activeRoute?: {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
  };
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  mode,
  markers = [],
  selectedMarkerId,
  onMarkerClick,
  onLocationSelect,
  activeRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const donorMarkerRef = useRef<google.maps.Marker | null>(null);

  // Load the Google Maps script
  useEffect(() => {
    const handleScriptLoad = () => setScriptLoaded(true);
    const handleScriptError = () => setScriptError(true);

    if (window.google && window.google.maps) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-api-script');
    if (existingScript) {
      existingScript.addEventListener('load', handleScriptLoad);
      existingScript.addEventListener('error', handleScriptError);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = handleScriptLoad;
    script.onerror = handleScriptError;
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', handleScriptLoad);
      script.removeEventListener('error', handleScriptError);
    };
  }, []);

  // Initialize and update the map instance
  useEffect(() => {
    if (!scriptLoaded || !mapContainerRef.current) return;

    const defaultCenter = { lat: 11.3962, lng: 79.6936 }; // Chidambaram, Tamil Nadu

    // Create Map instance if not exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });
    }

    const map = mapInstanceRef.current;

    // Clear previous direction routes if any
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    // Clear previous markers
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    if (donorMarkerRef.current) {
      donorMarkerRef.current.setMap(null);
      donorMarkerRef.current = null;
    }

    // --- MODE 1: DONOR SELECT LOCATION ---
    if (mode === 'donor_select') {
      const selectedLat = activeRoute?.startLat || defaultCenter.lat;
      const selectedLng = activeRoute?.startLng || defaultCenter.lng;
      const initialLatLng = { lat: selectedLat, lng: selectedLng };

      map.setCenter(initialLatLng);
      map.setZoom(16);

      // Add a draggable marker
      donorMarkerRef.current = new window.google.maps.Marker({
        position: initialLatLng,
        map: map,
        draggable: true,
        title: 'Drag to food handover location',
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#16A34A',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      const handleMarkerMove = () => {
        const marker = donorMarkerRef.current;
        if (!marker) return;
        const pos = marker.getPosition();
        if (!pos) return;
        const lat = pos.lat();
        const lng = pos.lng();

        // Perform Reverse Geocoding
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const resolvedAddress = results[0].formatted_address;
            if (onLocationSelect) {
              onLocationSelect(lat, lng, resolvedAddress);
            }
          } else {
            if (onLocationSelect) {
              onLocationSelect(lat, lng, `Chidambaram Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
            }
          }
        });
      };

      // Drag event
      donorMarkerRef.current.addListener('dragend', handleMarkerMove);

      // Click on map to place pin
      const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
        const clickedLatLng = e.latLng;
        if (!clickedLatLng || !donorMarkerRef.current) return;
        donorMarkerRef.current.setPosition(clickedLatLng);
        handleMarkerMove();
      });

      return () => {
        window.google.maps.event.removeListener(clickListener);
      };
    }

    // --- MODE 2: VOLUNTEER VIEW ALL OPEN MAP PINS ---
    if (mode === 'volunteer_view_all') {
      const bounds = new window.google.maps.LatLngBounds();

      markers.forEach((item) => {
        const isChosen = selectedMarkerId === item.id;
        const markerPos = { lat: item.lat, lng: item.lng };

        const marker = new window.google.maps.Marker({
          position: markerPos,
          map: map,
          title: item.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: isChosen ? 10 : 8,
            fillColor: isChosen ? '#1E293B' : '#16A34A', // Dark slate for chosen, green for others
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });

        // Click marker trigger
        marker.addListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(item.id);
          }
        });

        googleMarkersRef.current.push(marker);
        bounds.extend(markerPos);
      });

      // Fit map to markers or focus on selected
      if (selectedMarkerId) {
        const selectedMarker = markers.find((m) => m.id === selectedMarkerId);
        if (selectedMarker) {
          map.panTo({ lat: selectedMarker.lat, lng: selectedMarker.lng });
          map.setZoom(15);
        }
      } else if (markers.length > 0) {
        map.fitBounds(bounds);
        // Ensure we don't zoom in too close automatically
        const listener = window.google.maps.event.addListener(map, 'bounds_changed', () => {
          if (map.getZoom()! > 16) map.setZoom(15);
          window.google.maps.event.removeListener(listener);
        });
      }
    }

    // --- MODE 3: VOLUNTEER ROUTE TO DESTINATION ---
    if (mode === 'volunteer_route' && activeRoute) {
      const start = { lat: activeRoute.startLat, lng: activeRoute.startLng };
      const end = { lat: activeRoute.endLat, lng: activeRoute.endLng };

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#16A34A',
          strokeOpacity: 0.8,
          strokeWeight: 5,
        },
      });

      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === 'OK' && result && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
          } else {
            console.warn('Directions request failed due to ' + status);
            // Fallback: draw straight polyline if route computation fails
            const line = new window.google.maps.Polyline({
              path: [start, end],
              geodesic: true,
              strokeColor: '#16A34A',
              strokeOpacity: 0.8,
              strokeWeight: 4,
              map: map,
            });
            // Fit to bounds of both locations
            const routeBounds = new window.google.maps.LatLngBounds();
            routeBounds.extend(start);
            routeBounds.extend(end);
            map.fitBounds(routeBounds);
          }
        }
      );
    }
  }, [scriptLoaded, mode, markers, selectedMarkerId, activeRoute]);

  if (scriptError) {
    return (
      <div className="w-full h-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center gap-2 border border-slate-200">
        <span className="text-xl">⚠️</span>
        <p className="text-xs font-bold text-slate-700">Failed to load Google Maps</p>
        <p className="text-[10px] text-slate-400">Please verify your internet connection or API Key restrictions.</p>
      </div>
    );
  }

  if (!scriptLoaded) {
    return (
      <div className="w-full h-full bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-6 text-center gap-2 border border-slate-100 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-[#16A34A] border-t-transparent animate-spin mb-1"></div>
        <p className="text-xs font-bold text-slate-600">Mounting Google Maps...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-100/70 shadow-3xs">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '180px' }} />
    </div>
  );
};
