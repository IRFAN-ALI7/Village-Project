import { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Droplets,
  Cloud,
  Wind,
  Navigation,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Leaf,
  Clock,
  Umbrella,
  RefreshCw,
  CalendarDays,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Flame,
  Zap,
  LocateFixed,
  CloudRain,
  CloudDrizzle,
  CloudSun,
  Sun,
} from "lucide-react";
import axios from "axios";

import sunnyBg from "../../assets/weather/sunny.jpg";
import partlyCloudyBg from "../../assets/weather/partly-cloudy.jpg";
import cloudyBg from "../../assets/weather/cloudy.jpg";
import rainBg from "../../assets/weather/rain.jpg";
import thunderstormBg from "../../assets/weather/thunderstorm.jpg";
import fogBg from "../../assets/weather/fog.jpg";
import snowBg from "../../assets/weather/snow.jpg";
import summerBg from "../../assets/weather/summer.jpg";

/* =========================================================
   CONFIG
========================================================= */

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

const OPENWEATHER_BASE_URL =
  "https://api.openweathermap.org";

/* =========================================================
   BACKGROUND MAP
========================================================= */

const BG_MAP = {
  sunny: sunnyBg,
  "partly-cloudy": partlyCloudyBg,
  cloudy: cloudyBg,
  rain: rainBg,
  thunderstorm: thunderstormBg,
  fog: fogBg,
  snow: snowBg,
  summer: summerBg,
};

/* =========================================================
   OVERLAY MAP
========================================================= */

const OVERLAY_MAP = {
  sunny:
    "linear-gradient(180deg,rgba(5,15,5,0.30) 0%,rgba(5,20,5,0.18) 50%,rgba(0,12,5,0.38) 100%)",

  "partly-cloudy":
    "linear-gradient(180deg,rgba(10,18,28,0.35) 0%,rgba(8,22,38,0.22) 50%,rgba(4,14,20,0.42) 100%)",

  cloudy:
    "linear-gradient(180deg,rgba(20,25,30,0.52) 0%,rgba(22,28,34,0.36) 50%,rgba(14,18,24,0.58) 100%)",

  rain:
    "linear-gradient(180deg,rgba(8,16,44,0.58) 0%,rgba(10,28,56,0.42) 40%,rgba(4,18,38,0.64) 100%)",

  thunderstorm:
    "linear-gradient(180deg,rgba(18,8,38,0.68) 0%,rgba(26,12,46,0.52) 40%,rgba(8,4,28,0.72) 100%)",

  fog:
    "linear-gradient(180deg,rgba(140,148,156,0.48) 0%,rgba(150,158,165,0.32) 50%,rgba(130,138,146,0.52) 100%)",

  snow:
    "linear-gradient(180deg,rgba(90,112,148,0.42) 0%,rgba(100,122,158,0.26) 50%,rgba(80,102,138,0.48) 100%)",

  summer:
    "linear-gradient(180deg,rgba(38,18,4,0.42) 0%,rgba(48,22,4,0.26) 50%,rgba(28,12,2,0.50) 100%)",
};

/* =========================================================
   WEATHER KEY
========================================================= */

function getWeatherKey(condition = "") {
  const c = String(condition).toLowerCase();

  if (
    c.includes("thunder") ||
    c.includes("lightning")
  ) {
    return "thunderstorm";
  }

  if (
    c.includes("snow") ||
    c.includes("sleet") ||
    c.includes("hail")
  ) {
    return "snow";
  }

  if (
    c.includes("fog") ||
    c.includes("mist") ||
    c.includes("haze")
  ) {
    return "fog";
  }

  if (
    c.includes("rain") ||
    c.includes("drizzle") ||
    c.includes("shower")
  ) {
    return "rain";
  }

  if (c.includes("partly")) {
    return "partly-cloudy";
  }

  if (
    c.includes("cloud") ||
    c.includes("overcast")
  ) {
    return "cloudy";
  }

  if (
    c.includes("hot") ||
    c.includes("summer") ||
    c.includes("heat")
  ) {
    return "summer";
  }

  return "sunny";
}

/* =========================================================
   WEATHER ICON
========================================================= */

function getWeatherIcon(condition = "") {
  const c = String(condition).toLowerCase();

  if (
    c.includes("thunder") ||
    c.includes("lightning")
  ) {
    return Zap;
  }

  if (
    c.includes("rain") ||
    c.includes("shower")
  ) {
    return CloudRain;
  }

  if (c.includes("drizzle")) {
    return CloudDrizzle;
  }

  if (
    c.includes("cloud") ||
    c.includes("overcast")
  ) {
    return Cloud;
  }

  if (c.includes("partly")) {
    return CloudSun;
  }

  if (
    c.includes("snow") ||
    c.includes("sleet")
  ) {
    return Cloud;
  }

  if (
    c.includes("fog") ||
    c.includes("mist") ||
    c.includes("haze")
  ) {
    return Cloud;
  }

  return Sun;
}

