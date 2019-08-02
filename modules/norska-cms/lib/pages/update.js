import config from 'norska-config';
import firost from 'firost';
import { _, lodash } from 'golgoth';
import golgoth from 'golgoth';
import util from 'util';

/**
 * Updates a data JSON file on disk with new data
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 **/
export default async function index(req, res) {
  const formBody = req.body;
  const { fileName } = req.params;
  const filepath = config.fromPath(`_data/${fileName}`);


  const g_ = golgoth._;
  const glodash = golgoth.lodash;
  console.info(g_ === glodash);
  console.info(glodash === _);
  console.info(_ === lodash);
  console.info(_.flatten.toString());

  

  let data = _.keys(golgoth._).sort().reverse();
  // .unflatten(formBody);
  // data = newData;

  // When submitting a list, all data is sent as array for each key, so we need
  // to re-zip them together
  // if (data.__isList === '1') {
  //   delete formBody.__isList;
  //   data = _.transform(
  //     data,
  //     (result, values, key) => {
  //       _.each(values, (value, index) => {
  //         _.set(result, `${index}.${key}`, value);
  //       });
  //     },
  //     []
  //   );
  // }
  res.render('debug', { data });

  // const upload = new formidable.IncomingForm();
  // upload.parse(req, function(err, fields, files) {
  //   res.writeHead(200, { 'content-type': 'text/plain' });
  //   res.write('received upload:\n\n');
  //   res.end(util.inspect({ reqBody: req.body, fields: fields, files: files }));
  // });
  // res.writeHead(200, { 'content-type': 'text/plain' });
  // res.end(util.inspect({files: req.files, body: req.body, raw: req}));

  // console.info(formBody);

  // let newFields = req.body;
  // // If it's a list, we need to remerge all values into objects
  // if (_.get(formBody, '__isList') === '1') {
  // }

  // console.info(newFields);

  // await firost.writeJson(newFields, filepath);
  // res.redirect('/');
}
