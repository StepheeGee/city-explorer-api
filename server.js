'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const weatherData = require('./data/weather.json');




class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

app.get('/weather', async (req, res) => {
  const { lat, lon, searchQuery } = req.query;


  if ((lat && lon) || searchQuery) {
    try {
      let weatherResponse;
      let apiWeatherUrl;

      if (lat && lon) {
        apiWeatherUrl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`;
      } else {
        apiWeatherUrl = `https://api.weatherbit.io/v2.0/forecast/daily?city=${searchQuery}&key=${WEATHER_API_KEY}`;
      }

      weatherResponse = await axios.get(apiWeatherUrl);

      if (weatherResponse && weatherResponse.data && weatherResponse.data.data) {
        const forecasts = weatherResponse.data.data.map((day) => {
          const description = `Low of ${day.low_temp}, high of ${day.high_temp} with ${day.weather.description}`;
          return { date: day.datetime, description: description };
        });

        res.json(forecasts);
      } else {
        res.status(404).json({ error: `We can't find your weather report. Prepare for the worst.` });
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  } else {
    res.json(weatherData);
  }
});