import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, User, Navigation } from 'lucide-react';

interface Bus {
  busId: string;
  driver: string;
  route: string;
  currentStop?: string;
  nextStop?: string;
  eta: string | number;
  speed: number;
  status: string;
  updated: string;
}

interface BusCardProps {
  bus: Bus;
}

export default function BusCard({ bus }: BusCardProps) {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'moving':
        return 'status-moving';
      case 'stopped':
        return 'status-stopped';
      case 'at stop':
        return 'status-at-stop';
      default:
        return 'status-badge bg-gray-100 text-gray-600';
    }
  };

  const formatEta = (eta: string | number) => {
    if (typeof eta === 'number') {
      return `${eta} min`;
    }
    return eta;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{bus.busId}</h3>
          <p className="text-sm text-gray-500">{bus.route}</p>
        </div>
        <span className={getStatusClass(bus.status)}>
          {bus.status}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          <span>{bus.driver}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          <span>
            {bus.currentStop ? `At ${bus.currentStop}` : 'Location updating...'}
          </span>
        </div>

        {bus.nextStop && (
          <div className="flex items-center text-sm text-gray-600">
            <Navigation className="h-4 w-4 mr-2 text-gray-400" />
            <span>Next: {bus.nextStop}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          <span>ETA: {formatEta(bus.eta)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <span className="font-medium">{bus.speed} km/h</span>
          <span className="mx-2">•</span>
          <span>Updated {formatTime(bus.updated)}</span>
        </div>
        
        <Link
          to={`/track/${bus.busId}`}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200"
        >
          Track Live →
        </Link>
      </div>
    </div>
  );
}