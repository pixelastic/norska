const config = require('norska-config');
const path = require('path');
const _ = require('golgoth/lib/lodash');
const cms = require('../index.js');
const firost = require('firost');

/**
 * Displays a form allowing editing a file
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
module.exports = async function index(req, res) {
  const helperPath = path.resolve(cms.helpersPath(), 'form.js');
  const helper = firost.require(helperPath, { forceReload: true });

  const { fileName } = req.params;
  const fullDataPath = config.fromPath(`_data/${fileName}`);
  const fields = await helper.getFieldsFromFilepath(fullDataPath);

  res.render('edit', { fileName, fields, _ });
}