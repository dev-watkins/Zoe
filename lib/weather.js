const axios = require('axios');
const config = require('../config');

module.exports = async (city) => {
  const response = await axios.get(
    `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${config.OPEN_WEATHER_KEY}&units=imperial`
  );

  return response.data;
};
