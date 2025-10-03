import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useBus } from '../context/BusContext';
import BusCard from '../components/BusCard';
import { Bus, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

export default function BusesPage() {
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading buses...</h3>
            <p className="text-gray-600">Fetching real-time bus information</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load buses</h3>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <button
              onClick={fetchBuses}
              className="btn-primary"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
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
              Back to Search
            </Link>
          </div>
          <button
            onClick={fetchBuses}
            disabled={state.loading}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {state.loading ? 'Updating...' : 'Refresh'}
            </span>
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Buses</h1>
          {from && to ? (
            <p className="text-lg text-gray-600">
              Journey from <span className="font-medium text-gray-900">{from}</span> to{' '}
              <span className="font-medium text-gray-900">{to}</span>
            </p>
          ) : (
            <p className="text-lg text-gray-600">All buses currently in service</p>
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
          <h3 className="text-xl font-medium text-gray-900 mb-2">No buses found</h3>
          <p className="text-gray-600 mb-6">
            There are currently no buses running for your selected route.
          </p>
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Try a different route
          </Link>
        </div>
      )}

      {/* Real-time indicator */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <span>Live tracking • Updates every 5 seconds</span>
        </div>
      </div>
    </div>
  );
}