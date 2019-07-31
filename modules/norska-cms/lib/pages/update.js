import config from 'norska-config';
import firost from 'firost';
import { _ } from 'golgoth';

/**
 * Updates a data JSON file on disk with new data
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  const newFields = req.body;
  const { fileName } = req.params;
  const filepath = config.fromPath(`_data/${fileName}`);

  if (_.has(newFields, '__list__')) {
    console.info('TODO');
    return;
  }

  // TODO: If contains a field named __list__, then we need to reconcile all the
  // elements into an array of objects and save that instead
  // If not, we just save the thing back to file
  //
  // No fancy drag'n'drop for ordering, I'll do that in the json file directly
  // if the order is really important.

  await firost.writeJson(newFields, filepath);
  res.redirect('/');
}
