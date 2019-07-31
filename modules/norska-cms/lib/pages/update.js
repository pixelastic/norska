import config from 'norska-config';
import firost from 'firost';

/**
 * Updates a data JSON file on disk with new data
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  const newFields = req.body;
  const { fileName } = req.params;
  const filepath = config.fromPath(`_data/${fileName}`);

  await firost.writeJson(newFields, filepath);
  res.redirect('/');
}
