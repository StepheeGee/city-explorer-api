'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const weatherData = require('./weather.json');

const cities = [
  { name: 'Seattle', lat: '47.6062', lon: '-122.3321' },
  { name: 'Paris', lat: '48.8566', lon: '2.3522' },
  { name: 'Amman', lat: '31.9454', lon: '35.9284' },
];

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

function processCityWeather(cityName) {
  const cityWeather = weatherData.find((city) => city.city_name === cityName);

  if (!cityWeather) {
    return [];
  }

  const cityForecasts = cityWeather.data.map((day) => {
    return new Forecast(day.datetime, day.weather.description);
  });

  return cityForecasts;
}


app.get('/weather', (req, res) => {
  const { lat, lon, searchQuery } = req.query;

  if (lat && lon && searchQuery) {
    const foundCity = cities.find(
      (city) =>
        city.lat === lat &&
        city.lon === lon &&
        city.name.toLowerCase() === searchQuery.toLowerCase()
    );

    if (foundCity) {
      const cityName = foundCity.name;
      const cityWeather = weatherData.find(
        (city) => city.city_name.toLowerCase() === cityName.toLowerCase()
      );

      if (cityWeather) {
        res.json(cityWeather.data.map((day) => new Forecast(day.datetime, day.weather.description)));
      } else {
        res.status(404).json({ error: 'Weather data not found for the city' });
      }
    } else {
      res.status(404).json({ error: 'City not found' });
    }
  } else {
    res.json(weatherData);
  }
});
