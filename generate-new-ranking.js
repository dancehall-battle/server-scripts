const program = require('commander');
const pkg = require('./package');
const path = require('path');
const {format} = require('date-fns');
const ranking = require('dhb-ranking');
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