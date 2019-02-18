const { resolve } = require('path');

const ROOT = resolve(__dirname, './');
const SRC = `${ ROOT }/src`;
const DIST = 'dist';
const PUBLIC = `${ DIST }/public`;
const DIST_JS = `${ PUBLIC }/js`;
const API_PREFIX = '/api/v1';

module.exports = {
  API__CONFIG: `${ API_PREFIX }/config`,
  API__CONFIG_SAVE: `${ API_PREFIX }/config/save`,
  API__JWT: `${ API_PREFIX }/jwt`,
  API__SERIES_ID: `${ API_PREFIX }/series`,
  API__SERIES_EPISODES: `${ API_PREFIX }/episodes`,
  APP_NAME: 'TV Renamer',
  CONFIG_PATH: `${ ROOT }/.config`,
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
    SERVER: `${ SRC }/server`,
    SRC,
    UTILS: `${ SRC }/utils`,
  },
};