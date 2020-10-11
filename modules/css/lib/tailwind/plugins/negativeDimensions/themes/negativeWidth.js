const width = require('../../../themes/width.js');
const _ = require('golgoth/lib/lodash');

module.exports = _.omit(width, ['none', 'auto', 'prose']);
