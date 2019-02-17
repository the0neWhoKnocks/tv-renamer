const {
  closeSync,
  copyFileSync,
  existsSync,
  openSync,
} = require('fs');
const { parse } = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const {
  DIST,
  DIST_JS,
  DIST_VENDOR,
} = require('../conf.repo');

if( existsSync(DIST) ) {
  // clean existing files (in the case when the directory already existed)
  rimraf.sync(`${ DIST }/*`);
  console.log(`\nRemoved pre-existing items in "${ DIST }"`);
}

// create directory
mkdirp.sync(DIST_VENDOR);
console.log(`Created client vendor directory ➜ "${ DIST_VENDOR }"`);
// create temp manifest file, otherwise nodemon won't watch for changes
closeSync(openSync(`${ DIST_JS }/manifest.json`, 'w'));
console.log('Created temp manifest file');
// copy over files
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