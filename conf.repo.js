const { resolve } = require('path');

const API_PREFIX = '/api/v1';
const TVDB_API = 'https://api.thetvdb.com';
const TVDB__TOKEN__SERIES_ID = '{SERIES_ID}';
const TVDB__TOKEN__SERIES_NAME = '{SERIES_NAME}';
const ROOT = resolve(__dirname, './');
const SRC = `${ ROOT }/src`;
const DIST = 'dist';
const PUBLIC = `${ DIST }/public`;
const DIST_JS = `${ PUBLIC }/js`;
const IGNORE = `${ ROOT }/.ignore`;
const TMP = `${ IGNORE }/tmp`;

module.exports = {
  API__CONFIG: `${ API_PREFIX }/config`,
  API__CONFIG_SAVE: `${ API_PREFIX }/config/save`,
  API__FOLDER_LIST: `${ API_PREFIX }/folder-list`,
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
  TMP,
  TMP_OUTPUT: `${ TMP }/output`,
  TMP_SRC: `${ TMP }/src`,
  TVDB_API__EPISODES_URL: `${ TVDB_API }/series/${ TVDB__TOKEN__SERIES_ID }/episodes`,
  TVDB_API__LANGUAGES_URL: `${ TVDB_API }/languages`,
  TVDB_API__LOGIN_URL: `${ TVDB_API }/login`,
  TVDB_API__SERIES_URL: `${ TVDB_API }/search/series?name=${ TVDB__TOKEN__SERIES_NAME }`,
  TVDB_API__VERSION_HEADER: 'application/vnd.thetvdb.v2.2.0',
  TVDB__TOKEN__SERIES_ID,
  TVDB__TOKEN__SERIES_NAME,
  aliases: {
    COMPONENTS: `${ SRC }/components`,
    ROOT,
    SERVER: `${ SRC }/server`,
    SRC,
    UTILS: `${ SRC }/utils`,
  },
};