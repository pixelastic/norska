import config from 'norska-config';
import path from 'path';
import { _ } from 'golgoth';
import cms from '../index.js';
import firost from 'firost';

/**
 * Displays a form allowing editing a file
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  const helperPath = path.resolve(cms.helpersPath(), 'form.js');
  const helper = firost.require(helperPath, { forceReload: true });

  const { fileName } = req.params;
  const fullDataPath = config.fromPath(`_data/${fileName}`);
  const fields = await helper.getFieldsFromFilepath(fullDataPath);

  res.render('edit', { fileName, fields, _ });
}
