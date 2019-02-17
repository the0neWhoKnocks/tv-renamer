const { aliases } = require('./conf.repo');

module.exports = (api) => {
  api.cache(true);
  
  // map alias' so files resolve
  const _aliases = {};
  Object.keys(aliases).forEach((alias) => {
    _aliases[alias] = aliases[alias];
  });
  const moduleResolver = ['module-resolver', {
    alias: _aliases,
  }];
  
  // Settings used for building npm distributable module
  // https://babeljs.io/docs/en/6.26.3/babel-preset-env
  return {
    env: {
      cjs: {
        plugins: [
          moduleResolver,
          'emotion',
        ],
        presets: [
          ['@babel/preset-env', {
            modules: 'commonjs',
            targets: {
              node: '8.9.1',
            },
          }],
          '@babel/preset-react',
        ],
      },
    },
  };
};
