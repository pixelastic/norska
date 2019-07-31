import config from 'norska-config';
import firost from 'firost';
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

  const fields = _.map(data, (value, key) => {
    return {
      name: key,
      value,
      type: 'text',
    };
  });

  res.render('edit', { fileName, fields });
}
