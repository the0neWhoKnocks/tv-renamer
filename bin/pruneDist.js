const { unlinkSync } = require('fs');
const {
  DIST_CJS,
  DIST_SERVER,
} = require('../conf.app');

[
  `${ DIST_CJS }/app.js`,
  `${ DIST_SERVER }/watcher.js`,
].forEach((file) => {
  unlinkSync(file);
  console.log(`Pruned file: "${ file }"`);
});