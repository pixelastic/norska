module.exports = {
  version: 1,
  snapshot: {
    widths: [1280],
  },
  'static-snapshots': {
    path: 'modules/docs/dist',
    'snapshot-files': 'percy/**/*.html',
  },
};
