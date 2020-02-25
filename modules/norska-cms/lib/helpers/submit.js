const _ = require('golgoth/lib/lodash');
const pMap = require('golgoth/lib/pMap');
const path = require('path');
const cms = require('../index.js');
const config = require('norska-config');
const firost = require('firost');
module.exports = {
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
        return await this.normalizeSpecialFields(item, req.files);
      });
    }

    data = await this.normalizeSpecialFields(data, req.files);
    return data;
  },
  /**
   * Fields like upload and checkboxes need some data normalization
   * @param {object} inputData Form data
   * @param {object} files Files data
   * @returns {object} Final normalized data
   **/
  async normalizeSpecialFields(inputData, files) {
    let data = inputData;
    data = await this.normalizeCheckboxes(data);
    data = await this.normalizeUploads(data, files);
    return data;
  },
  /**
   * Cast to boolean any checkbox
   * @param {object} data Form data
   * @returns {object} Normalized data
   **/
  async normalizeCheckboxes(data) {
    const checkboxKeys = _.filter(_.keys(data), key => {
      return _.has(data[key], 'isCheckbox');
    });
    return _.transform(
      checkboxKeys,
      (result, key) => {
        result[key] = _.has(data, `${key}.isChecked`);
      },
      data
    );
  },
  /**
   * Delete an existing uploaded file
   * @param {string} previousValue Path to the uploaded file, relative to source
   **/
  async deletePreviousValue(previousValue) {
    const previousValuePath = config.fromPath(previousValue);
    if (!(await firost.isFile(previousValuePath))) {
      return;
    }
    await firost.remove(previousValuePath);
  },
  /**
   * Enhance form data with upload information
   * Note: Uploads are sent through a different object and need to be merged
   * with the initial data
   * @param {object} data Form data
   * @param {object} files Files data
   * @returns {object} Final merged data
   **/
  async normalizeUploads(data, files) {
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
      const previousValue = _.get(data, `${fieldName}.previousValue`);

      // Reseting the value if the file is marked for deletion
      if (_.has(data, `${fieldName}.deletePreviousValue`)) {
        data[fieldName] = null;
        await this.deletePreviousValue(previousValue);
        return;
      }

      // What is this upload unique key in the files array?
      const uploadKey = data[fieldName].uploadKey;
      const matchingUpload = _.find(files, { fieldname: uploadKey });
      // No new upload, we keep the previous value
      if (!matchingUpload) {
        data[fieldName] = previousValue;
        return;
      }

      // Getting full filepath on disk, and relative filepath to save
      const absolutePath = this.uploadPath(data, fieldName, matchingUpload);
      const srcPath = path.relative(config.from(), absolutePath);
      data[fieldName] = srcPath;

      // We delete the previous file if there was one
      if (previousValue) {
        await this.deletePreviousValue(previousValue);
      }

      // We move the temporary uploaded file to ./src
      await firost.move(matchingUpload.path, absolutePath);
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