const config = require('norska-config');
const firost = require('firost');
const path = require('path');
const _ = require('golgoth/lib/lodash');

/**
 * Displays the list of all data files
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
module.exports = async function index(req, res) {
  // Get all _data.json files
  const dataFolder = config.fromPath('_data');
  let dataFiles = await firost.glob([
    `${dataFolder}/**/*.json`,
    `!${dataFolder}/**/*.schema.json`,
  ]);
  dataFiles = _.map(dataFiles, dataFile => {
    return path.relative(dataFolder, dataFile);
  });
  res.render('index', { files: dataFiles });
}