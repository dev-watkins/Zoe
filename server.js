const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const weather = require('./lib/weather');
const five38 = require('./lib/538');
const polls538 = require('./lib/538Polls');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', async (req, res) => {
  const twiml = new MessagingResponse();
  const { Body } = req.body;
  const wxPattern = /weather\s?(.*)/i;
  const elcPattern = /election\s?(.*)/i;
  const pollsPattern = /polls\s?(.*)/i;

  if (wxPattern.test(Body)) {
    const match = Body.match(wxPattern);
    const city = match[1] || 'Tulsa';

    const currentWX = await weather(city);
    const msg = `The weather in  ${city} is ${currentWX.weather[0].description} with a tempature of ${currentWX.main.temp} degrees.\n-Zoe`;

    twiml.message(msg);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    return res.end(twiml.toString());
  } else if (elcPattern.test(Body)) {
    const match = Body.match(elcPattern);
    const elcForcast = await five38(match[1]);
    if (match[1]) {
      if (!elcForcast[0]) {
        twiml.message('state elction forcast not found');
      } else {
        twiml.message(
          `In ${match[1]}:\nBiden has a ${Math.round(
            elcForcast[0].winstate_chal * 100
          )}% chance of winning\nTrump has a ${Math.round(
            elcForcast[0].winstate_inc * 100
          )}% chance of winning\n-Zoe`
        );
      }
    } else {
      twiml.message(
        `Nationally:\nBiden has a ${Math.round(
          elcForcast[0].ecwin_chal * 100
        )}% chance of winning\nTrump has a ${Math.round(
          elcForcast[0].ecwin_inc * 100
        )}% chance of winning\n-Zoe`
      );
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    return res.end(twiml.toString());
  } else if (pollsPattern.test(Body)) {
    const match = Body.match(pollsPattern);
    const state = match[1] || 'national';
    const polls = await polls538(state);

    if (polls) {
      const spread =
        polls.Biden >= polls.Trump
          ? `Biden +${Math.round(polls.Biden - polls.Trump)}`
          : `Trump +${Math.round(polls.Trump - polls.Biden)}`;
      if (match[1]) {
        twiml.message(
          `In ${match[1]}:\n Biden's polling avg is: ${Math.round(
            polls.Biden
          )}%\n Trump's avg is: ${Math.round(
            polls.Trump
          )}% with a spread of ${spread} `
        );
      } else {
        twiml.message(
          `Nationally:\n Biden's polling avg is: ${Math.round(
            polls.Biden
          )}%\n Trump's avg is: ${Math.round(
            polls.Trump
          )}% with a spread of ${spread} `
        );
      }
    } else {
      twiml.message('state polls not found');
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    return res.end(twiml.toString());
  } else if (Body.toLowerCase() === 'good morning') {
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
    twiml.message(msgBody);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    return res.end(twiml.toString());
  } else {
    twiml.message('I do not understand');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    return res.end(twiml.toString());
  }
});

app.listen(3000, () => {
  console.log('server started');
});
