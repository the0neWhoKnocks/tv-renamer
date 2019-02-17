module.exports = {
  extends: '@noxx',
  plugins: [
		'require-jsdoc-except',
	],
  rules: {
    'react/no-unused-prop-types': 1,
    'require-jsdoc': 'off',
		'require-jsdoc-except/require-jsdoc': [ // replaces the default 'require-jsdoc'
      'error',
      {
    		require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: false,
          FunctionDeclaration: true,
          FunctionExpression: true,
          MethodDefinition: true,
    		},
    		ignore: [
          // React functions
          'constructor',
          'componentDidMount',
          'componentDidUpdate',
          'componentWillUnmount',
          'getDerivedStateFromProps',
          'getSnapshotBeforeUpdate',
          'render',
          'shouldComponentUpdate',
        ],
	    },
    ],
	},
};
