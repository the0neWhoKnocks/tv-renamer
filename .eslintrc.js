module.exports = {
  env: {
    es6: true,
  },
  extends: '@noxx',
  ignorePatterns: [
    '/bin/release.js',
  ],
  parserOptions: {
    ecmaVersion: 9,
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
    'object-property-newline': 'off',
    'react/no-unused-prop-types': 1,
    'require-jsdoc': 'off',
	},
  settings: {
    react: {
      version: 'detect',
    },
  },
};
