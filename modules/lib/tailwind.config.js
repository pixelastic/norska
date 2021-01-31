// This file is imported by the default tailwind.config.js in new websites
// It will in turn import the Tailwind config of the theme
// Most theme then simply load the Tailwind config defined in norska-css, but
// some add some extra spice to it
const config = require('norska-config');
module.exports = require(config.themeRootPath('tailwind.config.js'));
