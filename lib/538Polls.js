const axios = require('axios');
const csv = require('csvtojson');

module.exports = async (state = 'National') => {
  const date = new Date();

  const currentDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  const yesterday = `${date.getMonth() + 1}/${
    date.getDate() - 1
  }/${date.getFullYear()}`;

  const response = await axios.get(
    'https://projects.fivethirtyeight.com/2020-general-data/presidential_poll_averages_2020.csv'
  );
  const { data } = response;

  const json = await csv().fromString(data);

  let avgs = json.filter((row) => {
    return row.modeldate === currentDate;
  });

  if (!avgs.length) {
    avgs = json.filter((row) => {
      return row.modeldate === yesterday;
    });
  }

  const bidenAvgs = avgs.filter((row) => {
    return row.candidate_name === 'Joseph R. Biden Jr.';
  });
  const trumpAvgs = avgs.filter((row) => {
    return row.candidate_name === 'Donald Trump';
  });

  const biden = bidenAvgs.filter((row) => {
    return row.state.toLowerCase() === state.toLowerCase();
  });
  const trump = trumpAvgs.filter((row) => {
    return row.state.toLowerCase() === state.toLowerCase();
  });

  if (biden.length && trump.length) {
    return {
      Biden: biden[0].pct_trend_adjusted,
      Trump: trump[0].pct_trend_adjusted,
    };
  }
  return null;
};
