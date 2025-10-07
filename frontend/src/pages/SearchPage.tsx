import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Clock, History, ArrowRight } from "lucide-react";
import { useLanguage } from '../context/LanguageContext';

interface RecentSearch {
  from: string;
  to: string;
  timestamp: string;
}

export default function SearchPage() {
  const { language } = useLanguage();
  // Shared mapping for all stop/route names
  const tamilNameMap: Record<string, string> = {
    'Boothapadi': 'பூதபாடி',
    'Poonachi': 'பூனாச்சி',
    'Chithar': 'சித்தார்',
    'Bhavani BS': 'பவானி பஸ் நிலையம்',
    'Kalingarayanpalayam': 'கலிங்கராயன்பாளையம்',
    'Lakshminagar': 'லட்சுமிநகர்',
    'R.N. Pudhur': 'ஆர்.என். புதூர்',
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
    findYourBus: 'உங்கள் பஸ்ஸை கண்டறியுங்கள்',
    trackBuses: 'பஸ்களை நேரடியாக கண்காணிக்கவும், துல்லியமான வருகை நேரத்தைப் பெறவும், உங்கள் பயணத்தை தவறவிடாதீர்கள்',
    from: 'இருந்து',
    to: 'வரை',
    enterDeparture: 'புறப்படும் இடத்தை உள்ளிடவும்',
    enterDestination: 'சேரும் இடத்தை உள்ளிடவும்',
    findAvailableBuses: 'கிடைக்கும் பஸ்களை கண்டறியுங்கள்',
    recentSearches: 'சமீபத்திய தேடல்கள்',
    noRecentSearches: 'இன்னும் சமீபத்திய தேடல்கள் இல்லை',
    searchHistory: 'உங்கள் தேடல் வரலாறு இங்கே தோன்றும்',
    activeRoutes: 'செயலில் உள்ள பாதைகள்',
    busStops: 'பஸ் நிறுத்தங்கள்',
    updateInterval: 'புதுப்பிப்பு இடைவெளி',
    liveTracking: 'நேரடி கண்காணிப்பு',
  } : {
    findYourBus: 'Find Your Bus',
    trackBuses: 'Track buses in real-time, get accurate ETAs, and never miss your ride again',
    from: 'From',
    to: 'To',
    enterDeparture: 'Enter departure location',
    enterDestination: 'Enter destination',
    findAvailableBuses: 'Find Available Buses',
    recentSearches: 'Recent Searches',
    noRecentSearches: 'No recent searches yet',
    searchHistory: 'Your search history will appear here',
    activeRoutes: 'Active Routes',
    busStops: 'Bus Stops',
    updateInterval: 'Update Interval',
    liveTracking: 'Live Tracking',
  };
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Popular stops for Bus 001
  const popularStops = [
    "Boothapadi",
    "Poonachi",
    "Chithar",
    "Bhavani BS",
    "Kalingarayanpalayam",
    "Lakshminagar",
    "R.N. Pudhur",
    "Agraharam",
    "Erode BS",
    "Savitha & G.H",
    "Diesel Shed",
    "Kasipalayam",
    "ITI",
    "KK-nagar",
    "Rangapalayam",
    "Mpnmjec",
  ];

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = () => {
    if (from.trim() && to.trim()) {
      const newSearch: RecentSearch = {
        from: from.trim(),
        to: to.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedSearches = [newSearch, ...recentSearches.slice(0, 4)];
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

      // Navigate to buses page with search params
      navigate(
        `/buses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
    }
  };

  const handleRecentSearch = (search: RecentSearch) => {
    setFrom(search.from);
    setTo(search.to);
  };

  const handleStopClick = (stop: string, field: "from" | "to") => {
    if (field === "from") {
      setFrom(stop);
    } else {
      setTo(stop);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-2xl mb-4">
            <Search className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.findYourBus}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t.trackBuses}
        </p>
      </div>

      {/* Search Form */}
      <div className="card max-w-2xl mx-auto mb-12">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="from"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <MapPin className="inline h-4 w-4 mr-1" />
                {t.from}
              </label>
              <input
                type="text"
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder={t.enterDeparture}
                className="input"
                list="from-suggestions"
              />
              <datalist id="from-suggestions">
                {popularStops.map((stop) => (
                  <option key={stop} value={language === 'Tamil' ? (tamilNameMap[stop] || stop) : stop} />
                ))}
              </datalist>
            </div>

            <div>
              <label
                htmlFor="to"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <MapPin className="inline h-4 w-4 mr-1" />
                {t.to}
              </label>
              <input
                type="text"
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={t.enterDestination}
                className="input"
                list="to-suggestions"
              />
              <datalist id="to-suggestions">
                {popularStops.map((stop) => (
                  <option key={stop} value={language === 'Tamil' ? (tamilNameMap[stop] || stop) : stop} />
                ))}
              </datalist>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!from.trim() || !to.trim()}
            className="btn-primary w-full"
          >
            <Search className="h-5 w-5" />
            {t.findAvailableBuses}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Searches */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <History className="h-5 w-5 mr-2 text-primary-500" />
            {t.recentSearches}
          </h3>
          {recentSearches.length > 0 ? (
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(search)}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        {language === 'Tamil' ? (tamilNameMap[search.from] || search.from) : search.from}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {language === 'Tamil' ? (tamilNameMap[search.to] || search.to) : search.to}
                      </span>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(search.timestamp).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{t.noRecentSearches}</p>
              <p className="text-sm">{t.searchHistory}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-primary-600 mb-1">1</div>
          <div className="text-sm text-gray-600">{t.activeRoutes}</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-primary-600 mb-1">15</div>
          <div className="text-sm text-gray-600">{t.busStops}</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-primary-600 mb-1">5s</div>
          <div className="text-sm text-gray-600">{t.updateInterval}</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-primary-600 mb-1">24/7</div>
          <div className="text-sm text-gray-600">{t.liveTracking}</div>
        </div>
      </div>
    </div>
  );
}
