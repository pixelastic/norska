const cms = require('../main.js');
const firostRequire = require('firost/require');
const readJson = require('firost/readJson');
const writeJson = require('firost/writeJson');
const path = require('path');
const config = require('norska-config');

/**
 * Updates a data JSON file on disk with new data
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
module.exports = async function index(req, res) {
  const helperPath = path.resolve(cms.helpersPath(), 'submit.js');
  const helper = firostRequire(helperPath, { forceReload: true });

  const newItem = await helper.getDataFromRequest(req, config);

  const { fileName } = req.params;
  const filepath = config.fromPath(`_data/${fileName}`);
  const data = await readJson(filepath);
  data.unshift(newItem);
  await writeJson(data, filepath);

  // res.render('debug', {
  //   data: {
  //     data,
  //     body: req.body,
  //     files: req.files,
  //   },
  // });
  res.redirect(`/add/${fileName}`);
};
