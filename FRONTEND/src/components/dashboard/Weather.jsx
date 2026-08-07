import { useState, useEffect } from 'react';
import {
  RefreshCw, MapPin, Droplets, Wind, Eye, Sun, Sunset,
  ArrowUp, ArrowDown, CloudRain, Zap, CloudSun, Cloud,
  CloudDrizzle, Navigation, Thermometer, ChevronDown, ChevronUp,
  Tractor, Umbrella, ShieldAlert, Flame, Activity
} from 'lucide-react';
import axios from "axios";



/* ── Condition config ── */
const conditionCfg = {
  'sunny':         { icon: Sun,          gradient: 'from-amber-400 via-orange-400 to-orange-500', glow: 'shadow-orange-300',  label: 'Sunny',          animClass: 'animate-spin-slow'   },
  'partly-cloudy': { icon: CloudSun,     gradient: 'from-sky-400 via-blue-400 to-cyan-500',       glow: 'shadow-blue-300',    label: 'Partly Cloudy',  animClass: 'animate-float'       },
  'cloudy':        { icon: Cloud,        gradient: 'from-slate-400 via-gray-400 to-gray-500',     glow: 'shadow-gray-300',    label: 'Cloudy',         animClass: 'animate-float'       },
  'rainy':         { icon: CloudRain,    gradient: 'from-blue-500 via-indigo-500 to-indigo-600',  glow: 'shadow-indigo-300',  label: 'Rainy',          animClass: 'animate-bounce-slow' },
  'drizzle':       { icon: CloudDrizzle, gradient: 'from-teal-400 via-cyan-400 to-cyan-500',      glow: 'shadow-cyan-300',    label: 'Drizzle',        animClass: 'animate-bounce-slow' },
  'thunderstorm':  { icon: Zap,          gradient: 'from-purple-600 via-violet-600 to-gray-700',  glow: 'shadow-purple-300',  label: 'Thunderstorm',   animClass: 'animate-pulse'       },
};

/* ── Advisory per condition ── */
const advisoryCfg = {
  'sunny': {
    icon: Flame, title: 'Sunny Advisory',
    text: 'High UV levels today. Avoid field work between 11 AM and 3 PM. Irrigate crops in the early morning or evening. Keep livestock in shade and ensure adequate water supply.',
    bg: 'bg-amber-50', border: 'border-amber-200', iconCls: 'text-amber-500',
    badge: 'Hot & Sunny', badgeCls: 'bg-amber-100 text-amber-700',
  },
  'partly-cloudy': {
    icon: Tractor, title: "Today's Advisory",
    text: 'Mild and pleasant conditions. Good day for field work in the morning. Avoid heavy irrigation — moderate humidity is sufficient. Check crop health and apply fertilizers if needed.',
    bg: 'bg-sky-50', border: 'border-sky-200', iconCls: 'text-sky-500',
    badge: 'Favorable', badgeCls: 'bg-sky-100 text-sky-700',
  },
  'cloudy': {
    icon: Cloud, title: 'Cloudy Advisory',
    text: 'Overcast skies expected. Moderate farming activity recommended. Watch out for sudden rain showers. Postpone pesticide spraying and avoid outdoor drying of produce.',
    bg: 'bg-slate-50', border: 'border-slate-200', iconCls: 'text-slate-500',
    badge: 'Moderate', badgeCls: 'bg-slate-100 text-slate-700',
  },
  'rainy': {
    icon: Umbrella, title: 'Rain Advisory',
    text: 'Heavy rainfall expected. Avoid all field activities. Ensure proper drainage in paddy and vegetable fields to prevent waterlogging. Store harvested produce safely in dry areas.',
    bg: 'bg-blue-50', border: 'border-blue-200', iconCls: 'text-blue-500',
    badge: 'Rain Alert', badgeCls: 'bg-blue-100 text-blue-700',
  },
  'drizzle': {
    icon: CloudDrizzle, title: 'Drizzle Advisory',
    text: 'Light drizzle throughout the day. Postpone spraying of pesticides and fertilizers. Light field work is possible but use waterproof protective clothing. Monitor for fungal disease.',
    bg: 'bg-teal-50', border: 'border-teal-200', iconCls: 'text-teal-500',
    badge: 'Light Rain', badgeCls: 'bg-teal-100 text-teal-700',
  },
  'thunderstorm': {
    icon: ShieldAlert, title: 'Thunderstorm Warning',
    text: 'Severe thunderstorm alert. Do NOT go into open fields. Disconnect electrical equipment. Move livestock to covered shelters immediately. Stay indoors until conditions improve.',
    bg: 'bg-purple-50', border: 'border-purple-200', iconCls: 'text-purple-600',
    badge: 'Critical', badgeCls: 'bg-purple-100 text-purple-700',
  },
};

