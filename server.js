'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const weatherData = require('./data/weather.json');

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

app.get('/weather', (req, res) => {
  const { lat, lon, searchQuery } = req.query;

 
  if (lat && lon) {
    const cityWeather = weatherData.find(
      (city) => city.lat === lat && city.lon === lon
    );

    if (cityWeather) {
      res.json(cityWeather.data.map((day) => new Forecast(day.datetime, day.weather.description)));
    } else {
      res.status(404).json({ error: 'Weather data not found for the provided coordinates' });
    }
  }

  
  else if (searchQuery) {
    const cityName = searchQuery.toLowerCase();
    const cityWeather = weatherData.find(
      (city) => city.city_name.toLowerCase() === cityName
    );

    if (cityWeather) {
      res.json(cityWeather.data.map((day) => new Forecast(day.datetime, day.weather.description)));
    } else {
      res.status(404).json({ error: 'Weather data not found for the provided city' });
    }
  }

  
  else {
    res.json(weatherData);
  }
});
