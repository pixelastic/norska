/* eslint-disable import/no-commonjs */
const config = require('norska/build/tailwind.config.js');
module.exports = {
  // norska comes preloaded with its custom Tailwind config
  // See https://github.com/pixelastic/tailwind-config-norska for details
  ...config,
  // But you can extend/overwrite it with your own
  // See the official Tailwind doc for details:
  // https://tailwindcss.com/docs/configuration
};
