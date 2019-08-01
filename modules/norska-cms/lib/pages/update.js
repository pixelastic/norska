import config from 'norska-config';
import firost from 'firost';
import { _ } from 'golgoth';

/**
 * Updates a data JSON file on disk with new data
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  const formBody = req.body;
  const { fileName } = req.params;
  const filepath = config.fromPath(`_data/${fileName}`);

  let newFields = req.body;
  // If it's a list, we need to remerge all values into objects
  if (_.get(formBody, '__isList') === '1') {
    delete formBody.__isList;
    newFields = _.transform(
      formBody,
      (result, values, key) => {
        _.each(values, (value, index) => {
          _.set(result, `${index}.${key}`, value);
        });
      },
      []
    );
  }

  await firost.writeJson(newFields, filepath);
  res.redirect('/');
}
