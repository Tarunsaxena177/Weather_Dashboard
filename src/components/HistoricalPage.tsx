import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sun, 
  RefreshCw,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { motion } from 'motion/react';
import { WeatherChart } from './Charts';
import { 
  fetchHistoricalWeather, 
  fetchHistoricalAirQuality,
  Location 
} from '../services/weatherService';

interface HistoricalPageProps {
  location: Location;
  unit: 'C' | 'F';
  convertTemp: (c: number) => number;
}

const HistoricalPage: React.FC<HistoricalPageProps> = ({ location, unit, convertTemp }) => {
  const [histStartDate, setHistStartDate] = useState(subDays(new Date(), 7));
  const [histEndDate, setHistEndDate] = useState(new Date());
  const [histWeather, setHistWeather] = useState<any>(null);
  const [histAirQuality, setHistAirQuality] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadHistorical = useCallback(async () => {
    try {
      setLoading(true);
      const [weather, aq] = await Promise.all([
        fetchHistoricalWeather(location, histStartDate, histEndDate),
        fetchHistoricalAirQuality(location, histStartDate, histEndDate)
      ]);
      setHistWeather(weather);
      setHistAirQuality(aq);
    } catch (err) {
      console.error("Failed to load historical data", err);
    } finally {
      setLoading(false);
    }
  }, [location, histStartDate, histEndDate]);

  useEffect(() => {
    loadHistorical();
  }, [loadHistorical]);

  const formatIST = (dateStr: string) => {
    try {
      return formatInTimeZone(new Date(dateStr), 'Asia/Kolkata', 'HH:mm');
    } catch (e) {
      return '--';
    }
  };

  const historicalChartData = React.useMemo(() => {
    if (!histWeather) return [];
    return histWeather.daily.time.map((time: string, i: number) => ({
      date: format(new Date(time), 'MMM dd'),
      tempMean: convertTemp(histWeather.daily.temperature_2m_mean[i]),
      tempMax: convertTemp(histWeather.daily.temperature_2m_max[i]),
      tempMin: convertTemp(histWeather.daily.temperature_2m_min[i]),
      precipitation: histWeather.daily.precipitation_sum[i],
      windSpeed: histWeather.daily.wind_speed_10m_max[i],
      pm10: histAirQuality?.hourly.pm10[i * 24], // Simplified daily sample
      pm25: histAirQuality?.hourly.pm2_5[i * 24],
    }));
  }, [histWeather, histAirQuality, convertTemp]);

  if (loading && !histWeather) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-slate-400 font-medium">Loading historical data...</div>
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
      {/* Date Range Picker */}
      <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Historical Trends</h2>
          <p className="text-sm text-slate-500">Analyze weather patterns over a selected date range (max 2 years).</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
            <input 
              type="date" 
              value={format(histStartDate, 'yyyy-MM-dd')}
              onChange={(e) => setHistStartDate(new Date(e.target.value))}
              className="bg-slate-50 border-slate-200 rounded-lg text-sm px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
            <input 
              type="date" 
              value={format(histEndDate, 'yyyy-MM-dd')}
              onChange={(e) => setHistEndDate(new Date(e.target.value))}
              className="bg-slate-50 border-slate-200 rounded-lg text-sm px-3 py-2"
            />
          </div>
          <button 
            onClick={loadHistorical}
            className="mt-4 md:mt-0 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Update
          </button>
        </div>
      </div>

      {/* Historical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherChart 
          title={`Temperature Trends (°${unit})`} 
          data={historicalChartData} 
          xKey="date" 
          yKeys={[
            { key: 'tempMax', color: '#ef4444', name: 'Max' },
            { key: 'tempMean', color: '#6366f1', name: 'Mean' },
            { key: 'tempMin', color: '#3b82f6', name: 'Min' }
          ]} 
          unit={`°${unit}`}
        />
        <WeatherChart 
          title="Total Precipitation (mm)" 
          data={historicalChartData} 
          xKey="date" 
          yKeys={[{ key: 'precipitation', color: '#8b5cf6', name: 'Precipitation' }]} 
          type="bar"
          unit="mm"
        />
        <WeatherChart 
          title="Max Wind Speed (km/h)" 
          data={historicalChartData} 
          xKey="date" 
          yKeys={[{ key: 'windSpeed', color: '#f59e0b', name: 'Wind' }]} 
          unit="km/h"
        />
        <WeatherChart 
          title="Air Quality Trends (PM10 & PM2.5)" 
          data={historicalChartData} 
          xKey="date" 
          yKeys={[
            { key: 'pm10', color: '#ef4444', name: 'PM10' },
            { key: 'pm25', color: '#ec4899', name: 'PM2.5' }
          ]} 
        />
      </div>

      {/* Sun Cycle Historical Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" /> Sun Cycle (IST)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Sunrise</th>
                <th className="px-6 py-3">Sunset</th>
                <th className="px-6 py-3">Dominant Wind Dir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {histWeather?.daily.time.slice(0, 10).map((time: string, i: number) => (
                <tr key={time} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{format(new Date(time), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">{formatIST(histWeather.daily.sunrise[i])}</td>
                  <td className="px-6 py-4">{formatIST(histWeather.daily.sunset[i])}</td>
                  <td className="px-6 py-4">{histWeather.daily.wind_direction_10m_dominant[i]}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {histWeather?.daily.time.length > 10 && (
          <div className="p-4 bg-slate-50 text-center">
            <p className="text-xs text-slate-500 italic">Showing first 10 days of range</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HistoricalPage;
