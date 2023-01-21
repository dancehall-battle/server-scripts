const program = require('commander');
const pkg = require('./package');
const path = require('path');
const {DancerRanker, CountryRanker} = require('dhb-ranking');
const fs = require('fs-extra');
const pm2 = require('pm2');

program
  .version(pkg.version)
  .requiredOption('-f, --file <path>', 'File where the ranking data is appended.')
  .option('-l, --ldf <name>', 'PM2 name of the ldf-server.')
  .option('-v, --verbose', 'Show debugging output.');

program.parse(process.argv);

const {verbose} = program;

if (!path.isAbsolute(program.file)) {
  program.file = path.resolve(process.cwd(), program.file);
}

const todayDate = new Date();
const oneYearAgo = new Date();
oneYearAgo.setFullYear(todayDate.getFullYear() - 1);

main();

async function main() {
  let logger;

  if (verbose) {
    logger = console;
    console.log('Generating ranking for dancer 1 vs 1...');
  }

  const tpfServer = 'http://localhost:5000/data';

  await generateRanking(new DancerRanker({logger}), {
    participants: ['1'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'both',
    removeFemaleBattles: true,
    tpfServer,
  }, `dancer-1vs1`);

  if (verbose) {
    console.log('Generating ranking for dancer 1 vs 1 done.');
    console.log('Generating ranking for dancer 2 vs 2...');
  }

  await generateRanking(new DancerRanker(), {
    participants: ['2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'both',
    removeFemaleBattles: true,
    tpfServer,
  }, `dancer-2vs2`);

  if (verbose) {
    console.log('Generating ranking for dancer 2 vs 2 done.');
    console.log('Generating ranking for dancer combined...');
  }

  await generateRanking(new DancerRanker(), {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'both',
    removeFemaleBattles: true,
    tpfServer,
  }, `dancer-combined`);

  if (verbose) {
    console.log('Generating ranking for dancer combined done.');
    console.log('Generating ranking for country both...');
  }

  await generateRanking(new CountryRanker(), {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'both',
    tpfServer,
  }, `country-both`);

  if (verbose) {
    console.log('Generating ranking for country both done.');
    console.log('Generating ranking for country home...');
  }

  await generateRanking(new CountryRanker(), {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'home',
    tpfServer,
  }, `country-home`);

  if (verbose) {
    console.log('Generating ranking for country home done.');
    console.log('Generating ranking for country away...');
  }

  await generateRanking(new CountryRanker(), {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'ntriples',
    homeAway: 'away',
    scale: true,
    tpfServer,
  }, `country-away`);

  if (verbose) {
    console.log('Generating ranking for country away done.');
  }

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