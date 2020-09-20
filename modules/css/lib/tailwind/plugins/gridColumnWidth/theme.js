const width = require('../../themes/width.js');
const _ = require('golgoth/lib/lodash');
module.exports = _.transform(
  width,
  (result, value, key) => {
    // Remove width in percentage as it won't make much sense, better to use the
    // .grid-cols-X classes
    if (_.endsWith(key, 'p')) {
      return;
    }
    result[key] = `repeat(auto-fill, minmax(${value}, 1fr))`;
  },
  {}
);
