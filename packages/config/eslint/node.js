// @ts-check
const base = require('./base');

/** ESLint flat config for Node/Express server workspaces. */
module.exports = [
  ...base,
  {
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
];
