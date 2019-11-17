const program = require('commander');
const pkg = require('./package');
const path = require('path');
const {format} = require('date-fns');
const {DancerRanker, CountryRanker} = require('dhb-ranking');
const fs = require('fs-extra');
const pm2 = require('pm2');

program
  .version(pkg.version)
  .option('-d, --dir <path>', 'Directory where to store ranking data.')
  .option('-l, --ldf <name>', 'PM2 name of the ldf-server.')
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

const ldfConfig = fs.readJsonSync(program.config);

main();

async function main() {
  await generateRanking(new DancerRanker, {
    participants: ['1'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'jsonld',
    homeAway: 'both',
    removeFemaleBattles: true
  }, `dancer-1vs1`);

  await generateRanking(new DancerRanker, {
    participants: ['2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'jsonld',
    homeAway: 'both',
    removeFemaleBattles: true
  }, `dancer-2vs2`);

  await generateRanking(new DancerRanker, {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'jsonld',
    homeAway: 'both',
    removeFemaleBattles: true
  }, `dancer-combined`);

  await generateRanking(new CountryRanker, {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'jsonld',
    homeAway: 'both'
  }, `country-both`);

  await generateRanking(new CountryRanker, {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'jsonld',
    homeAway: 'home'
  }, `country-home`);

  await generateRanking(new CountryRanker, {
    participants: ['1', '2'],
    startDate: oneYearAgo,
    endDate: todayDate,
    format: 'jsonld',
    homeAway: 'away',
    scale: true
  }, `country-away`);

  console.log('Rankings generated.');

  //console.log(ldfConfig);
  fs.writeFileSync(program.config, JSON.stringify(ldfConfig));
  console.log('TPF server config updated.');

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

async function generateRanking(ranker, options, filename) {
  const result = await ranker.getRanking(options);

  fs.writeFileSync(path.resolve(directory, filename + '.jsonld'), JSON.stringify(result));

  updateLDFConfig(ldfConfig, `${today}-${filename}`, path.resolve(directory, filename+ '.jsonld'), program.dataSource);
}

function updateLDFConfig(ldfConfig, title, path, datasourceName) {
  ldfConfig.datasources[title] = {
    type: "JsonLdDatasource",
    hide: true,
    settings: { "file": path }
  };

  const datasource = ldfConfig.datasources[datasourceName];
  datasource.settings.references.push(title);
}