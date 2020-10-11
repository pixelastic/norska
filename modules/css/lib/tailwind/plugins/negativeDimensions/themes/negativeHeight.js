const height = require('../../../themes/height.js');
const _ = require('golgoth/lib/lodash');

module.exports = _.omit(height, ['none', 'auto', 'prose']);
