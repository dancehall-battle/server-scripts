const program = require('commander');
const pkg = require('./package');
const path = require('path');
const {DancerRanker, CountryRanker} = require('dhb-ranking');
const fs = require('fs-extra');
const pm2 = require('pm2');

program
  .version(pkg.version)
  .requiredOption('-f, --file <path>', 'File where the ranking data is appended.')
  .option('-l, --ldf <name>', 'PM2 name of the ldf-server.');

program.parse(process.argv);

if (!path.isAbsolute(program.file)) {
  program.file = path.resolve(process.cwd(), program.file);
}

const todayDate = new Date();
const oneYearAgo = new Date();
oneYearAgo.setFullYear(todayDate.getFullYear() - 1);

main();

async function main() {
  await generateRanking(new DancerRanker, {
    participants: ['1'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'both',
    removeFemaleBattles: true
  }, `dancer-1vs1`);

  await generateRanking(new DancerRanker, {
    participants: ['2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'both',
    removeFemaleBattles: true
  }, `dancer-2vs2`);

  await generateRanking(new DancerRanker, {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'both',
    removeFemaleBattles: true
  }, `dancer-combined`);

  await generateRanking(new CountryRanker, {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'both'
  }, `country-both`);

  await generateRanking(new CountryRanker, {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'home'
  }, `country-home`);

  await generateRanking(new CountryRanker, {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'away',
    scale: true
  }, `country-away`);

  console.log('Rankings generated.');

  if (program.ldf) {
    pm2.connect(function(err) {
      if (err) {
        console.error(err);
        process.exit(2);
      }

      pm2.restart(program.ldf, function(err, proc) {
        pm2.disconnect();   // Disconnects from PM2
        if (err) throw err;

        console.log('TPF server restarted.');
      });
    });
  }
}

async function generateRanking(ranker, options) {
  const result = await ranker.getRanking(options);

  fs.appendFileSync(program.file, result);
}