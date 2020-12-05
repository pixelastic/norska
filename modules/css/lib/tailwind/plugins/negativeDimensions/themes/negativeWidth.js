const width = require('../../../themes/width.js');
const _ = require('golgoth/lodash');

module.exports = _.omit(width, ['none', 'auto', 'prose']);
