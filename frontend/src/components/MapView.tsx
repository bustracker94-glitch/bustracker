import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import busImage from './bus1.png';
import { useLanguage } from '../context/LanguageContext';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Stop {
  name: string;
  lat: number;
  lon: number;
  time: string;
  order: number;
}

interface Bus {
  busId: string;
  lat: number;
  lon: number;
  speed: number;
  status: string;
  currentStopIndex: number;
  stops?: Stop[];
}

interface MapViewProps {
  bus: Bus;
}

// Custom bus marker icon
const busIcon = L.icon({
  iconUrl: busImage,
  iconSize: [50, 50],
  iconAnchor: [20, 40],
});

const upcomingStopIcon = L.divIcon({
  html: `<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const passedStopIcon = L.divIcon({
  html: `<div class="w-4 h-4 bg-gray-400 rounded-full border-2 border-white shadow-md"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const currentStopIcon = L.divIcon({
    html: `<div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse"><div class="w-3 h-3 bg-white rounded-full"></div></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });


const MapView: React.FC<MapViewProps> = ({ bus }) => {
  const mapRef = useRef<L.Map>(null);
  const center = [bus.lat, bus.lon] as [number, number];
  const { language } = useLanguage();
  const t = language === 'Tamil' ? {
    speed: 'வேகம்',
    kmh: 'கிமீ/மணி',
    status: 'நிலை',
    scheduled: 'திட்டமிடப்பட்டது',
    currentLocation: '📍 தற்போதைய இடம்',
    moving: 'நகர்கிறது',
    stopped: 'நிறுத்தப்பட்டது',
    atStop: 'நிறுத்தத்தில்',
  } : {
    speed: 'Speed',
    kmh: 'km/h',
    status: 'Status',
    scheduled: 'Scheduled',
    currentLocation: '📍 Current location',
    moving: 'Moving',
    stopped: 'Stopped',
    atStop: 'At Stop',
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'moving':
        return t.moving;
      case 'stopped':
        return t.stopped;
      case 'at stop':
        return t.atStop;
      default:
        return status;
    }
  };

  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-full aspect-[4/3] rounded-xl overflow-hidden">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={13}
        className="h-full w-full rounded-xl"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Bus marker */}
        <Marker position={center} icon={busIcon} zIndexOffset={1000}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900">{bus.busId}</h3>
              <p className="text-sm text-gray-600">{t.speed}: {bus.speed} {t.kmh}</p>
              <p className="text-sm text-gray-600">{t.status}: {getStatusLabel(bus.status)}</p>
            </div>
          </Popup>
        </Marker>

        {/* Stop markers */}
        {bus.stops && bus.stops.map((stop, index) => {
          const isCurrent = index === bus.currentStopIndex;
          const isPassed = index < bus.currentStopIndex;
          let icon = upcomingStopIcon;
          if (isCurrent) {
            icon = currentStopIcon;
          } else if (isPassed) {
            icon = passedStopIcon;
          }

          return (
            <Marker key={stop.name} position={[stop.lat, stop.lon]} icon={icon}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-semibold">{stop.name}</h4>
                  <p className="text-sm text-gray-600">{t.scheduled}: {stop.time}</p>
                  {isCurrent && <p className="text-sm font-bold text-yellow-600">{t.currentLocation}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route polyline */}
        {bus.stops && (
          <Polyline
            positions={bus.stops.map(stop => [stop.lat, stop.lon])}
            pathOptions={{ color: 'blue', dashArray: '5, 10' }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
