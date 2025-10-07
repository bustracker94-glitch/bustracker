import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBus } from '../context/BusContext';
import { ArrowLeft, MapPin, Clock, Navigation, User, RefreshCw, AlertCircle, Phone } from 'lucide-react';
import MapView from '../components/MapView';
import { useLanguage } from '../context/LanguageContext';

export default function TrackingPage() {
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
    'Chittar': 'சித்தார்',
    'Jeeva nagar': 'ஜீவா நகர்',
    'Anthiyur Pirivu': 'அந்தியூர் பிரிவு',
    'Pathirakadai': 'பத்திரக்கடை',
    'Appachi nagar': 'அப்பாச்சி நகர்',
    'BP Agraharam': 'பிபி அக்ரஹாரம்',
    'Christhu Jothi Matriculation Higher Secondary School': 'கிறிஸ்து ஜோதி மெட்ரிகுலேஷன் மேல்நிலைப் பள்ளி',
    'VOC Park Erode': 'வி.ஓ.சி பார்க் ஈரோடு',
    'GH': 'அரசு மருத்துவமனை',
    'Surampatti four Rd': 'சூரம்பட்டி நான்கு சாலை',
    // Add more as needed
  };
  const t = language === 'Tamil' ? {
    loadingBusDetails: 'பஸ் விவரங்கள் ஏற்றப்படுகிறது...',
    fetchingLocation: 'நேரடி இடம் மற்றும் பாதை தகவலை பெறுகிறது',
    busNotFound: 'பஸ் கிடைக்கவில்லை',
    unableToLoadTracking: 'பஸ் கண்காணிப்பு தகவலை ஏற்ற முடியவில்லை',
    backToBuses: 'பஸ்களுக்கு திரும்பவும்',
    current: 'தற்போதைய',
    passed: 'கடந்தது',
    upcoming: 'வரவிருக்கும்',
    routeStops: 'பாதை நிறுத்தங்கள்',
    eta: 'வருகை நேரம்',
    next: 'அடுத்தது',
    at: 'இடத்தில்',
    enRoute: 'பாதையில்',
    liveTracking: 'நேரடி கண்காணிப்பு • 3 வினாடிக்கு ஒரு முறை',
    updated: 'புதுப்பிக்கப்பட்டது',
    speed: 'வேகம்',
  } : {
    loadingBusDetails: 'Loading bus details...',
    fetchingLocation: 'Fetching real-time location and route information',
    busNotFound: 'Bus not found',
    unableToLoadTracking: 'Unable to load bus tracking information',
    backToBuses: 'Back to Buses',
    current: 'Current',
    passed: 'Passed',
    upcoming: 'Upcoming',
    routeStops: 'Route Stops',
    eta: 'ETA',
    next: 'Next',
    at: 'At',
    enRoute: 'En route',
    liveTracking: 'Live tracking • Updates every 3 seconds',
    updated: 'Updated',
    speed: 'Speed',
  };
  const { busId } = useParams<{ busId: string }>();
  const { state, fetchBusDetails } = useBus();
  const bus = state.selectedBus;

  useEffect(() => {
    if (busId) {
      fetchBusDetails(busId);
    }
  }, [busId]);

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

  // Removed misplaced return block
  if (state.loading && !bus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.loadingBusDetails}</h3>
            <p className="text-gray-600">{t.fetchingLocation}</p>
          </div>
        </div>
      </div>
    );
  }

  // Removed duplicate return block
  if (state.error || !bus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.busNotFound}</h3>
            <p className="text-gray-600 mb-4">
              {state.error || t.unableToLoadTracking}
            </p>
            <Link to="/buses" className="btn-primary">
              <ArrowLeft className="h-4 w-4" />
              {t.backToBuses}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link 
            to="/buses"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            {t.backToBuses}
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className={getStatusClass(bus.status)}>
            {bus.status}
          </span>
          {state.loading && (
            <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-12rem)]">
        {/* Map */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="card flex-1 p-0 overflow-hidden flex flex-col justify-center">
            <MapView bus={bus} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 overflow-y-auto mt-6 lg:mt-0">
          {/* Bus Info */}
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {language === 'Tamil' && bus.busId ? bus.busId.replace('BUS', 'பஸ்') : bus.busId}
                </h1>
                <p className="text-gray-600">
                  {language === 'Tamil' && bus.route
                    ? bus.route
                        .split(' - ')
                        .map(stop => tamilNameMap[stop] || stop)
                        .join(' - ')
                    : bus.route}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="font-medium">{bus.speed} km/h</div>
                <div>{t.updated} {new Date(bus.updated).toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <User className="h-4 w-4 mr-3 text-gray-400" />
                <span>{bus.driver}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                <span>
                  {bus.currentStop
                    ? `${t.at} ${language === 'Tamil' ? (tamilNameMap[bus.currentStop] || bus.currentStop) : bus.currentStop}`
                    : t.enRoute}
                </span>
              </div>

              {bus.nextStop && (
                <div className="flex items-center text-gray-700">
                  <Navigation className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{t.next}: {language === 'Tamil' ? (tamilNameMap[bus.nextStop] || bus.nextStop) : bus.nextStop}</span>
                </div>
              )}

              <div className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-3 text-gray-400" />
                <span>{t.eta}: {formatEta(bus.eta)}</span>
              </div>
            </div>
          </div>

          {/* Route Stops */}
          {bus.stops && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                {t.routeStops}
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bus.stops
                  .sort((a, b) => a.order - b.order)
                  .map((stop, index) => {
                    const isCurrent = index === bus.currentStopIndex;
                    const isPassed = index < bus.currentStopIndex;
                    const isUpcoming = index > bus.currentStopIndex;

                    return (
                      <div
                        key={`${stop.name}-${index}`}
                        className={`p-3 rounded-lg border-l-4 ${
                          isCurrent
                            ? 'bg-yellow-50 border-yellow-400'
                            : isPassed
                            ? 'bg-gray-50 border-gray-300'
                            : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-medium ${
                              isCurrent ? 'text-yellow-800' : isPassed ? 'text-gray-600' : 'text-blue-800'
                            }`}>
                              {language === 'Tamil' ? (tamilNameMap[stop.name] || stop.name) : stop.name}
                            </h4>
                            <p className={`text-sm ${
                              isCurrent ? 'text-yellow-600' : isPassed ? 'text-gray-500' : 'text-blue-600'
                            }`}>
                              {stop.time}
                            </p>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            isCurrent
                              ? 'bg-yellow-200 text-yellow-800'
                              : isPassed
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-blue-200 text-blue-800'
                          }`}>
                            {isCurrent ? t.current : isPassed ? t.passed : t.upcoming}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

         
        </div>
      </div>

      {/* Live indicator */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <span>{t.liveTracking}</span>
        </div>
      </div>
    </div>
  );
}