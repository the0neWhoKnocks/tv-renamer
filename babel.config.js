const { parse, relative } = require('path');
const {
  repository: { url: gitURL },
  version,
} = require('./package.json');
const { aliases } = require('./conf.app');

const repoData = gitURL.match(/.*github\.com\/(.*)\/(.*)\.git/);
const REPO_OWNER = repoData[1];
const REPO_NAME = repoData[2];

module.exports = (api) => {
  api.cache(true);
  
  // map alias' so files resolve
  const _aliases = {};
  const aliasKeys = [];
  Object.keys(aliases).forEach((alias) => {
    _aliases[alias] = aliases[alias];
    aliasKeys.push(alias);
  });
  const aliasRegEx = new RegExp(`^(${ aliasKeys.join('|') })`);
  const moduleResolver = ['module-resolver', {
    alias: _aliases,
    resolvePath(sourcePath, currentFile, opts) {
      const match = sourcePath.match(aliasRegEx);
      
      if( match ){
        const alias = match[1];
        const transformed = sourcePath.replace(alias, _aliases[alias]);
        let relativePath = relative(
          parse(currentFile).dir,
          transformed
        );
        
        if(!relativePath.startsWith('.')) relativePath = `./${ relativePath }`;
        
        // console.log(
        //   '---\n',
        //   `file: ${ currentFile }\n`,
        //   `requested: ${ transformed }\n`,
        //   `relative: ${ relativePath }\n`,
        // );
        
        return relativePath;
      }
      
      return sourcePath;
    },
  }];
  
  // Settings used for building npm distributable module
  // https://babeljs.io/docs/en/6.26.3/babel-preset-env
  return {
    plugins: [
      moduleResolver,
      ['transform-define', {
        'global.REPO_NAME': REPO_NAME,
        'global.REPO_OWNER': REPO_OWNER,
        'global.appVersion': `v${ version }`,
      }],
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