/* ── Forecast data ── */
const getCondition = (weatherMain) => {
  switch (weatherMain?.toLowerCase()) {
    case "clear":
      return "sunny";

    case "clouds":
      return "cloudy";

    case "rain":
      return "rainy";

    case "drizzle":
      return "drizzle";

    case "thunderstorm":
      return "thunderstorm";

    default:
      return "partly-cloudy";
  }
};
const forecastGradient = {
  'sunny':        'from-amber-400 to-orange-500',
  'partly-cloudy':'from-sky-400 to-blue-500',
  'cloudy':       'from-slate-400 to-gray-500',
  'rainy':        'from-blue-500 to-indigo-600',
  'drizzle':      'from-teal-400 to-cyan-500',
  'thunderstorm': 'from-purple-500 to-gray-700',
};

/* ─────────────────────────────────────────── */
export  default function Weather() {

  const [now, setNow]           = useState(new Date());     
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('10:30 AM');
  const [showForecast, setShowForecast] = useState(false);
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [forecast, setForecast] = useState([]);

  const condition = getCondition(weather?.weather?.[0]?.main);
  const cfg = conditionCfg[condition] || conditionCfg["partly-cloudy"];
  const adv = advisoryCfg[condition] || advisoryCfg["partly-cloudy"];
  const Icon  = cfg.icon;
  const AdvIcon = adv.icon;
  const weatherDescription = weather?.weather?.[0]?.description || cfg.label;

 useEffect(() => {
  const t = setInterval(() => setNow(new Date()), 30000);

  return () => clearInterval(t);
}, []);

useEffect(() => {
  updateCurrentLocationWeather();
}, []);

const updateCurrentLocationWeather = async (showRefresh = false) => {
  if (showRefresh) {
    setRefreshing(true);
  } else {
    setLoading(true);
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        await fetchWeather(
          position.coords.latitude,
          position.coords.longitude
        );

        await fetchForecast(
          position.coords.latitude,
          position.coords.longitude
        );

        setLastUpdated(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        );
      } catch (error) {
        console.log(error);
        alert("Unable to fetch weather data");
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    (error) => {
      console.log(error);

      setRefreshing(false);
      setLoading(false);

      alert("Unable to get current location");
    },
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    }
  );
};

const handleRefresh = () => {
  updateCurrentLocationWeather(true);
};

const handleCurrentLocation = () => {
  updateCurrentLocationWeather();
};

