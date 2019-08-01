import config from 'norska-config';
import helper from 'norska-helper';
import path from 'path';
import { _ } from 'golgoth';
import cms from '../index.js';

/**
 * Displays a form allowing editing a file
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  // We re-require the form helper everytime this page is loaded instead of
  // using import. This allow us to always load the most up-to-date version
  // during livereloads
  const formHelper = helper.require(
    path.resolve(cms.helpersPath(), 'form.js'),
    {
      forceReload: true,
    }
  );

  const { fileName } = req.params;
  const fullDataPath = config.fromPath(`_data/${fileName}`);
  const fields = await formHelper.getFields(fullDataPath);

  res.render('edit', { fileName, fields, _ });
}
