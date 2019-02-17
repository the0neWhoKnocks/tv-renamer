const { copyFileSync } = require('fs');
const { parse } = require('path');
const mkdirp = require('mkdirp');
const { paths } = require('../conf.repo');

const outputPath = `${ paths.OUTPUT }/js`;

// create directory
mkdirp.sync(outputPath);
console.log(`\nCreated dist directory ➜ "${ outputPath }"`);
// copy over files
[
  'node_modules/react/umd/react.development.js',
  'node_modules/react/umd/react.production.min.js',
  'node_modules/react-dom/umd/react-dom.development.js',
  'node_modules/react-dom/umd/react-dom.production.min.js',
].forEach((filePath) => {
  const output = `${ outputPath }/${ parse(filePath).base }`;
  copyFileSync(filePath, output);
  console.log(`  Copied file to ➜ "${ output }"`);
});