module.exports = {
  env: {
    es6: true,
  },
  extends: '@noxx',
  ignorePatterns: [
    '/bin/release.js',
  ],
  parserOptions: {
    allowImportExportEverywhere: true,
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
		'require-jsdoc-except',
	],
  rules: {
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      exports: 'always-multiline',
      functions: 'only-multiline',
      imports: 'always-multiline',
      objects: 'always-multiline',
    }],
    'keyword-spacing': ['error', { after: true, before: true }],
    'object-property-newline': 'off',
    'react/no-unused-prop-types': 'error',
    'require-jsdoc': 'off',
    'space-before-blocks': ['error', 'always'],
	},
  settings: {
    react: {
      version: 'detect',
    },
  },
};
