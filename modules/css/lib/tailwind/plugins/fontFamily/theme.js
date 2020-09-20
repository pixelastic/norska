/**
 * https://tailwindcss.com/docs/font-family/
 *
 * Uses the same fonts as Tailwind, but also adds explicit Arial, Verdana and
 * Helvetica font stacks
 **/
const defaultConfig = require('tailwindcss/defaultConfig.js');

module.exports = {
  ...defaultConfig.theme.fontFamily,
  arial: ['Arial', '"Helvetica Neue"', 'Helvetica', 'sans-serif'],
  verdana: ['Verdana', 'Geneva', 'sans-serif'],
  helvetica: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
};
