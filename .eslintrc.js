module.exports = {
  extends: '@noxx',
  plugins: [
		'require-jsdoc-except',
	],
  rules: {
    'object-property-newline': 'off',
    'react/no-unused-prop-types': 1,
    'require-jsdoc': 'off',
	},
};
