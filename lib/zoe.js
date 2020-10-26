const twilio = require('twilio');
const config = require('../config');
const weather = require('./weather');
const five38 = require('./538');
const polls538 = require('./538Polls');

const client = twilio(config.TWILIO_SID, config.TWILIO_AUTH_KEY);

module.exports = {
  morning: async () => {
    const currentWeather = await weather('tulsa');
    const elcForcast = await five38();
    const polls = await polls538();

    const spread =
      polls.Biden >= polls.Trump
        ? `Biden +${Math.round(polls.Biden - polls.Trump)}`
        : `Trump +${Math.round(polls.Trump - polls.Biden)}`;

    const currentElcForcast = `Biden has a ${Math.round(
      elcForcast[0].ecwin_chal * 100
    )}% chance of winning\nTrump has a ${Math.round(
      elcForcast[0].ecwin_inc * 100
    )}% chance of winning\nNationally:\n Biden's polling avg is: ${Math.round(
      polls.Biden
    )}%\n Trump's avg is: ${Math.round(
      polls.Trump
    )}% with a spread of ${spread}`;

    const currentForcast = `It is currently ${currentWeather.weather[0].description} with a tempature of ${currentWeather.main.temp} degrees.`;

    const msgBody = `\nGood Morning Creator,\n${currentForcast}\n\n${currentElcForcast}\n\n-Zoe`;
    client.messages
      .create({
        body: msgBody,
        from: config.TWILIO_NUMBER,
        to: config.USER_NUMBER,
      })
      .catch(console.error);
  },
};
