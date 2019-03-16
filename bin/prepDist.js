const {
  copyFileSync,
  existsSync,
} = require('fs');
const {
  copySync,
} = require('fs-extra');
const { parse } = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const {
  DIST,
  DIST_PUBLIC,
  DIST_VENDOR,
  SRC_STATIC,
} = require('../conf.app');

if( existsSync(DIST) ) {
  // clean existing files (in the case when the directory already existed)
  rimraf.sync(`${ DIST }/{cjs,public}/**/*`);
  console.log(`\nRemoved pre-existing items in "${ DIST }"`);
}

// create directories
mkdirp.sync(DIST_VENDOR);
console.log(`Created client vendor directory ➜ "${ DIST_VENDOR }"`);
// copy over files
copyFileSync('./conf.app.js', `${ DIST }/conf.app.js`);
console.log(`Copied conf to ➜ "${ DIST }"`);
try {
  copySync(`${ SRC_STATIC }/imgs`, `${ DIST_PUBLIC }/imgs`);
  console.log(`Copied static images to "${ DIST_PUBLIC }/imgs"`);
}catch(err){
  console.error(`[ERROR] Static copy | ${ err }`);
}
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