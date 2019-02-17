const repoConf = require('./conf.repo');

module.exports = (api) => {
  api.cache(true);
  
  // map alias' so files resolve
  const aliases = {};
  Object.keys(repoConf.aliases).forEach((alias) => {
    aliases[alias] = repoConf.aliases[alias];
  });
  const moduleResolver = ['module-resolver', {
    alias: aliases,
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
      esm: {
        plugins: [
          moduleResolver,
          'emotion',
        ],
        presets: [
          ['@babel/preset-env', {
            modules: false,
          }],
          '@babel/preset-react',
        ],
      },
    },
  };
};
