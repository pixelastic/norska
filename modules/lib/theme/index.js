/* eslint-disable node/no-missing-require */
/**
 * This file is loaded by the default src/script.js file of all norska projects
 * It will proxy the require to the src/script.js in the theme.
 * The norskaTheme/ prefix will be redirected by custom aliases in webpack to point to
 * the theme.
 * */
module.exports = require('norskaTheme/src/script.js');
