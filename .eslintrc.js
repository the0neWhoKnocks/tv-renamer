module.exports = {
  extends: '@noxx',
  plugins: [
		'require-jsdoc-except',
	],
  rules: {
    'react/no-unused-prop-types': 1,
    'require-jsdoc': 'off',
	},
};