const fetchWeather = async (lat, lon) => {
  try {
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    setWeather(res.data);
    setWeather(res.data);

const aqiRes = await axios.get(
  `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
);

setAqi(aqiRes.data.list[0].main.aqi);
  } catch (err) {
    console.log(err);
    alert("Unable to fetch weather data");
  }
};

const fetchWeatherByCity = async () => {
  if (!searchCity.trim()) return;

  try {
    setLoading(true);

    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
    );

    setWeather(res.data);
    setSearchCity("");
    await fetchForecast(
     res.data.coord.lat,
     res.data.coord.lon
);

setLastUpdated(
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
);
  } catch (err) {
  if (err.response?.status === 404) {
    alert("City not found");
  } else {
    alert("Unable to fetch weather. Please try again.");
  }

  console.log(err);
}
finally {
  setLoading(false);
}
};

const fetchForecast = async (lat, lon) => {
  try {
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    // Har din ka 12 PM wala forecast
    const daily = res.data.list.filter((item) =>
      item.dt_txt.includes("12:00:00")
    );

    setForecast(daily.slice(0, 5));
  } catch (err) {
    console.log(err);
  }
};

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  if (loading && !weather) {
  return (
    <div className="w-full h-80 flex items-center justify-center">
      <p className="text-lg font-semibold text-gray-600">
        Loading weather...
      </p>
    </div>
  );
}
  return (
    <div className="w-full space-y-0">


      {/* ══════ HERO CARD ══════ */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.gradient} text-white shadow-2xl ${cfg.glow}`}>

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

        {/* Rain streaks */}
        {(condition === 'rainy' || condition === 'drizzle' || condition === 'thunderstorm') && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-15">
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px bg-white rounded-full animate-rain"
                style={{ left: `${(i * 7.3) % 100}%`, top: `-${(i * 6) % 25}%`, height: `${14 + (i % 5) * 7}px`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 p-4">

          {/* ── Top row: location + time ── */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-white/70 shrink-0" />
              <span className="text-white/90 text-xs font-semibold">{weather?.name}, {weather?.sys?.country}</span>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xs">{timeStr}</p>
              <p className="text-white/55 text-xs">{dateStr}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 mb-4">
  <input
    type="text"
    placeholder="Search city..."
    value={searchCity}
    onChange={(e) => setSearchCity(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        fetchWeatherByCity();
      }
    }}
    className="flex-1 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 focus:outline-none"
  />

  <button
    onClick={fetchWeatherByCity}
    className="px-5 py-2 rounded-xl bg-white text-sky-700 font-semibold hover:bg-sky-100 transition"
  >
    Search
  </button>

     <button
         onClick={handleCurrentLocation}
      disabled={loading}
      className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60"
  >
  {loading ? "Loading..." : "📍 Current"}
    </button>
      </div>
          {/* ── Main body: icon + temp + metrics ── */}
          <div className="flex items-center gap-5">

            {/* Icon */}
            <div className={`shrink-0 p-3 rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg ${cfg.animClass}`}>
              <Icon className="h-14 w-14 text-white drop-shadow-lg" />
            </div>

            {/* Temp + label */}
            <div className="flex-1">
             <p className="text-6xl font-black leading-none tracking-tight">
               {Math.round(weather?.main?.temp || 0)}
                <span className="text-2xl align-super font-bold">°C</span>
                </p>
              <p className="text-white/80 font-semibold text-sm mt-1">{weatherDescription}</p>
              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                <span className="flex items-center gap-0.5 text-xs text-white/70">
                  <ArrowUp className="h-3 w-3 text-red-300" />
                   {Math.round(weather?.main?.temp_max || 0)}°
                    </span>
                <span className="flex items-center gap-0.5 text-xs text-white/70">
                  <ArrowDown className="h-3 w-3 text-blue-200" />{Math.round(weather?.main?.temp_min || 0)}°
                </span>
                <span className="text-white/40 text-xs">|</span>
                <span className="flex items-center gap-1 text-xs text-white/70">
                  <Thermometer className="h-3 w-3" />{Math.round(weather?.main?.feels_like || 0)}°
                </span>
              </div>
            </div>

            {/* Right mini-stats 2×2 grid (desktop) */}
            <div className="hidden md:grid grid-cols-2 gap-1.5 shrink-0">
              {[
  {
    icon: Droplets,
    label: "Humidity",
    val: `${weather?.main?.humidity ?? 0}%`,
  },
  {
    icon: CloudRain,
    label: "Cloud",
    val: `${weather?.clouds?.all ?? 0}%`,
  },
        {
          icon: Wind,
         label: "Wind",
         val: `${((weather?.wind?.speed ?? 0) * 3.6).toFixed(1)} km/h`,
        },
       {
         icon: Navigation,
        label: "Direction",
        val: `${weather?.wind?.deg ?? 0}°`,
         },
         ].map(m => {
                const MIcon = m.icon;
                return (
                  <div key={m.label} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                    <MIcon className="h-3 w-3 text-white/60 shrink-0" />
                    <div>
                      <p className="text-white/50 text-[10px] leading-none">{m.label}</p>
                      <p className="text-white font-bold text-xs leading-tight mt-0.5">{m.val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Mobile metrics row ── */}
          <div className="grid grid-cols-4 gap-1.5 mt-3 md:hidden">
        {[
  {
       icon: Droplets,
       val: `${weather?.main?.humidity ?? 0}%`,
       },
     {
       icon: CloudRain,
       val: `${weather?.clouds?.all ?? 0}%`,
       },
       {
         icon: Wind,
        val: `${weather?.wind?.speed ?? 0} km/h`,
      },
       {
        icon: Navigation,
         val: `${weather?.wind?.deg ?? 0}°`,
         },
        ].map((m, i) => {
              const MIcon = m.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1 bg-white/15 backdrop-blur-sm rounded-xl py-2">
                  <MIcon className="h-4 w-4 text-white/70" />
                  <span className="text-white font-bold text-xs">{m.val}</span>
                </div>
              );
            })}
          </div>

          {/* ── Metrics strip: sunrise / sunset / visibility / AQI ── */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20 flex-wrap">
           {[
  {
    icon: Sun,
    label: "Sunrise",
    val: weather
      ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "--",
  },
  {
    icon: Sunset,
    label: "Sunset",
    val: weather
      ? new Date(weather.sys.sunset * 1000).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "--",
  },
      {
        icon: Eye,
        label: "Visibility",
        val: weather
         ? `${(weather.visibility / 1000).toFixed(1)} km`
         : "--",
       },
       {
           icon: Activity,
          label: "AQI",
          val: aqi ?? "--",
           }
       ].map(m => {
              const MIcon = m.icon;
              return (
                <div key={m.label} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1">
                  <MIcon className="h-3 w-3 text-white/60 shrink-0" />
                  <span className="text-white/55 text-xs">{m.label}:</span>
                  <span className="text-white text-xs font-bold">{m.val}</span>
                </div>
              );
            })}
            <div className="ml-auto flex items-center gap-1 text-white/45 text-xs">
              <RefreshCw className="h-2.5 w-2.5" />
              Updated {lastUpdated}
            </div>
          </div>

          {/* ── Advisory box ── */}
          <div className={`mt-2.5 rounded-xl border ${adv.border} ${adv.bg} px-2.5 py-1.5 flex items-center gap-2`}>
            <div className="p-1 rounded-lg bg-white/80 shadow-sm shrink-0">
              <AdvIcon className={`h-3 w-3 ${adv.iconCls}`} />
            </div>
            <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
              <p className="text-gray-800 font-bold text-xs whitespace-nowrap">{adv.title}</p>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${adv.badgeCls}`}>{adv.badge}</span>
              <p className="text-gray-600 text-xs truncate">{adv.text}</p>
            </div>
          </div>

          {/* ── Buttons ── */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 bg-gradient-to-r from-white/20 to-white/30 hover:from-white/30 hover:to-white/40 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 flex-1 justify-center"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>

            <button
              onClick={() => setShowForecast(p => !p)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-white to-white/90 hover:from-white/95 hover:to-white/80 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex-1 justify-center"
            >
              {showForecast ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showForecast ? 'Hide Forecast' : 'Full Forecast'}
            </button>
          </div>
        </div>

        {/* ══════ 5-DAY FORECAST (expandable) ══════ */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showForecast ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4">
            <div className="h-px bg-white/20 mb-3" />
            <div className="grid grid-cols-5 gap-1.5">
              {forecast.map((day, i) => {
                const condition = getCondition(day.weather[0].main);
                 const FIcon = conditionCfg[condition].icon;
                const isToday = i === 0;
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-xl transition-all ${
                      isToday
                        ? 'bg-white/25 ring-1 ring-white/50 shadow-lg'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <p className={`text-xs font-bold ${isToday ? 'text-white' : 'text-white/70'}`}>{i === 0
                         ? "Today"
                         : new Date(day.dt_txt).toLocaleDateString("en-IN", {
                         weekday: "short",
                            })}</p>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${forecastGradient[condition]} flex items-center justify-center shadow-sm`}>
                      <FIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <ArrowUp className="h-2 w-2 text-red-300" />
                      <span className="text-xs font-bold text-white">{Math.round(day.main.temp_max)}°</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <ArrowDown className="h-2 w-2 text-blue-200" />
                      <span className="text-xs text-white/60">{Math.round(day.main.temp_min)}°</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Droplets className="h-2 w-2 text-blue-200" />
                      <span className="text-xs text-white/80 font-semibold">{day.pop ? Math.round(day.pop * 100) : 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
