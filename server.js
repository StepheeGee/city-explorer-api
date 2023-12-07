'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

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
        const forecasts = weatherResponse.data.data.map(day => {
          const forecastDate = new Date(day.datetime);
          const lowTempFahrenheit = (day.low_temp * 9) / 5 + 32; 
          const highTempFahrenheit = (day.high_temp * 9) / 5 + 32; 

          return {
            description: `Low of ${lowTempFahrenheit.toFixed(1)}°F, high of ${highTempFahrenheit.toFixed(1)}°F with ${day.weather.description}`,
            date: day.datetime,
            dayOfWeek: forecastDate.toLocaleString('en-us', { weekday: 'long' }),
          };
        });
        res.json(forecasts);
      } else {
        res.status(404).json({ error: `We can't find your weather forecast. Prepare for the worst.` });
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  } else {
    res.status(400).json({ error: 'Invalid request. Please provide valid latitude and longitude or a search query.' });
  }
});

class MovieFetcher {
  static async fetchMoviesByCity(city) {
    try {
      const movieURL = "https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1";

      if (!city) {
        throw new Error('Please provide a valid city');
      }

      const movieResponse = await axios.get(movieURL, {
        params: { query: `${city}` },
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${MOVIE_API_KEY}`,
        },
      });

      if (movieResponse && movieResponse.data && movieResponse.data.results) {
        const movies = movieResponse.data.results.slice(0, 20).map(movie => ({
          title: movie.title,
          overview: movie.overview,
          average_votes: movie.vote_average,
          total_votes: movie.vote_count,
          image_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          popularity: movie.popularity,
          released_on: movie.release_date,
        }));
        return movies;
      } else {
        throw new Error(`No movies found for '${city}'`);
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
      throw new Error('Failed to fetch movie data');
    }
  }
}

// Usage:
app.get('/movies', async (request, response) => {
  try {
    const city = request.query.city;
    const movies = await MovieFetcher.fetchMoviesByCity(city);
    response.json(movies);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});



