const {
  copyFileSync,
  existsSync,
  writeFileSync,
} = require('fs');
const { parse } = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const {
  DIST,
  DIST_CACHE,
  DIST_RENAME_LOG,
  DIST_VENDOR,
} = require('../conf.app');

if( existsSync(DIST) ) {
  // clean existing files (in the case when the directory already existed)
  rimraf.sync(`${ DIST }/{cjs,public}/**/*`);
  console.log(`\nRemoved pre-existing items in "${ DIST }"`);
}

// create directories
mkdirp.sync(DIST_CACHE);
console.log(`Created cache directory ➜ "${ DIST_CACHE }"`);
mkdirp.sync(DIST_VENDOR);
console.log(`Created client vendor directory ➜ "${ DIST_VENDOR }"`);
// create files
try {
  writeFileSync(DIST_RENAME_LOG, '[]', { encoding: 'utf8', flag: 'wx' });
  console.log(`Created log file ➜ "${ DIST_RENAME_LOG }"`);
}catch(err){ /* errors mean the files already exist, which doesn't matter */ }
// copy over files
copyFileSync('./conf.app.js', `${ DIST }/conf.app.js`);
console.log(`Copied conf to ➜ "${ DIST }"`);
[
  'node_modules/react/umd/react.development.js',
  'node_modules/react/umd/react.production.min.js',
  'node_modules/react-dom/umd/react-dom.development.js',
  'node_modules/react-dom/umd/react-dom.production.min.js',
].forEach((filePath) => {
  const output = `${ DIST_VENDOR }/${ parse(filePath).base }`;
  copyFileSync(filePath, output);
  console.log(`Copied vendor file to ➜ "${ output }"`);
});