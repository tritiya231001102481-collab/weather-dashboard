
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("Kolkata");
  const [search, setSearch] = useState("Kolkata");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Convert Unix timestamp into local city time
  const formatTime = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);

    return date.toLocaleTimeString("en-US", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      if (!search.trim()) {
        setError("Please enter a city name.");
        setWeather(null);
        return;
      }

      if (!API_KEY) {
        setError("API key is missing. Please configure your .env file.");
        setWeather(null);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setWeather(null);

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(search)}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("City not found. Please enter a valid city.");
          }

          if (response.status === 401) {
            throw new Error("Invalid API key. Please check your API key.");
          }

          throw new Error("Unable to fetch weather data.");
        }

        const data = await response.json();

        setWeather(data);
        setCity(data.name);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [search, API_KEY]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setSearch(city.trim());
  };

  return (
    <div className="app">
      <div className="weather-container">

        <h1>🌤 Weather Dashboard</h1>
        <p className="subtitle">
          Check the current weather of any city
        </p>

        {/* Search Section */}
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <button type="submit">Search</button>
        </form>

        {/* Loading Spinner */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading weather data...</p>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="error">
            ⚠️ {error}
          </div>
        )}

        {/* Weather Information */}
        {weather && !loading && !error && (
          <div className="weather-info">

            <h2>
              {weather.name}, {weather.sys.country}
            </h2>

            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="weather-icon"
            />

            <h1 className="temperature">
              {Math.round(weather.main.temp)}°C
            </h1>

            <p className="description">
              {weather.weather[0].description}
            </p>

            <div className="weather-grid">

              <div className="weather-card">
                <h3>💧 Humidity</h3>
                <p>{weather.main.humidity}%</p>
              </div>

              <div className="weather-card">
                <h3>💨 Wind Speed</h3>
                <p>{weather.wind.speed} m/s</p>
              </div>

              <div className="weather-card">
                <h3>🌅 Sunrise</h3>
                <p>
                  {formatTime(
                    weather.sys.sunrise,
                    weather.timezone
                  )}
                </p>
              </div>

              <div className="weather-card">
                <h3>🌇 Sunset</h3>
                <p>
                  {formatTime(
                    weather.sys.sunset,
                    weather.timezone
                  )}
                </p>
              </div>

            </div>
          </div>
        )}

        <footer>
          Powered by OpenWeatherMap API
        </footer>

      </div>
    </div>
  );
}

export default App;
