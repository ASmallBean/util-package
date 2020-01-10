module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    'no-plusplus': 0,
    'jsx-a11y/media-has-caption': 0,
    'template-curly-spacing': 0,
    'max-len': [
      'warn',
      {
        code: 150,
      },
    ],
  },
  globals: {
    API_ENV: true,
    page: true,
    window: true,
  },
};
