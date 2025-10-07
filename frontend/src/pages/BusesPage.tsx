import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useBus } from '../context/BusContext';
import BusCard from '../components/BusCard';
import { Bus, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BusesPage() {
  const { language } = useLanguage();
  const t = language === 'Tamil' ? {
    loadingBuses: 'பஸ்கள் ஏற்றப்படுகிறது...',
    fetchingInfo: 'நேரடி பஸ் தகவலை பெறுகிறது',
    unableToLoad: 'பஸ்களை ஏற்ற முடியவில்லை',
    retry: 'மீண்டும் முயற்சி',
    backToSearch: 'தேடலுக்கு திரும்பவும்',
    updating: 'புதுப்பிக்கிறது...',
    refresh: 'புதுப்பிக்க',
    availableBuses: 'கிடைக்கும் பஸ்கள்',
    journeyFrom: 'பயணம்',
    to: 'க்கு',
    allBuses: 'சேவையில் உள்ள அனைத்து பஸ்கள்',
    noBusesFound: 'பஸ்கள் கிடைக்கவில்லை',
    noBusesRunning: 'உங்கள் தேர்ந்தெடுத்த பாதைக்கு தற்போது எந்த பஸ்களும் இயக்கப்படவில்லை.',
    tryDifferentRoute: 'வேறு பாதையை முயற்சிக்கவும்',
    liveTracking: 'நேரடி கண்காணிப்பு • 5 வினாடிக்கு ஒரு முறை',
  } : {
    loadingBuses: 'Loading buses...',
    fetchingInfo: 'Fetching real-time bus information',
    unableToLoad: 'Unable to load buses',
    retry: 'Retry',
    backToSearch: 'Back to Search',
    updating: 'Updating...',
    refresh: 'Refresh',
    availableBuses: 'Available Buses',
    journeyFrom: 'Journey from',
    to: 'to',
    allBuses: 'All buses currently in service',
    noBusesFound: 'No buses found',
    noBusesRunning: 'There are currently no buses running for your selected route.',
    tryDifferentRoute: 'Try a different route',
    liveTracking: 'Live tracking • Updates every 5 seconds',
  };
  const [searchParams] = useSearchParams();
  const { state, fetchBuses } = useBus();
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  useEffect(() => {
    fetchBuses();
  }, []);

  if (state.loading && state.buses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.loadingBuses}</h3>
            <p className="text-gray-600">{t.fetchingInfo}</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.unableToLoad}</h3>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <button
              onClick={fetchBuses}
              className="btn-primary"
            >
              <RefreshCw className="h-4 w-4" />
              {t.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              {t.backToSearch}
            </Link>
          </div>
          <button
            onClick={fetchBuses}
            disabled={state.loading}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {state.loading ? t.updating : t.refresh}
            </span>
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.availableBuses}</h1>
          {from && to ? (
            <p className="text-lg text-gray-600">
              {t.journeyFrom} <span className="font-medium text-gray-900">{from}</span> {t.to}{' '}
              <span className="font-medium text-gray-900">{to}</span>
            </p>
          ) : (
            <p className="text-lg text-gray-600">{t.allBuses}</p>
          )}
        </div>
      </div>

      {/* Bus Cards */}
      {state.buses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {state.buses.map((bus) => (
            <BusCard key={bus.busId} bus={bus} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Bus className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">{t.noBusesFound}</h3>
          <p className="text-gray-600 mb-6">
            {t.noBusesRunning}
          </p>
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" />
            {t.tryDifferentRoute}
          </Link>
        </div>
      )}

      {/* Real-time indicator */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <span>{t.liveTracking}</span>
        </div>
      </div>
    </div>
  );
}