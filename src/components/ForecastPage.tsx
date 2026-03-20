import React, { useState, useEffect, useCallback } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Sun, 
  CloudRain, 
  Calendar, 
  Activity, 
  Wind as WindIcon,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { motion } from 'motion/react';
import { WeatherCard } from './WeatherCard';
import { WeatherChart } from './Charts';
import { Deferred } from './Deferred';
import { 
  fetchWeatherForecast, 
  fetchAirQuality, 
  Location 
} from '../services/weatherService';

interface ForecastPageProps {
  location: Location;
  unit: 'C' | 'F';
  convertTemp: (c: number) => number;
}

const ForecastPage: React.FC<ForecastPageProps> = React.memo(({ location, unit, convertTemp }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [forecastData, setForecastData] = useState<any>(null);
  const [airQualityData, setAirQualityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadForecast = useCallback(async () => {
    try {
      setLoading(true);
      const [weather, aq] = await Promise.all([
        fetchWeatherForecast(location, selectedDate),
        fetchAirQuality(location, selectedDate)
      ]);
      setForecastData(weather);
      setAirQualityData(aq);
    } catch (err) {
      console.error("Failed to load weather data", err);
    } finally {
      setLoading(false);
    }
  }, [location, selectedDate]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  const hourlyChartData = React.useMemo(() => {
    if (!forecastData) return [];
    return forecastData.hourly.time.map((time: string, i: number) => ({
      time: format(new Date(time), 'HH:00'),
      temperature: convertTemp(forecastData.hourly.temperature_2m[i]),
      humidity: forecastData.hourly.relative_humidity_2m[i],
      precipitation: forecastData.hourly.precipitation[i],
      visibility: forecastData.hourly.visibility[i] / 1000, // km
      windSpeed: forecastData.hourly.wind_speed_10m[i],
      pm10: airQualityData?.hourly.pm10[i],
      pm25: airQualityData?.hourly.pm2_5[i],
    }));
  }, [forecastData, airQualityData, convertTemp]);

  if (loading && !forecastData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-slate-400 font-medium">Loading forecast...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedDate(d => subDays(d, 1))}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500">Weather for</span>
            <span className="text-lg font-bold text-slate-900">{format(selectedDate, 'EEEE, MMMM do')}</span>
          </div>
          <button 
            onClick={() => setSelectedDate(d => addDays(d, 1))}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <Calendar className="w-5 h-5" />
          <input 
            type="date" 
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium cursor-pointer"
          />
        </div>
      </div>

      {/* Weather Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <WeatherCard 
          title="Current Temp" 
          value={forecastData ? convertTemp(forecastData.hourly.temperature_2m[new Date().getHours()]).toFixed(1) : '--'} 
          unit={`°${unit}`} 
          icon={Thermometer} 
        />
        <WeatherCard 
          title="Min/Max" 
          value={forecastData ? `${convertTemp(forecastData.daily.temperature_2m_min[0]).toFixed(0)} / ${convertTemp(forecastData.daily.temperature_2m_max[0]).toFixed(0)}` : '--'} 
          unit={`°${unit}`} 
          icon={Thermometer} 
        />
        <WeatherCard 
          title="Precipitation" 
          value={forecastData ? forecastData.daily.precipitation_probability_max[0] : '--'} 
          unit="%" 
          icon={CloudRain} 
        />
        <WeatherCard 
          title="Humidity" 
          value={forecastData ? forecastData.hourly.relative_humidity_2m[new Date().getHours()] : '--'} 
          unit="%" 
          icon={Droplets} 
        />
        <WeatherCard 
          title="UV Index" 
          value={forecastData ? forecastData.daily.uv_index_max[0] : '--'} 
          icon={Sun} 
        />
        <WeatherCard 
          title="Wind Max" 
          value={forecastData ? forecastData.daily.wind_speed_10m_max[0] : '--'} 
          unit="km/h" 
          icon={WindIcon} 
        />
      </div>

      {/* Sun & Air Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" /> Sun Cycle
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Sunrise</span>
              <span className="text-xl font-semibold">{forecastData ? format(new Date(forecastData.daily.sunrise[0]), 'HH:mm') : '--'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Sunset</span>
              <span className="text-xl font-semibold">{forecastData ? format(new Date(forecastData.daily.sunset[0]), 'HH:mm') : '--'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Air Quality Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">AQI</span>
              <span className="text-lg font-semibold">{airQualityData ? airQualityData.hourly.us_aqi[0] : '--'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">PM10</span>
              <span className="text-lg font-semibold">{airQualityData ? airQualityData.hourly.pm10[0] : '--'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">PM2.5</span>
              <span className="text-lg font-semibold">{airQualityData ? airQualityData.hourly.pm2_5[0] : '--'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">CO</span>
              <span className="text-lg font-semibold">{airQualityData ? airQualityData.hourly.carbon_monoxide[0] : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Charts */}
      <Deferred delay={50}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherChart 
            title={`Temperature (°${unit})`} 
            data={hourlyChartData} 
            xKey="time" 
            yKeys={[{ key: 'temperature', color: '#6366f1', name: 'Temp' }]} 
            type="area"
            unit={`°${unit}`}
          />
          <WeatherChart 
            title="Relative Humidity (%)" 
            data={hourlyChartData} 
            xKey="time" 
            yKeys={[{ key: 'humidity', color: '#0ea5e9', name: 'Humidity' }]} 
            unit="%"
          />
          <WeatherChart 
            title="Precipitation (mm)" 
            data={hourlyChartData} 
            xKey="time" 
            yKeys={[{ key: 'precipitation', color: '#8b5cf6', name: 'Precipitation' }]} 
            type="bar"
            unit="mm"
          />
          <WeatherChart 
            title="Visibility (km)" 
            data={hourlyChartData} 
            xKey="time" 
            yKeys={[{ key: 'visibility', color: '#10b981', name: 'Visibility' }]} 
            unit="km"
          />
          <WeatherChart 
            title="Wind Speed (km/h)" 
            data={hourlyChartData} 
            xKey="time" 
            yKeys={[{ key: 'windSpeed', color: '#f59e0b', name: 'Wind' }]} 
            unit="km/h"
          />
          <WeatherChart 
            title="Air Quality (PM10 & PM2.5)" 
            data={hourlyChartData} 
            xKey="time" 
            yKeys={[
              { key: 'pm10', color: '#ef4444', name: 'PM10' },
              { key: 'pm25', color: '#ec4899', name: 'PM2.5' }
            ]} 
          />
        </div>
      </Deferred>
    </motion.div>
  );
});

export default ForecastPage;
