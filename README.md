# SkyInsight

SkyInsight is a high-performance, comprehensive weather dashboard providing real-time, hourly, and historical weather data with advanced visualizations. It offers a clean, modern interface to monitor weather conditions and air quality trends for any location.

## 🚀 Features

- **📍 Intelligent Location Detection**:
  - **Instant IP Geolocation**: Automatically detects your location using IP-based services for an immediate, zero-prompt experience.
  - **Precise Geolocation**: High-accuracy GPS coordinates available via the "Map Pin" button.
  - **Persistent Storage**: Remembers your last location in `localStorage` for instant loading on return visits.
- **⚡ Performance Optimized**:
  - **Sub-500ms Load**: Engineered to load and render critical weather metrics in under 500ms.
  - **Deferred Rendering**: Heavy chart components are deferred to prioritize the initial paint of key stats.
  - **Code Splitting**: Uses `React.lazy` and `Suspense` to minimize the initial JavaScript payload.
  - **Memoized Logic**: Extensive use of `useMemo` and `useCallback` to prevent redundant calculations and re-renders.
  - **API Caching**: Built-in 5-minute caching layer for all weather and air quality requests.
- **📅 Detailed Forecast**: View hourly weather forecasts including temperature, humidity, precipitation probability, UV index, and wind speed.
- **📊 Advanced Visualizations**:
  - **Interactive Charts**: Powered by Recharts with zoom and scroll functionality.
  - **Responsive Design**: Charts and UI automatically adapt for legibility on all screen sizes.
- **🌫️ Air Quality Monitoring**: Track AQI, PM2.5, PM10, and other pollutants in real-time.
- **📜 Historical Trends**: Analyze weather patterns over a selected date range (up to 2 years of historical data).
- **🌡️ Unit Conversion**: Easily toggle between Celsius (°C) and Fahrenheit (°F).
- **📱 Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.

## 🛠️ Technologies Used

- **Framework**: [React 19]
- **Build Tool**: [Vite 6]
- **Language**: [TypeScript]
- **Styling**: [Tailwind CSS 4]
- **Charts**: [Recharts]
- **Icons**: [Lucide React]
- **Animations**: [Motion]
- **Date Manipulation**: [date-fns]
- **APIs**:
  - [Open-Meteo API](https://open-meteo.com/) (Weather & Air Quality data)
  - [BigDataCloud API](https://www.bigdatacloud.com/) (Reverse Geocoding)
  - [ipapi.co](https://ipapi.co/) (IP-based Geolocation)

## ⚙️ Setup Details

To run this project locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd SkyInsight
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`.

## 📁 Project Structure

- `src/components/`: Reusable UI components (WeatherCard, Charts, Deferred, etc.)
- `src/services/`: API integration services with caching logic.
- `src/App.tsx`: Main application orchestrator with location detection.
- `src/index.css`: Global styles and Tailwind configuration.
