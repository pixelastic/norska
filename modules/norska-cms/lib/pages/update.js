import config from 'norska-config';
import cms from '../index.js';
import firost from 'firost';
import path from 'path';

/**
 * Updates a data JSON file on disk with new data
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  const helperPath = path.resolve(cms.helpersPath(), 'submit.js');
  const helper = firost.require(helperPath, { forceReload: true });

  const data = await helper.getDataFromRequest(req);

  const { fileName } = req.params;
  const filepath = config.fromPath(`_data/${fileName}`);
  await firost.writeJson(data, filepath);

  // res.render('debug', {
  //   data: {
  //     data,
  //     body: req.body,
  //     files: req.files,
  //   },
  // });
  res.redirect('/');
}
