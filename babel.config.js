const { version } = require('./package.json');
const { aliases } = require('./conf.app');

module.exports = (api) => {
  api.cache(true);
  
  // Settings used for building npm distributable module
  // https://babeljs.io/docs/en/6.26.3/babel-preset-env
  return {
    plugins: [
      ['@noxx/babel-plugin-a2rp', { aliases }],
      ['transform-define', {
        'global.appVersion': `v${ version }`,
      }],
      '@babel/plugin-syntax-dynamic-import',
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
  };
};