/* =========================================================
   AQI
========================================================= */

const getAQIInfo = (aqi) => {
  switch (Number(aqi)) {
    case 1:
      return {
        label: "Good",
        cls: "bg-green-100 text-green-700",
      };

    case 2:
      return {
        label: "Fair",
        cls: "bg-lime-100 text-lime-700",
      };

    case 3:
      return {
        label: "Moderate",
        cls: "bg-yellow-100 text-yellow-700",
      };

    case 4:
      return {
        label: "Poor",
        cls: "bg-orange-100 text-orange-700",
      };

    case 5:
      return {
        label: "Very Poor",
        cls: "bg-red-100 text-red-700",
      };

    default:
      return {
        label: "Unavailable",
        cls: "bg-gray-100 text-gray-600",
      };
  }
};

/* =========================================================
   ADVISORY
========================================================= */

const getAdvisory = (weather, conditionKey) => {
  const temp = Number(weather?.main?.temp || 0);

  const rain = Number(
    weather?.rain?.["1h"] ||
      weather?.rain?.["3h"] ||
      0
  );

  const wind = Number(
    weather?.wind?.speed || 0
  );

  if (conditionKey === "thunderstorm") {
    return {
      icon: ShieldAlert,
      title: "Thunderstorm Warning",
      text:
        "Avoid open fields and tall trees. Keep livestock in covered shelter and disconnect electrical equipment until the storm passes.",
      iconCls: "text-purple-700",
      badge: "Critical",
      badgeCls:
        "text-purple-700 bg-purple-100",
    };
  }

  if (
    conditionKey === "rain" ||
    rain >= 5
  ) {
    return {
      icon: Umbrella,
      title: "Rain Advisory",
      text:
        "Rain is expected. Check field drainage, avoid unnecessary pesticide spraying and protect harvested crops from moisture.",
      iconCls: "text-blue-700",
      badge: "Rain Alert",
      badgeCls:
        "text-blue-700 bg-blue-100",
    };
  }

  if (
    conditionKey === "snow"
  ) {
    return {
      icon: Cloud,
      title: "Cold Weather Advisory",
      text:
        "Cold conditions are expected. Protect sensitive crops and livestock from low temperatures and keep necessary shelter arrangements ready.",
      iconCls: "text-sky-700",
      badge: "Cold",
      badgeCls:
        "text-sky-700 bg-sky-100",
    };
  }

  if (
    conditionKey === "fog"
  ) {
    return {
      icon: Cloud,
      title: "Low Visibility Advisory",
      text:
        "Visibility may be reduced. Take extra care while travelling and avoid unnecessary outdoor work during dense fog.",
      iconCls: "text-gray-700",
      badge: "Low Visibility",
      badgeCls:
        "text-gray-700 bg-gray-100",
    };
  }

  if (temp >= 35) {
    return {
      icon: Flame,
      title: "Heat Advisory",
      text:
        "High temperature expected. Prefer early morning or evening field work and keep livestock in shade with sufficient water.",
      iconCls: "text-orange-700",
      badge: "Hot",
      badgeCls:
        "text-orange-700 bg-orange-100",
    };
  }

  if (wind >= 10) {
    return {
      icon: Wind,
      title: "Wind Advisory",
      text:
        "Strong winds are possible. Secure loose farm materials and avoid pesticide spraying during strong winds.",
      iconCls: "text-sky-700",
      badge: "Windy",
      badgeCls:
        "text-sky-700 bg-sky-100",
    };
  }

  if (conditionKey === "sunny") {
    return {
      icon: Sun,
      title: "Sunny Advisory",
      text:
        "Good visibility and dry conditions. Field work is generally suitable, but avoid prolonged work during peak afternoon heat.",
      iconCls: "text-amber-700",
      badge: "Favorable",
      badgeCls:
        "text-amber-700 bg-amber-100",
    };
  }

  if (
    conditionKey === "cloudy" ||
    conditionKey === "partly-cloudy"
  ) {
    return {
      icon: Cloud,
      title: "Cloudy Advisory",
      text:
        "Cloudy conditions are expected. Keep an eye on sudden showers before irrigation, spraying or outdoor drying.",
      iconCls: "text-slate-700",
      badge: "Moderate",
      badgeCls:
        "text-slate-700 bg-slate-100",
    };
  }

  return {
    icon: Leaf,
    title: "Today's Advisory",
    text:
      "Weather conditions look relatively comfortable. Plan field activities according to crop requirements and keep checking for weather changes.",
    iconCls: "text-green-700",
    badge: "Favorable",
    badgeCls:
      "text-green-700 bg-green-100",
  };
};

