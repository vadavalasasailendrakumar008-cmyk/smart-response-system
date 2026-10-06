import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Crosshair,
  Search,
  AlertTriangle,
  CheckCircle,
  Building2,
  Navigation,
} from 'lucide-react';

// Custom Pin Icon using Leaflet DivIcon
const createCustomIcon = (isVerified: boolean) =>
  L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px;">
        <div style="
          position: absolute;
          inset: 0;
          background: ${isVerified ? '#ef4444' : '#f59e0b'};
          border-radius: 50%;
          opacity: 0.35;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          background: ${isVerified ? '#dc2626' : '#d97706'};
          border: 3px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  addressText: string;
  isLocationVerified: boolean;
  onLocationChange: (lat: number, lng: number, address: string, verified: boolean) => void;
  height?: string;
  interactive?: boolean;
}

// Controller component to move map programmatically
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.2 });
  }, [center, map]);
  return null;
};

// Map click event listener
const MapEventsHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  addressText,
  isLocationVerified,
  onLocationChange,
  height = '360px',
  interactive = true,
}) => {
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const markerRef = useRef<L.Marker | null>(null);

  // Fallback landmarks for quick demo selection
  const quickLandmarks = [
    { name: 'Market & 4th (Downtown Hub)', lat: 37.7858, lng: -122.4065, addr: 'Market St & 4th St, Downtown, SF' },
    { name: 'SF General Hospital', lat: 37.7558, lng: -122.4045, addr: '1001 Potrero Ave, SF General Hospital' },
    { name: 'Mission District Plaza', lat: 37.7651, lng: -122.4243, addr: 'Valencia & 18th St, Mission District, SF' },
    { name: 'Highway 101 Overpass', lat: 37.7712, lng: -122.4201, addr: 'Hwy 101 Off-Ramp near 13th St, SF' },
  ];

  // Geolocation detection handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your current browser.');
      return;
    }

    setIsDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setIsDetecting(false);
        const resolvedAddress = `GPS Verified: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        onLocationChange(lat, lng, resolvedAddress, true);

        // Optional reverse geocoding via openstreetmap nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              onLocationChange(lat, lng, data.display_name, true);
            }
          })
          .catch(() => {});
      },
      (error) => {
        setIsDetecting(false);
        let msg = 'Unable to acquire GPS coordinates.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please place the pin manually or select a landmark.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Switched to manual map placement.';
        }
        setGeoError(msg);
        // Fallback to default SF coordinates unverified
        onLocationChange(latitude || 37.7749, longitude || -122.4194, addressText || 'Manual Map Placement', false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!interactive) return;
    const addr = `Manual Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    onLocationChange(lat, lng, addr, false);
  };

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const { lat, lng } = marker.getLatLng();
      onLocationChange(lat, lng, `Manual Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}`, false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const first = data[0];
          onLocationChange(
            parseFloat(first.lat),
            parseFloat(first.lon),
            first.display_name,
            false // search result is address-based, not device GPS
          );
        } else {
          setGeoError(`No coordinates found for "${searchQuery}". Please drag the pin directly.`);
        }
      })
      .catch(() => {
        setGeoError('Address search service unavailable. Please drag the pin on the map.');
      });
  };

  return (
    <div className="space-y-3">
      {/* Top Map Control Bar */}
      {interactive && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Address Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search street, building, or intersection..."
              className="w-full pl-9 pr-20 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors"
            >
              Locate
            </button>
          </form>

          {/* Detect Location Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all border shrink-0 ${
              isLocationVerified
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-red-600/20 border-red-500/40 text-red-300 hover:bg-red-600/30'
            }`}
          >
            <Crosshair className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Acquiring GPS Fix...' : 'Detect My Location'}</span>
          </button>
        </div>
      )}

      {/* Verification Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-slate-300 font-medium truncate max-w-[260px] sm:max-w-md">
            {addressText || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
          </span>
        </div>

        <div>
          {isLocationVerified ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
              <CheckCircle className="w-3 h-3" />
              <span>GPS Verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>GPS Unverified (Manual Pin)</span>
            </span>
          )}
        </div>
      </div>

      {/* Error Alert if Geo Fails */}
      {geoError && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Container */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner z-0"
        style={{ height }}
      >
        <MapContainer
          center={[latitude || 37.7749, longitude || -122.4194]}
          zoom={15}
          scrollWheelZoom={interactive}
          className="w-full h-full"
        >
          {/* CartoDB Dark Matter Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapController center={[latitude || 37.7749, longitude || -122.4194]} />
          {interactive && <MapEventsHandler onMapClick={handleMapClick} />}

          <Marker
            position={[latitude || 37.7749, longitude || -122.4194]}
            draggable={interactive}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
            ref={markerRef}
            icon={createCustomIcon(isLocationVerified)}
          >
            <Popup>
              <div className="font-sans">
                <p className="font-bold text-xs text-white">Emergency Incident Location</p>
                <p className="text-[11px] text-slate-300 mt-1">{addressText}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  LAT: {latitude.toFixed(5)} | LNG: {longitude.toFixed(5)}
                </p>
                {interactive && (
                  <p className="text-[10px] text-red-400 mt-1 italic">
                    Drag pin or click map to reposition
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {interactive && (
          <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] text-slate-300 font-mono flex items-center space-x-1.5">
            <Navigation className="w-3 h-3 text-red-400" />
            <span>CLICK OR DRAG PIN TO ADJUST</span>
          </div>
        )}
      </div>

      {/* Landmark Quick Selector */}
      {interactive && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Quick Landmark Coordinates</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {quickLandmarks.map((lm) => (
              <button
                key={lm.name}
                type="button"
                onClick={() => onLocationChange(lm.lat, lm.lng, lm.addr, true)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left text-[11px] text-slate-300 hover:text-white transition-colors truncate"
              >
                <div className="font-medium truncate">{lm.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
