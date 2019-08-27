import { _, pMap } from 'golgoth';
import path from 'path';
import cms from '../index.js';
import config from 'norska-config';
import firost from 'firost';
export default {
  async getDataFromRequest(req) {
    let data = _.unflatten(req.body);
    if (data.__isList) {
      return this.zipList(data);
    }

    data = await this.normalizeUpload(data, req.files);
    return data;
  },
  async normalizeUpload(data, files) {
    const uploadKeys = _.filter(_.keys(data), key => {
      return _.get(data, `${key}.isUpload`);
    });
    // Stop early if no fields are upload fields
    if (_.isEmpty(uploadKeys)) {
      return data;
    }

    await pMap(uploadKeys, async fieldName => {
      const matchingUpload = _.find(files, { fieldname: fieldName });
      // No new upload, we keep the previous value
      if (!matchingUpload) {
        data[fieldName] = data[fieldName].previousValue;
        return;
      }

      // Getting full filepath
      const absolutePath = this.uploadPath(data, fieldName, matchingUpload);
      const srcPath = path.relative(config.from(), absolutePath);

      // We delete the previous file if there was one
      const previousValue = _.get(data, `${fieldName}.previousValue`);
      if (previousValue) {
        const absolutePreviousValue = config.fromPath(previousValue);
        if (await firost.exist(absolutePreviousValue)) {
          await firost.remove(absolutePreviousValue);
        }
      }
      // We move the temporary uploaded file to ./src
      await firost.move(matchingUpload.path, absolutePath);

      data[fieldName] = srcPath;
    });

    return data;
    // Loop through each data key.
    // If contains a .isUpload key then we process
    // We find a key in files with the same name
    // If nothing, we only keep the originalName
    // If something, we take the path + extension from originalname
    // (We change multer to upload to tmp instead)
    // We move the file to this destination and return this path
    // If there was already a path, we delete the file
    // if .uploadPath is set, we upload to that path instead of the default
    // ./uploads in ./src
    // if .uploadName is set, we rename the file to that name instead of the
    // default random name chosen by multer
    // Both above values can use {title} placeholder to replace with data values
    // Those values should be transformed into valid filename placeholders
    // If uploadPath or uploadName is set, even if no file is uploaded, we check
    // the current value and move the file if the destination changed, and
    // update the value accordingly
  },
  uploadPath(data, fieldName, upload) {
    const options = data[fieldName];
    const extname = path.extname(upload.originalname);

    // Allow specifying custom upload directory
    let dirname = cms.uploadPath();
    if (options.uploadDirectory) {
      dirname = config.fromPath(options.uploadDirectory);
    }
    // Allow specifying custom upload name
    let basename = path.basename(upload.path);
    if (options.uploadBasename) {
      basename = options.uploadBasename;
    }

    // Handle {placeholders}
    let fullpath = `${dirname}/${basename}${extname}`;
    _.each(data, (value, key) => {
      if (value.isUpload) {
        return;
      }
      fullpath = _.replace(fullpath, `{${key}}`, _.camelCase(value));
    });

    return fullpath;
  },
  zipList(list) {
    return _.transform(
      list,
      (result, values, key) => {
        if (key === '__isList') {
          return;
        }
        _.each(values, (value, index) => {
          _.set(result, `${index}.${key}`, value);
        });
      },
      []
    );
  },
};
