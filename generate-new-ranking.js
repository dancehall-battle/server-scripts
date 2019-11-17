const program = require('commander');
const pkg = require('./package');
const path = require('path');
const {format} = require('date-fns');
const {DancerRanker, CountryRanker} = require('dhb-ranking');
const fs = require('fs-extra');

program
  .version(pkg.version)
  .option('-d, --dir <path>', 'Directory where to store ranking data.')
  .option('-l, --ldf <id>', 'ID of the ldf-server process.')
  .requiredOption('-c, --config <path>', 'Config of the ldf-server.')
  .requiredOption('-s, --data-source <string>', 'Name of the data source in the config.')

program.parse(process.argv);

let rootDirectory = program.dir || process.cwd();

if (!path.isAbsolute(rootDirectory)) {
  rootDirectory = path.resolve(process.cwd(), rootDirectory);
}

const today = format(new Date(), 'yyyy-MM-dd');
const directory = path.join(rootDirectory, today);

fs.ensureDirSync(directory);

if (!path.isAbsolute(program.config)) {
  program.config = path.resolve(process.cwd(), program.config);
}

const todayDate = new Date();
const oneYearAgo = new Date();
oneYearAgo.setFullYear(todayDate.getFullYear() - 1);

generateRanking(new DancerRanker,{
  participants: ['1'],
  startDate: oneYearAgo,
  endDate: todayDate,
  format: 'jsonld',
  homeAway: 'both',
  removeFemaleBattles: true
}, `dancer-1vs1.jsonld`);

generateRanking(new DancerRanker,{
  participants: ['2'],
  startDate: oneYearAgo,
  endDate: todayDate,
  format: 'jsonld',
  homeAway: 'both',
  removeFemaleBattles: true
}, `dancer-2vs2.jsonld`);

generateRanking(new DancerRanker,{
  participants: ['1', '2'],
  startDate: oneYearAgo,
  endDate: todayDate,
  format: 'jsonld',
  homeAway: 'both',
  removeFemaleBattles: true
}, `dancer-combined.jsonld`);

generateRanking(new CountryRanker,{
  participants: ['1', '2'],
  startDate: oneYearAgo,
  endDate: todayDate,
  format: 'jsonld',
  homeAway: 'both'
}, `country-both.jsonld`);

generateRanking(new CountryRanker,{
  participants: ['1', '2'],
  startDate: oneYearAgo,
  endDate: todayDate,
  format: 'jsonld',
  homeAway: 'home'
}, `country-home.jsonld`);

generateRanking(new CountryRanker,{
  participants: ['1', '2'],
  startDate: oneYearAgo,
  endDate: todayDate,
  format: 'jsonld',
  homeAway: 'away',
  scale: true
}, `country-away.jsonld`);

async function generateRanking(ranker, options, filename) {
  const result = await ranker.getRanking(options);

  fs.writeFile(path.resolve(directory, filename), JSON.stringify(result), (err) => {
    if (err) throw err;
  });
}