/* =========================================================
   TIME HELPERS
========================================================= */

const formatWeatherTime = (
  timestamp,
  timezoneOffset = 0
) => {
  if (!timestamp) return "--";

  const localMs =
    Number(timestamp) * 1000 +
    Number(timezoneOffset) * 1000;

  return new Date(localMs).toLocaleTimeString(
    "en-IN",
    {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
};

const getDateKey = (
  timestamp,
  timezoneOffset = 0
) => {
  const localMs =
    Number(timestamp) * 1000 +
    Number(timezoneOffset) * 1000;

  return new Date(localMs)
    .toISOString()
    .slice(0, 10);
};

const formatForecastDate = (
  timestamp,
  timezoneOffset = 0,
  options = {}
) => {
  if (!timestamp) return "--";

  const localMs =
    Number(timestamp) * 1000 +
    Number(timezoneOffset) * 1000;

  return new Date(localMs).toLocaleDateString(
    "en-IN",
    {
      ...options,
      timeZone: "UTC",
    }
  );
};

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}) {
  return (
    <div className="bg-white/90 rounded-xl p-3 flex items-center gap-3 shadow-sm">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon
          className={`h-[18px] w-[18px] ${iconColor}`}
        />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-gray-500 font-medium leading-none mb-1">
          {label}
        </p>

        <p className="text-sm font-bold text-gray-800 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Weather() {
  const [weather, setWeather] =
    useState(null);

  const [forecast, setForecast] =
    useState([]);

  const [aqi, setAqi] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [displayLocation, setDisplayLocation] =
    useState("");

  const [displaySubLocation, setDisplaySubLocation] =
    useState("");

  const [locationType, setLocationType] =
    useState("profile");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [showForecast, setShowForecast] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState("");

  const [now, setNow] =
    useState(new Date());

  /* =======================================================
     CLOCK
  ======================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  /* =======================================================
     PROFILE
  ======================================================= */

  const fetchProfile = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Please login again."
      );
    }

    const response = await axios.get(
      `${API_BASE_URL}/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const user =
      response.data?.data ||
      response.data?.user ||
      response.data;

    setProfile(user);

    return user;
  };

  /* =======================================================
     PROFILE LOCATION NAME
  ======================================================= */

  const getProfileWeatherName = (
    user
  ) => {
    return (
      user?.village ||
      user?.panchayat ||
      user?.subDistrict ||
      user?.district ||
      user?.state ||
      "Your Location"
    );
  };

  const getProfileSubLocation = (
    user
  ) => {
    const parts = [];

    if (user?.district) {
      parts.push(user.district);
    }

    if (
      user?.state &&
      user.state !== user.district
    ) {
      parts.push(user.state);
    }

    return parts.join(", ");
  };

  /* =======================================================
     PROFILE GEOCODING
  ======================================================= */

  const geocodeProfileLocation = async (
    user
  ) => {
    const queries = [];

    const village = user?.village;
    const panchayat = user?.panchayat;
    const subDistrict =
      user?.subDistrict;
    const district = user?.district;
    const state = user?.state;
    const pincode = user?.pincode;

    if (
      village &&
      district &&
      state
    ) {
      queries.push(
        `${village}, ${district}, ${state}, India`
      );
    }

    if (
      village &&
      state
    ) {
      queries.push(
        `${village}, ${state}, India`
      );
    }

    if (pincode) {
      queries.push(
        `${pincode}, India`
      );
    }

    if (
      panchayat &&
      district &&
      state
    ) {
      queries.push(
        `${panchayat}, ${district}, ${state}, India`
      );
    }

    if (
      subDistrict &&
      district &&
      state
    ) {
      queries.push(
        `${subDistrict}, ${district}, ${state}, India`
      );
    }

    if (
      district &&
      state
    ) {
      queries.push(
        `${district}, ${state}, India`
      );
    }

    for (const query of queries) {
      try {
        const response =
          await axios.get(
            `${OPENWEATHER_BASE_URL}/geo/1.0/direct`,
            {
              params: {
                q: query,
                limit: 5,
                appid: API_KEY,
              },
            }
          );

        const results =
          response.data || [];

        if (
          results.length > 0
        ) {
          const normalizedVillage =
            String(
              village || ""
            ).toLowerCase();

          const normalizedPanchayat =
            String(
              panchayat || ""
            ).toLowerCase();

          const exactVillage =
            results.find(
              (item) =>
                String(
                  item.name || ""
                ).toLowerCase() ===
                normalizedVillage
            );

          const exactPanchayat =
            results.find(
              (item) =>
                String(
                  item.name || ""
                ).toLowerCase() ===
                normalizedPanchayat
            );

          return (
            exactVillage ||
            exactPanchayat ||
            results[0]
          );
        }
      } catch (error) {
        console.log(
          "Profile geocoding failed:",
          query,
          error
        );
      }
    }

    throw new Error(
      "Unable to find weather location."
    );
  };

  /* =======================================================
     SEARCH GEOCODING
  ======================================================= */

  const geocodeSearchLocation = async (
    searchText
  ) => {
    const cleanSearch =
      searchText.trim();

    if (!cleanSearch) {
      throw new Error(
        "Please enter a location."
      );
    }

    const queries = [
      `${cleanSearch}, Garhwa, Jharkhand, India`,
      `${cleanSearch}, Jharkhand, India`,
      `${cleanSearch}, India`,
    ];

    for (const query of queries) {
      try {
        const response =
          await axios.get(
            `${OPENWEATHER_BASE_URL}/geo/1.0/direct`,
            {
              params: {
                q: query,
                limit: 5,
                appid: API_KEY,
              },
            }
          );

        const results =
          response.data || [];

        if (!results.length) {
          continue;
        }

        const normalized =
          cleanSearch.toLowerCase();

        const exactName =
          results.find(
            (item) =>
              String(
                item.name || ""
              ).toLowerCase() ===
              normalized
          );

        if (exactName) {
          return {
            ...exactName,
            displayName: cleanSearch,
            subLocation: [
              exactName.state,
              exactName.country !==
                "India"
                ? exactName.country
                : null,
            ]
              .filter(Boolean)
              .join(", "),
          };
        }

        const localNameMatch =
          results.find(
            (item) => {
              const names =
                item.local_names ||
                {};

              return Object.values(
                names
              ).some(
                (name) =>
                  String(
                    name
                  ).toLowerCase() ===
                  normalized
              );
            }
          );

        if (localNameMatch) {
          return {
            ...localNameMatch,
            displayName: cleanSearch,
            subLocation: [
              localNameMatch.state,
              localNameMatch.country !==
                "India"
                ? localNameMatch.country
                : null,
            ]
              .filter(Boolean)
              .join(", "),
          };
        }

        return {
          ...results[0],
          displayName: cleanSearch,
          subLocation: [
            results[0].state,
            results[0].country !==
              "India"
              ? results[0].country
              : null,
          ]
            .filter(Boolean)
            .join(", "),
        };
      } catch (error) {
        console.log(
          "Search geocoding failed:",
          query,
          error
        );
      }
    }

    throw new Error(
      `"${cleanSearch}" location not found.`
    );
  };

  /* =======================================================
     WEATHER + AQI + FORECAST
  ======================================================= */

  const fetchWeatherData = async (
    lat,
    lon
  ) => {
    if (!API_KEY) {
      throw new Error(
        "Weather API key is missing."
      );
    }

    /* CURRENT WEATHER */

    const weatherResponse =
      await axios.get(
        `${OPENWEATHER_BASE_URL}/data/2.5/weather`,
        {
          params: {
            lat,
            lon,
            appid: API_KEY,
            units: "metric",
          },
        }
      );

    setWeather(
      weatherResponse.data
    );

    /* AQI */

    try {
      const aqiResponse =
        await axios.get(
          `${OPENWEATHER_BASE_URL}/data/2.5/air_pollution`,
          {
            params: {
              lat,
              lon,
              appid: API_KEY,
            },
          }
        );

      setAqi(
        aqiResponse.data?.list?.[0]
          ?.main?.aqi ?? null
      );
    } catch (error) {
      console.log(
        "AQI unavailable:",
        error
      );

      setAqi(null);
    }

    /* FORECAST */

    try {
      const forecastResponse =
        await axios.get(
          `${OPENWEATHER_BASE_URL}/data/2.5/forecast`,
          {
            params: {
              lat,
              lon,
              appid: API_KEY,
              units: "metric",
            },
          }
        );

      const list =
        forecastResponse.data?.list ||
        [];

      const timezoneOffset =
        forecastResponse.data?.city
          ?.timezone || 0;

      const grouped = {};

      list.forEach((item) => {
        const key = getDateKey(
          item.dt,
          timezoneOffset
        );

        if (!grouped[key]) {
          grouped[key] = [];
        }

        grouped[key].push(item);
      });

      const daily = Object.entries(
        grouped
      )
        .slice(0, 5)
        .map(
          ([date, items]) => {
            const temps =
              items
                .map((item) =>
                  Number(
                    item.main?.temp ??
                      0
                  )
                )
                .filter(
                  (value) =>
                    !Number.isNaN(
                      value
                    )
                );

            const rainProbabilities =
              items.map((item) =>
                Number(
                  item.pop || 0
                )
              );

            const midday =
              items.find(
                (item) =>
                  item.dt_txt?.includes(
                    "12:00:00"
                  )
              ) ||
              items[
                Math.floor(
                  items.length / 2
                )
              ];

            return {
              date,
              dt:
                midday?.dt ||
                items[0]?.dt,

              temp_max:
                temps.length
                  ? Math.max(...temps)
                  : 0,

              temp_min:
                temps.length
                  ? Math.min(...temps)
                  : 0,

              pop:
                rainProbabilities.length
                  ? Math.max(
                      ...rainProbabilities
                    )
                  : 0,

              weather:
                midday?.weather?.[0] ||
                items[0]?.weather?.[0],

              humidity: Math.round(
                items.reduce(
                  (sum, item) =>
                    sum +
                    Number(
                      item.main
                        ?.humidity ||
                        0
                    ),
                  0
                ) / items.length
              ),
            };
          }
        );

      setForecast(daily);
    } catch (error) {
      console.log(
        "Forecast unavailable:",
        error
      );

      setForecast([]);
    }

    setLastUpdated(
      new Date().toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      )
    );
  };

  /* =======================================================
     LOAD PROFILE WEATHER
  ======================================================= */

  const loadProfileWeather = async (
    showRefresh = false
  ) => {
    try {
      setErrorMessage("");

      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const user =
        profile ||
        (await fetchProfile());

      const location =
        await geocodeProfileLocation(
          user
        );

      await fetchWeatherData(
        location.lat,
        location.lon
      );

      setDisplayLocation(
        getProfileWeatherName(user)
      );

      setDisplaySubLocation(
        getProfileSubLocation(user)
      );

      setLocationType("profile");
    } catch (error) {
      console.error(
        "Profile weather error:",
        error
      );

      setErrorMessage(
        error.response?.data
          ?.message ||
          error.message ||
          "Unable to load weather."
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadProfileWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     SEARCH WEATHER
  ======================================================= */

  const fetchWeatherByCity =
    async () => {
      if (!search.trim()) {
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const searchedName =
          search.trim();

        const location =
          await geocodeSearchLocation(
            searchedName
          );

        await fetchWeatherData(
          location.lat,
          location.lon
        );

        setDisplayLocation(
          location.displayName ||
            searchedName
        );

        setDisplaySubLocation(
          location.subLocation || ""
        );

        setLocationType("search");

        setSearch("");
      } catch (error) {
        console.error(
          "Search weather error:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to find this location."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage("");

      if (
        locationType === "profile"
      ) {
        const user =
          profile ||
          (await fetchProfile());

        const location =
          await geocodeProfileLocation(
            user
          );

        await fetchWeatherData(
          location.lat,
          location.lon
        );

        setDisplayLocation(
          getProfileWeatherName(user)
        );

        setDisplaySubLocation(
          getProfileSubLocation(user)
        );
      } else if (
        weather?.coord
      ) {
        await fetchWeatherData(
          weather.coord.lat,
          weather.coord.lon
        );
      } else {
        await loadProfileWeather();
      }
    } catch (error) {
      console.error(
        "Refresh weather error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to refresh weather."
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  /* =======================================================
     MY VILLAGE
  ======================================================= */

  const handleMyVillage = () => {
    loadProfileWeather(true);
  };

  /* =======================================================
     DISPLAY DATA
  ======================================================= */

  const conditionText =
    weather?.weather?.[0]
      ?.description || "";

  const wKey =
    getWeatherKey(conditionText);

  const WeatherIcon =
    getWeatherIcon(conditionText);

  const weatherDescription =
    conditionText
      ? conditionText.replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        )
      : "Weather";

  const advisory =
    getAdvisory(
      weather,
      wKey
    );

  const AdvIcon =
    advisory.icon;

  const aqiInfo =
    getAQIInfo(aqi);

  /* =======================================================
     WEATHER TIME
  ======================================================= */

  const weatherTimezone =
    weather?.timezone || 0;

  const getCurrentWeatherTime =
    () => {
      const localMs =
        Date.now() +
        Number(
          weatherTimezone
        ) *
          1000;

      return new Date(
        localMs
      ).toLocaleTimeString(
        "en-IN",
        {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );
    };

  const getCurrentWeatherDate =
    () => {
      const localMs =
        Date.now() +
        Number(
          weatherTimezone
        ) *
          1000;

      return new Date(
        localMs
      ).toLocaleDateString(
        "en-IN",
        {
          timeZone: "UTC",
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    };

  const timeStr =
    weather
      ? getCurrentWeatherTime()
      : now.toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        );

  const dateStr =
    weather
      ? getCurrentWeatherDate()
      : now.toLocaleDateString(
          "en-IN",
          {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        );

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    !weather
  ) {
    return (
      <div className="w-full min-h-[420px] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <RefreshCw className="h-7 w-7 text-green-600 animate-spin" />
          </div>

          <h3 className="text-xl font-bold text-gray-800">
            Loading Weather
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            Finding weather for your location...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    errorMessage &&
    !weather
  ) {
    return (
      <div className="w-full px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-red-100 p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <CloudRain className="h-7 w-7 text-red-500" />
          </div>

          <h3 className="text-xl font-bold text-gray-800">
            Weather Unavailable
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            {errorMessage}
          </p>

          <button
            onClick={
              handleMyVillage
            }
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="w-full">
      <style>{`
        @keyframes rainDrop {
          0% {
            transform: translateY(-30px) skewX(-10deg);
            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          90% {
            opacity: 1;
          }

          100% {
            transform: translateY(320px) skewX(-10deg);
            opacity: 0;
          }
        }
      `}</style>

      <div
        className="rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background:
            "linear-gradient(155deg, #0b2418 0%, #0f3322 40%, #1a5235 80%, #1e6040 100%)",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* LOCATION */}

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <MapPin
                className="text-white"
                style={{
                  width: 18,
                  height: 18,
                }}
              />
            </div>

            <div>
              <p className="text-white/55 text-[10px] font-bold uppercase tracking-widest leading-none">
                Weather for
              </p>

              <p className="text-white text-[18px] font-bold leading-snug">
                {displayLocation ||
                  weather?.name ||
                  "Your Location"}
              </p>

              {displaySubLocation && (
                <p className="text-white/50 text-[11px] leading-none">
                  {displaySubLocation}
                </p>
              )}
            </div>
          </div>

          {/* SEARCH */}

          <div className="flex-1 flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    fetchWeatherByCity();
                  }
                }}
                placeholder="Search another city or village..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/95 border border-white/30 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
            </div>

            <button
              onClick={
                fetchWeatherByCity
              }
              disabled={
                !search.trim() ||
                loading
              }
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>

            {locationType ===
              "search" && (
              <button
                onClick={
                  handleMyVillage
                }
                disabled={loading}
                className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                <LocateFixed className="h-4 w-4" />
                <span className="hidden lg:inline">
                  My Village
                </span>
              </button>
            )}
          </div>

          {/* TIME */}

          <div className="text-right shrink-0 hidden sm:flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-white/50" />

            <div>
              <p className="text-white text-2xl font-bold leading-none">
                {timeStr}
              </p>

              <p className="text-white/55 text-xs mt-0.5">
                {dateStr}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="px-4 pb-0 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* CURRENT WEATHER */}

          <div
            className="relative rounded-2xl overflow-hidden min-h-52"
            style={{
              backgroundImage: `url("${BG_MAP[wKey]}")`,
              backgroundSize: "cover",
              backgroundPosition:
                "center",
            }}
          >
            {/* OVERLAY */}

            <div
              className="absolute inset-0"
              style={{
                background:
                  OVERLAY_MAP[wKey],
              }}
            />

            {/* RAIN EFFECT */}

            {(wKey === "rain" ||
              wKey ===
                "thunderstorm") && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  opacity: 0.22,
                }}
              >
                {[...Array(18)].map(
                  (_, i) => (
                    <div
                      key={i}
                      className="absolute bg-white rounded-full"
                      style={{
                        width: "1px",
                        height: `${
                          16 +
                          (i % 4) *
                            8
                        }px`,
                        left: `${
                          (i * 5.7) %
                          100
                        }%`,
                        top: 0,
                        animation: `rainDrop ${
                          0.8 +
                          (i % 3) *
                            0.2
                        }s linear ${
                          i * 0.1
                        }s infinite`,
                      }}
                    />
                  )
                )}
              </div>
            )}

            <div
              className="relative p-5"
              style={{
                textShadow:
                  "0 1px 6px rgba(0,0,0,0.8)",
              }}
            >
              <p className="text-white font-bold text-base">
                Current Weather
              </p>

              <p className="text-white/65 text-xs mt-0.5">
                Live weather conditions at your location
              </p>

              <div className="flex items-center gap-4 mt-4">
                {/* WEATHER ICON */}

                <div className="shrink-0 drop-shadow-lg w-[72px] h-[72px] flex items-center justify-center">
                  <WeatherIcon
                    className="text-white"
                    style={{
                      width: 68,
                      height: 68,
                    }}
                    strokeWidth={1.5}
                  />
                </div>

                <div>
                  <p className="text-white text-5xl font-bold leading-none">
                    {Math.round(
                      Number(
                        weather?.main
                          ?.temp || 0
                      )
                    )}
                    °C
                  </p>

                  <p className="text-white text-lg font-semibold mt-1">
                    {weatherDescription}
                  </p>

                  <p className="text-white/70 text-sm">
                    Feels like{" "}
                    {Math.round(
                      Number(
                        weather?.main
                          ?.feels_like ||
                          0
                      )
                    )}
                    °C
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm font-semibold text-white/85">
                <span className="flex items-center gap-1.5">
                  <ArrowUp className="h-3.5 w-3.5 text-red-300" />

                  <span>
                    {Math.round(
                      Number(
                        weather?.main
                          ?.temp_max ||
                          0
                      )
                    )}
                    °
                  </span>

                  <span className="text-white/40 font-normal text-xs">
                    Max
                  </span>
                </span>

                <span className="text-white/25">
                  |
                </span>

                <span className="flex items-center gap-1.5">
                  <ArrowDown className="h-3.5 w-3.5 text-blue-300" />

                  <span>
                    {Math.round(
                      Number(
                        weather?.main
                          ?.temp_min ||
                          0
                      )
                    )}
                    °
                  </span>

                  <span className="text-white/40 font-normal text-xs">
                    Min
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* TODAY'S DETAILS */}

          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "rgba(255,255,255,0.10)",
              backdropFilter:
                "blur(10px)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-bold text-base">
                  Today's Details
                </p>

                <p className="text-white/55 text-xs mt-0.5">
                  More information about current weather
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md">
                <Leaf className="h-3.5 w-3.5" />

                <div className="leading-tight">
                  <div>
                    Air Quality
                  </div>

                  <div className="font-normal">
                    {aqiInfo.label}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MetricCard
                icon={Droplets}
                label="Humidity"
                value={`${weather?.main?.humidity ?? 0}%`}
                iconBg="bg-blue-100"
                iconColor="text-blue-500"
              />

              <MetricCard
                icon={Cloud}
                label="Cloud Cover"
                value={`${weather?.clouds?.all ?? 0}%`}
                iconBg="bg-slate-100"
                iconColor="text-slate-500"
              />

              <MetricCard
                icon={Wind}
                label="Wind"
                value={`${(
                  Number(
                    weather?.wind
                      ?.speed || 0
                  ) * 3.6
                ).toFixed(1)} km/h`}
                iconBg="bg-cyan-100"
                iconColor="text-cyan-600"
              />

              <MetricCard
                icon={Navigation}
                label="Direction"
                value={`${weather?.wind?.deg ?? 0}°`}
                iconBg="bg-yellow-100"
                iconColor="text-yellow-600"
              />

              <MetricCard
                icon={Gauge}
                label="Pressure"
                value={`${weather?.main?.pressure ?? "--"} hPa`}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
              />

              <MetricCard
                icon={Eye}
                label="Visibility"
                value={
                  weather?.visibility
                    ? `${(
                        Number(
                          weather.visibility
                        ) / 1000
                      ).toFixed(
                        1
                      )} km`
                    : "--"
                }
                iconBg="bg-pink-100"
                iconColor="text-pink-600"
              />
            </div>
          </div>
        </div>

        {/* =================================================
            BOTTOM INFO BAR
        ================================================= */}

        <div
          className="mx-4 mt-3 grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden"
          style={{
            background:
              "rgba(0,0,0,0.32)",
          }}
        >
          {[
            {
              icon: Sunrise,
              label: "Sunrise",
              value:
                formatWeatherTime(
                  weather?.sys
                    ?.sunrise,
                  weatherTimezone
                ),
              color:
                "text-yellow-400",
            },

            {
              icon: Sunset,
              label: "Sunset",
              value:
                formatWeatherTime(
                  weather?.sys
                    ?.sunset,
                  weatherTimezone
                ),
              color:
                "text-orange-400",
            },

            {
              icon: Leaf,
              label: "Air Quality",
              value:
                aqiInfo.label,
              color:
                "text-green-400",
            },

            {
              icon: Clock,
              label: "Last Updated",
              value:
                lastUpdated ||
                "--",
              color:
                "text-blue-300",
            },
          ].map(
            (
              {
                icon: Icon,
                label,
                value,
                color,
              },
              i
            ) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-5 py-3.5 ${
                  i < 3
                    ? "border-r border-white/10"
                    : ""
                }`}
              >
                <Icon
                  className={`h-6 w-6 shrink-0 ${color}`}
                />

                <div>
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wide">
                    {label}
                  </p>

                  <p className="text-white text-sm font-bold">
                    {value}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {/* =================================================
            ALERT
        ================================================= */}

        <div className="mx-4 mt-3 bg-white rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <AdvIcon
              className={`h-5 w-5 ${advisory.iconCls}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-bold text-gray-900 text-sm">
                {advisory.title}
              </p>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${advisory.badgeCls}`}
              >
                {advisory.badge}
              </span>
            </div>

            <p className="text-gray-500 text-xs leading-relaxed">
              {advisory.text}
            </p>
          </div>
        </div>

        {/* ERROR AFTER WEATHER */}

        {errorMessage &&
          weather && (
            <div className="mx-4 mt-3 rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs">
              {errorMessage}
            </div>
          )}

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={
              handleRefresh
            }
            disabled={
              isRefreshing
            }
            className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            {isRefreshing
              ? "Refreshing..."
              : "Refresh Weather"}
          </button>

          <button
            onClick={() =>
              setShowForecast(
                !showForecast
              )
            }
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
          >
            <CalendarDays className="h-4 w-4" />

            {showForecast
              ? "Hide 5-Day Forecast"
              : "View 5-Day Forecast"}

            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showForecast
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>
        </div>

        {/* =================================================
            5-DAY FORECAST
        ================================================= */}

        {showForecast && (
          <div className="mx-4 mb-4 bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10">
              <p className="text-white font-bold text-sm">
                5-Day Forecast
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5">
              {forecast.map(
                (day, i) => {
                  const dayDescription =
                    day.weather
                      ?.description ||
                    "Weather";

                  const dayKey =
                    getWeatherKey(
                      dayDescription
                    );

                  const DayIcon =
                    getWeatherIcon(
                      dayDescription
                    );

                  const dayName =
                    i === 0
                      ? "Today"
                      : formatForecastDate(
                          day.dt,
                          weatherTimezone,
                          {
                            weekday:
                              "short",
                          }
                        );

                  const dateText =
                    formatForecastDate(
                      day.dt,
                      weatherTimezone,
                      {
                        day: "numeric",
                        month: "short",
                      }
                    );

                  return (
                    <div
                      key={day.date}
                      className={`flex flex-col items-center py-4 px-2 gap-1.5 ${
                        i <
                        Math.min(
                          forecast.length,
                          5
                        ) -
                          1
                          ? "border-r border-white/10"
                          : ""
                      }`}
                    >
                      <p className="text-white/60 text-xs font-bold">
                        {dayName}
                      </p>

                      <p className="text-white/40 text-[10px]">
                        {dateText}
                      </p>

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                          dayKey ===
                          "thunderstorm"
                            ? "bg-purple-600"
                            : dayKey ===
                              "rain"
                            ? "bg-blue-600"
                            : dayKey ===
                              "cloudy"
                            ? "bg-slate-500"
                            : dayKey ===
                              "fog"
                            ? "bg-gray-500"
                            : dayKey ===
                              "snow"
                            ? "bg-sky-500"
                            : "bg-green-600"
                        }`}
                      >
                        <DayIcon
                          className="h-5 w-5 text-white"
                        />
                      </div>

                      <p className="text-white text-xs text-center capitalize truncate max-w-full">
                        {dayDescription}
                      </p>

                      <div className="flex gap-1 text-xs font-semibold">
                        <span className="text-red-300">
                          {Math.round(
                            Number(
                              day.temp_max ||
                                0
                            )
                          )}
                          °
                        </span>

                        <span className="text-white/30">
                          /
                        </span>

                        <span className="text-blue-300">
                          {Math.round(
                            Number(
                              day.temp_min ||
                                0
                            )
                          )}
                          °
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-blue-200" />

                        <span className="text-white/70 text-[10px] font-semibold">
                          {Math.round(
                            Number(
                              day.pop ||
                                0
                            ) * 100
                          )}
                          % rain
                        </span>
                      </div>

                      <p className="text-white/45 text-[10px]">
                        Humidity{" "}
                        {day.humidity ??
                          0}
                        %
                      </p>
                    </div>
                  );
                }
              )}

              {forecast.length ===
                0 && (
                <div className="col-span-full py-6 text-center">
                  <p className="text-white/60 text-sm">
                    Forecast data is currently unavailable.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}