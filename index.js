const cron = require('cron').CronJob;
const zoe = require('./lib/zoe');

require('./server');

const job = new cron('00 00 6 * * *', function () {
  zoe.morning();
});
job.start();
