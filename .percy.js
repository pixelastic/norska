module.exports = {
  version: 1,
  snapshot: {
    widths: [375, 1280],
    'min-height': 1024, // px
    'percy-css': `
      iframe {
        display: none;
      }`,
  },
  'static-snapshots': {
    path: 'modules/docs/dist',
    'snapshot-files': 'tailwind/**/*.html',
  },
};
