const axios = require('axios');
const csv = require('csvtojson');

module.exports = async (state) => {
  if (state) {
    const response = await axios.get(
      'https://projects.fivethirtyeight.com/2020-general-data/presidential_state_toplines_2020.csv'
    );

    const { data } = response;

    const json = await csv().fromString(data);

    const date = new Date();

    const currentDate = `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}`;

    const yesterday = `${date.getMonth() + 1}/${
      date.getDate() - 1
    }/${date.getFullYear()}`;

    const electionToday = json.filter((row) => {
      return (
        row.modeldate === currentDate &&
        row.state.toLowerCase() === state.toLowerCase()
      );
    });
    if (electionToday.length) return electionToday;

    const electionYesterday = json.filter((row) => {
      return (
        row.modeldate === yesterday &&
        row.state.toLowerCase() === state.toLowerCase()
      );
    });

    return electionYesterday;
  }

  // If no state then get national election forcast
  const response = await axios.get(
    'https://projects.fivethirtyeight.com/2020-general-data/presidential_national_toplines_2020.csv'
  );
  const { data } = response;

  const json = await csv().fromString(data);

  return json;
};
