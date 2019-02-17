const { resolve } = require('path');

const ROOT = resolve(__dirname, './');
const SRC = `${ ROOT }/src`;
const DIST = 'dist';
const PUBLIC = `${ DIST }/public`;
const DIST_JS = `${ PUBLIC }/js`;

module.exports = {
  APP_NAME: 'TV Renamer',
  DIST,
  DIST_JS,
  DIST_SERVER: `${ DIST }/cjs/server`,
  DIST_VENDOR: `${ DIST_JS }/vendor`,
  ENTRY: `${ SRC }/app.js`,
  PUBLIC,
  SYSTEM_DIST_JS: `${ ROOT }/${ DIST_JS }`,
  SYSTEM_PUBLIC: `${ ROOT }/${ PUBLIC }`,
  aliases: {
    COMPONENTS: `${ SRC }/components`,
    ROOT,
    SRC,
    UTILS: `${ SRC }/utils`,
  },
};