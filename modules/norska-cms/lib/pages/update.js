// import config from 'norska-config';
// import firost from 'firost';
import { _ } from 'golgoth';

/**
 * Updates a data JSON file on disk with new data
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  const formBody = req.body;
  // const { fileName } = req.params;
  // const filepath = config.fromPath(`_data/${fileName}`);

  // File upload are sent in another field, so we convert it in the same syntax
  const formFiles = _.transform(
    req.files,
    (result, file) => {
      result[file.fieldname] = file.path;
      result[file.fieldname] = {
        path: file.path,
        originalName: file.originalname,
      };
    },
    {}
  );

  // Merging form fields with form files
  let data = _.unflatten({
    ...formBody,
    ...formFiles,
  });

  // When submitting a list, all data is sent as array for each key, so we need
  // to re-zip them together
  if (data.__isList === '1') {
    delete data.__isList;
    data = _.transform(
      data,
      (result, values, key) => {
        _.each(values, (value, index) => {
          _.set(result, `${index}.${key}`, value);
        });
      },
      []
    );
  }

  // TODO:
  // 1. We take the upload path and set it as the value for the JSON
  // 2. If a value was already existing, we delete the file before adding the
  //    new one
  // 3. We set the same file extension as the one supplied in the original file
  // 4. We allow passing a .uploadPath to choose where to upload (relative to
  //    source)
  // 5. We allow passing a .uploadName to choose the file basename.
  // 6. ^ This should accept {pattern} to replace with actual values of the form

  res.render('debug', { data });

  // await firost.writeJson(newFields, filepath);
  // res.redirect('/');
}
