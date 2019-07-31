import config from 'norska-config';
import firost from 'firost';
import path from 'path';
import { _ } from 'golgoth';

/**
 * Displays the list of all data files
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  // Get all _data.json files
  const dataFolder = config.fromPath('_data');
  let dataFiles = await firost.glob(`${dataFolder}/**/*.json`);
  dataFiles = _.map(dataFiles, dataFile => {
    return path.relative(dataFolder, dataFile);
  });
  res.render('index', { files: dataFiles });
}
