const path = require('path');
const _ = require('golgoth/lib/lodash');
const cms = require('../main.js');
const firostRequire = require('firost/lib/require');
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
  const allFields = await helper.getFieldsFromFilepath(fullDataPath);
  const fields = _.chain(allFields)
    .first()
    .get('items')
    .first()
    .get('fields')
    .map(item => {
      item.value = null;
      item.name = item.name.replace('[0]', '');
      return item;
    })
    .value();

  res.render('add', { fileName, fields, _ });
};
