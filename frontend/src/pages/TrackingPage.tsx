import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBus } from '../context/BusContext';
import MapView from '../components/MapView';
import { ArrowLeft, MapPin, Clock, Navigation, User, RefreshCw, AlertCircle, Phone } from 'lucide-react';

export default function TrackingPage() {
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

  if (state.loading && !bus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading bus details...</h3>
            <p className="text-gray-600">Fetching real-time location and route information</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !bus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bus not found</h3>
            <p className="text-gray-600 mb-4">
              {state.error || 'Unable to load bus tracking information'}
            </p>
            <Link to="/buses" className="btn-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to Buses
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
            Back to Buses
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
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{bus.busId}</h1>
                <p className="text-gray-600">{bus.route}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="font-medium">{bus.speed} km/h</div>
                <div>Updated {new Date(bus.updated).toLocaleTimeString()}</div>
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
                  {bus.currentStop ? `At ${bus.currentStop}` : 'En route'}
                </span>
              </div>

              {bus.nextStop && (
                <div className="flex items-center text-gray-700">
                  <Navigation className="h-4 w-4 mr-3 text-gray-400" />
                  <span>Next: {bus.nextStop}</span>
                </div>
              )}

              <div className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-3 text-gray-400" />
                <span>ETA: {formatEta(bus.eta)}</span>
              </div>
            </div>
          </div>

          {/* Route Stops */}
          {bus.stops && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                Route Stops
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
                              {stop.name}
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
                            {isCurrent ? 'Current' : isPassed ? 'Passed' : 'Upcoming'}
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
          <span>Live tracking • Updates every 3 seconds</span>
        </div>
      </div>
    </div>
  );
}