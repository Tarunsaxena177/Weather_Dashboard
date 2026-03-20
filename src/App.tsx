import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sun, 
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  fetchLocationName,
  fetchIPLocation,
  Location 
} from './services/weatherService';
import { AnimatePresence, motion } from 'motion/react';

const ForecastPage = React.lazy(() => import('./components/ForecastPage'));
const HistoricalPage = React.lazy(() => import('./components/HistoricalPage'));

type Page = 'forecast' | 'historical';

const STORAGE_KEY = 'meteo_location';

export default function App() {
  const [page, setPage] = useState<Page>('forecast');
  const [location, setLocation] = useState<Location | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(!location);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const detectLocation = useCallback(async (forceGeolocation = false) => {
    setLoading(true);
    setError(null);

    // 1. Try Geolocation if forced or no location
    if (forceGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const name = await fetchLocationName(lat, lng);
          const loc = { latitude: lat, longitude: lng, name: name || undefined };
          setLocation(loc);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
          setLoading(false);
        },
        async () => {
          // Fallback to IP if geolocation fails
          const ipLoc = await fetchIPLocation();
          if (ipLoc) {
            setLocation(ipLoc);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ipLoc));
          }
          setLoading(false);
        },
        { timeout: 5000 }
      );
      return;
    }

    // 2. Try IP Location (Fast)
    const ipLoc = await fetchIPLocation();
    if (ipLoc) {
      setLocation(ipLoc);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ipLoc));
    } else if (!location) {
      // Last resort fallback (not London, maybe a major city like New York)
      const fallback = { latitude: 40.7128, longitude: -74.0060, name: 'New York, US' };
      setLocation(fallback);
    }
    setLoading(false);
  }, [location]);

  useEffect(() => {
    if (!location) {
      detectLocation();
    }
  }, [detectLocation, location]);

  const convertTemp = React.useCallback((c: number) => {
    return unit === 'C' ? c : (c * 9/5) + 32;
  }, [unit]);

  if (loading && !location) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Detecting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">MeteoInsight</h1>
              {location?.name && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-1">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{location.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setPage('forecast')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${page === 'forecast' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Forecast
            </button>
            <button 
              onClick={() => setPage('historical')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${page === 'historical' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Historical
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
            >
              °{unit}
            </button>
            <button 
              onClick={() => detectLocation(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="md:hidden flex mb-8 bg-slate-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setPage('forecast')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${page === 'forecast' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Forecast
          </button>
          <button 
            onClick={() => setPage('historical')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${page === 'historical' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Historical
          </button>
        </div>

        <AnimatePresence mode="wait">
          {location && (
            <React.Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            }>
              {page === 'forecast' ? (
                <ForecastPage 
                  key="forecast" 
                  location={location} 
                  unit={unit} 
                  convertTemp={convertTemp} 
                />
              ) : (
                <HistoricalPage 
                  key="historical" 
                  location={location} 
                  unit={unit} 
                  convertTemp={convertTemp} 
                />
              )}
            </React.Suspense>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
