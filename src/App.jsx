import { Oval } from 'react-loader-spinner';
import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    forecast: [],
    error: false,
  });
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const toDateFunction = () => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août',
      'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const WeekDays = [
      'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    ];
    const currentDate = new Date();
    const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    return date;
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setInput('');
      setWeather({ ...weather, loading: true });

      const currentWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
      const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
      const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

      try {
        const weatherResponse = await axios.get(currentWeatherUrl, {
          params: {
            q: input,
            units: 'metric',
            appid: api_key,
          },
        });

        const forecastResponse = await axios.get(forecastUrl, {
          params: {
            q: input,
            units: 'metric',
            appid: api_key,
          },
        });

        const filteredForecast = forecastResponse.data.list.filter((item) =>
          item.dt_txt.includes('12:00:00')
        ).slice(0, 5);

        setWeather({
          data: weatherResponse.data,
          forecast: filteredForecast,
          loading: false,
          error: false,
        });
      } catch (error) {
        setWeather({ ...weather, data: {}, forecast: [], error: true });
        setInput('');
      }
    }
  };

  const saveToFavorites = () => {
    if (weather.data.name) {
      if (!favorites.includes(weather.data.name)) {
        const updatedFavorites = [...favorites, weather.data.name];
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      }
    }
  };

  const searchFavoriteCity = async (city) => {
    setInput(city);
    await search({ key: 'Enter' });
  };

  const removeFromFavorites = (city) => {
    const updatedFavorites = favorites.filter(fav => fav !== city);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div className="App">
      <h1 className="app-name">Application Météo</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          name="query"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search}
        />
      </div>

      {weather.loading && (
        <Oval type="Oval" color="black" height={100} width={100} />
      )}
      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}

      {weather && weather.data.weather && weather.data.main && (
        <div>
          <h2>
            {weather.data.name}, {weather.data.sys.country}
          </h2>
          <span>{toDateFunction()}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
            alt={weather.data.weather[0].description}
          />
          <p>{Math.round(weather.data.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>


          <button onClick={saveToFavorites}>Sauvegarder cette ville</button>
        </div>
      )}

      {weather.forecast.length > 0 && (
        <div className="forecast-container">
          <h3>Prévisions sur 5 jours</h3>
          <div className="forecast-grid">
            {weather.forecast.map((item, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(item.dt_txt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt={item.weather[0].description}
                />
                <p>{Math.round(item.main.temp)}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="favorites-container">
          <h3>Villes Favourites</h3>
          <ul>
            {favorites.map((city, index) => (
              <li key={index}>
                <span onClick={() => searchFavoriteCity(city)}>{city}</span>
                <button onClick={() => removeFromFavorites(city)}>Supprimer</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
