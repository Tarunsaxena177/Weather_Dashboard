import { format, subYears } from 'date-fns';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWithCache = async (url: string, params: URLSearchParams) => {
  const key = `${url}?${params.toString()}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = await fetch(key);
  if (!response.ok) throw new Error('API request failed');
  const data = await response.json();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

export const fetchWeatherForecast = async (location: Location, date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    start_date: dateStr,
    end_date: dateStr,
    hourly: 'temperature_2m,relative_humidity_2m,precipitation,visibility,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
    timezone: 'auto',
  });

  return fetchWithCache(FORECAST_URL, params);
};

export const fetchAirQuality = async (location: Location, date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    start_date: dateStr,
    end_date: dateStr,
    hourly: 'pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,us_aqi',
    timezone: 'auto',
  });

  return fetchWithCache(AIR_QUALITY_URL, params);
};

export const fetchHistoricalWeather = async (location: Location, startDate: Date, endDate: Date) => {
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    start_date: startStr,
    end_date: endStr,
    daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,sunrise,sunset,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
    timezone: 'auto',
  });

  return fetchWithCache(ARCHIVE_URL, params);
};

export const fetchHistoricalAirQuality = async (location: Location, startDate: Date, endDate: Date) => {
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    start_date: startStr,
    end_date: endStr,
    hourly: 'pm10,pm2_5',
    timezone: 'auto',
  });

  return fetchWithCache(AIR_QUALITY_URL, params);
};

export const fetchIPLocation = async (): Promise<Location | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return null;
    const data = await response.json();
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      name: `${data.city}, ${data.country_name}`
    };
  } catch (e) {
    return null;
  }
};

export const fetchLocationName = async (lat: number, lng: number) => {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    if (!response.ok) return null;
    const data = await response.json();
    return `${data.city || data.locality || 'Unknown Location'}, ${data.countryName || ''}`;
  } catch (e) {
    return null;
  }
};
