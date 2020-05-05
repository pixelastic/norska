const config = require('tailwind-config-norska');

// Specifically disable the builtin purge inside Tailwind, because we already
// purge as part of our build
config.purge = false;

module.exports = config;
