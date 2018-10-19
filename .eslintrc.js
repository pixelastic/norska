module.exports = {
  extends: ['algolia', 'algolia/jest'],
  rules: {
    'no-console': 0,
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
