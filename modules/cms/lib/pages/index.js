const glob = require('firost/glob');
const path = require('path');
const _ = require('golgoth/lodash');
const config = require('norska-config');

/**
 * Displays the list of all data files
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
module.exports = async function index(req, res) {
  const dataFolder = config.fromPath('_data');
  // Get all _data.json files
  let dataFiles = await glob([
    `${dataFolder}/**/*.json`,
    `!${dataFolder}/**/*.schema.json`,
  ]);
  dataFiles = _.map(dataFiles, (dataFile) => {
    return path.relative(dataFolder, dataFile);
  });
  res.render('index', { files: dataFiles });
};
