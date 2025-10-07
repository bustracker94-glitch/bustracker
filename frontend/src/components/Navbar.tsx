import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, Search, MapPin, Menu, Download } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
export default function Navbar() {
  const translations = {
    en: {
      search: 'Search',
      buses: 'Buses',
      smartBusTracker: 'Smart Bus Tracker',
      realTimeGps: 'Real-time GPS tracking',
      installApp: 'Install App',
    },
    ta: {
      search: 'தேடு',
      buses: 'பஸ்கள்',
      smartBusTracker: 'ஸ்மார்ட் பஸ் டிராக்கர்',
      realTimeGps: 'நேரடி GPS கண்காணிப்பு',
      installApp: 'அப்பை நிறுவவும்',
    },
  };
  const location = useLocation();
  const { language } = useLanguage();
  const langKey = language === 'Tamil' ? 'ta' : 'en';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: translations[langKey].search, icon: Search },
    { path: '/buses', label: translations[langKey].buses, icon: Bus },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{translations[langKey].smartBusTracker}</h1>
                <p className="text-xs text-gray-500">{translations[langKey].realTimeGps}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
                        <LanguageSwitcher />
            {installPrompt && !isAppInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                <span>{translations[langKey].installApp}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {installPrompt && !isAppInstalled && (
              <button
                onClick={handleInstallClick}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                title={translations[langKey].installApp}
              >
                <Download className="h-6 w-6" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              title="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <LanguageSwitcher />
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}