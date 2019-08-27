import { _, pMap } from 'golgoth';
import path from 'path';
import cms from '../index.js';
import config from 'norska-config';
import firost from 'firost';
export default {
  /**
   * Return the data to save to file from the request sent by the form
   * @param {object} req Express request
   * @returns {object} Data object to save on diska
   **/
  async getDataFromRequest(req) {
    let data = _.unflatten(req.body);
    // If it's a list of several items, we need to zip it and handle all
    // uploads individually
    if (data.__isList) {
      const list = this.zipList(data);
      return await pMap(list, async item => {
        return await this.normalizeUpload(item, req.files);
      });
    }

    data = await this.normalizeUpload(data, req.files);
    return data;
  },
  /**
   * Enhance form data with upload information
   * Note: Uploads are sent through a different object and need to be merged
   * with the initial data
   * @param {object} data Form data
   * @param {object} files Files data
   * @returns {object} Final merged data
   **/
  async normalizeUpload(data, files) {
    // Finding all fields that are uploads
    const uploadKeys = _.filter(_.keys(data), key => {
      return _.get(data, `${key}.uploadKey`);
    });
    // Stop early if no fields are upload fields
    if (_.isEmpty(uploadKeys)) {
      return data;
    }

    // Get matching upload information from the files array and add it to the
    // main data
    await pMap(uploadKeys, async fieldName => {
      // What is this upload unique key in the files array?
      const uploadKey = data[fieldName].uploadKey;
      const matchingUpload = _.find(files, { fieldname: uploadKey });
      // No new upload, we keep the previous value
      if (!matchingUpload) {
        data[fieldName] = data[fieldName].previousValue;
        return;
      }

      // Getting full filepath on disk, and relative filepath to save
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
  },
  /**
   * Returns the final full upload path for an upload
   * Note: Default will upload in ./uploads with a unique random name, but both
   * the directory and the filename can be overwritten by fields send by the
   * form
   * @param {object} data The full data object
   * @param {string} fieldName The upload field in that object
   * @param {object} upload The matching upload file object
   * @returns {string} Full path to the upload directory
   **/
  uploadPath(data, fieldName, upload) {
    const options = data[fieldName];
    const extname = path.extname(upload.originalname);

    // Default or custom upload directory
    let dirname = cms.uploadPath();
    if (options.uploadDirectory) {
      dirname = config.fromPath(options.uploadDirectory);
    }
    // Default or custom upload name
    let basename = path.basename(upload.path);
    if (options.uploadBasename) {
      basename = options.uploadBasename;
    }

    // Handle {placeholders} by replacing each with their current value
    let fullpath = `${dirname}/${basename}${extname}`;
    _.each(data, (value, key) => {
      // Skip upload fields to avoid recursion
      if (value.uploadKey) {
        return;
      }
      fullpath = _.replace(fullpath, `{${key}}`, _.camelCase(value));
    });

    return fullpath;
  },
  /**
   * Zip a list of several items into one list of items
   * Example:
   *   { name: ['foo', 'bar'], description: [ 'foo foo', 'bar bar' ] }
   *   will become
   *   [
   *     { name: 'foo', description: 'foo foo' },
   *     { name: 'bar', description: 'bar bar' }
   *   ]
   * @param {object} list List of zippable entries
   * @returns {Array} Real list of items
   **/
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
