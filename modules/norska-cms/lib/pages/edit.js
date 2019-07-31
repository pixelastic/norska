import config from 'norska-config';
import helper from 'norska-helper';
import firost from 'firost';
import path from 'path';
import { _ } from 'golgoth';

/**
 * Displays a form allowing editing a file
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  const { fileName } = req.params;
  const fullDataPath = config.fromPath(`_data/${fileName}`);
  const data = await firost.readJson(fullDataPath);

  // We re-require the form helper everytime this page is loaded instead of
  // using import. This allow us to always load the most up-to-date version
  // during livereloads
  const formHelper = helper.require(
    path.resolve(__dirname, '../formHelper.js'),
    { forceReload: true }
  );

  res.render('edit', { fileName, data, formHelper, _ });
}
