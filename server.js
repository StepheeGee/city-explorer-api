'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const weatherData = require('./data/weather.json');

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

app.get('/weather', (req, res) => {
  try {
    const { lat, lon, searchQuery } = req.query;

    let cityWeather;

    if (lat && lon) {
      cityWeather = weatherData.find(
        (city) => city.lat === lat && city.lon === lon
      );
    } else if (searchQuery) {
      const cityName = searchQuery.toLowerCase();
      cityWeather = weatherData.find(
        (city) => city.name.toLowerCase() === cityName
      );
    } else {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    if (!cityWeather) {
      return res.status(404).json({ error: 'Weather data not found' });
    }

    const forecasts = cityWeather.data.map(
      (day) => new Forecast(day.datetime, day.weather.description)
    );

    res.json(forecasts);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
