const _ = require('golgoth/lib/lodash');

/**
 * Generate an object representing classes and their properties
 * @param {object} theme Theme object
 * @param {string|Function} classCallback Callback to call to generate the
 * className. Can be a prefix shorthand
 * @param {string|Function} valueCallback Callback to call to generate the value. Can
 * be a propertyName shorthand
 * @returns {object} Object of classes and properties
 */
module.exports = function (theme, classCallback, valueCallback) {
  return _.transform(theme, (result, configValue, configName) => {
    const isClassShorthand = _.isString(classCallback);
    const isValueShorthand = _.isString(valueCallback);

    // Take the shorthand as the class prefix
    let className = isClassShorthand
      ? `${classCallback}${configName}`
      : classCallback(configName);
    className = className.replace('-default', '');

    // Take the shorthand as the propertyName
    const value = isValueShorthand
      ? { [valueCallback]: configValue }
      : valueCallback(configValue, configName);

    // Skip discarded values
    if (!value) {
      return;
    }

    result[className] = value;
  });
};
