const path = require('path');
const _ = require('golgoth/lodash');
const cms = require('../main.js');
const firostRequire = require('firost/require');
const config = require('norska-config');

/**
 * Displays a form allowing editing a file
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
module.exports = async function index(req, res) {
  const helperPath = path.resolve(cms.helpersPath(), 'form.js');
  const helper = firostRequire(helperPath, { forceReload: true });

  const { fileName } = req.params;
  const fullDataPath = config.fromPath(`_data/${fileName}`);
  const fields = await helper.getFieldsFromFilepath(fullDataPath);

  const isList = _.get(fields, '[0].type') === 'list';

  res.render('edit', { fileName, isList, fields, _ });
};
