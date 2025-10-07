import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, User, Navigation } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
    const { language } = useLanguage();
    // Shared mapping for all stop/route names
    const tamilNameMap: Record<string, string> = {
      'Boothapadi': 'பூதபாடி',
      'Poonachi': 'பூனாச்சி',
      'Chithar': 'சித்தார்',
      'Bhavani BS': 'பவானி பஸ் நிலையம்',
      'Kalingarayanpalayam': 'கலிங்கராயன்பாளையம்',
      'Lakshminagar': 'லட்சுமிநகர்',
      'R.N. Pudur': 'ஆர்.என். புதூர்',
      'Agraharam': 'அக்ரஹாரம்',
      'Erode BS': 'ஈரோடு பஸ் நிலையம்',
      'Savitha & G.H': 'சவிதா & அரசு மருத்துவமனை',
      'Diesel Shed': 'டீசல் ஷெட்',
      'Kasipalayam': 'காசிபாளையம்',
      'ITI': 'ஐ.டி.ஐ',
      'KK-nagar': 'கே.கே. நகர்',
      'Rangapalayam': 'ரங்கபாளையம்',
      'Mpnmjec': 'எம்.பி.என்.எம்.ஜெக்',
      'Unjapalayam': 'உஞ்சபாளையம்',
      'Attavanaipudur': 'அட்டவணைப்புதூர்',
      // Add more as needed
    };
    const t = language === 'Tamil' ? {
      at: 'இடத்தில்',
      next: 'அடுத்தது',
      eta: 'வருகை நேரம்',
      updated: 'புதுப்பிக்கப்பட்டது',
      trackLive: 'நேரடி கண்காணிப்பு →',
      kmh: 'கிமீ/மணி',
      min: 'நிமிடம்',
      status: {
        moving: 'நகர்கிறது',
        stopped: 'நிறுத்தப்பட்டது',
        atStop: 'நிறுத்தத்தில்',
      },
    } : {
      at: 'At',
      next: 'Next',
      eta: 'ETA',
      updated: 'Updated',
      trackLive: 'Track Live →',
      kmh: 'km/h',
      min: 'min',
      status: {
        moving: 'Moving',
        stopped: 'Stopped',
        atStop: 'At Stop',
      },
    };

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

    const getStatusLabel = (status: string) => {
      switch (status.toLowerCase()) {
        case 'moving':
          return t.status.moving;
        case 'stopped':
          return t.status.stopped;
        case 'at stop':
          return t.status.atStop;
        default:
          return status;
      }
    };

    const formatEta = (eta: string | number) => {
      if (typeof eta === 'number') {
        return `${eta} ${t.min}`;
      }
      return eta;
    };

    const formatTime = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(language === 'Tamil' ? 'ta-IN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {language === 'Tamil' ? bus.busId.replace('BUS', 'பஸ்') : bus.busId}
          </h3>
          <p className="text-sm text-gray-500">
            {language === 'Tamil'
              ? bus.route
                  .split(' - ')
                  .map(stop => tamilNameMap[stop] || stop)
                  .join(' - ')
              : bus.route}
          </p>
        </div>
        <span className={getStatusClass(bus.status)}>
          {getStatusLabel(bus.status)}
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
            {bus.currentStop
              ? `${t.at} ${language === 'Tamil' ? (tamilNameMap[bus.currentStop] || bus.currentStop) : bus.currentStop}`
              : ''}
          </span>
        </div>

        {bus.nextStop && (
          <div className="flex items-center text-sm text-gray-600">
            <Navigation className="h-4 w-4 mr-2 text-gray-400" />
            <span>{t.next}: {language === 'Tamil' ? (tamilNameMap[bus.nextStop] || bus.nextStop) : bus.nextStop}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          <span>{t.eta}: {formatEta(bus.eta)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <span className="font-medium">{bus.speed} {t.kmh}</span>
          <span className="mx-2">•</span>
          <span>{t.updated} {formatTime(bus.updated)}</span>
        </div>
        <Link
          to={`/track/${bus.busId}`}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200"
        >
          {t.trackLive}
        </Link>
      </div>
    </div>
  );
}