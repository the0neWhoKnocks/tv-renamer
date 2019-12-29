const { resolve } = require('path');

const API_PREFIX = '/api/v1';
const TVDB_API = 'https://api.thetvdb.com';
const TVDB_URL = 'https://www.thetvdb.com';
const TVDB__TOKEN__PAGE_NUM = '{PAGE_NUM}';
const TVDB__TOKEN__SERIES_ID = '{SERIES_ID}';
const TVDB__TOKEN__SERIES_NAME = '{SERIES_NAME}';
const TVDB__TOKEN__SERIES_SLUG = '{SERIES_SLUG}';
const TVDB__TOKEN__SERIES_QUERY = '{SERIES_QUERY}';
const ROOT = resolve(__dirname, './');
const SRC = `${ ROOT }/src`;
const DATA_FOLDER_NAME = '.data';
const CACHE_FOLDER_NAME = 'cache';
const CONFIG_NAME = 'config.json';
const FILE_CACHE_NAME = 'file-cache.json';
const RENAME_LOG = 'rename.log';
const SERIES_ID_MAP = 'series-ids.json';
const SERIES_ID_CACHE_MAP = 'ids-cache-map.json';
// NOTE - Anything pointing to DIST is top-level, should only be used in
// development. When the App is packaged up, the context will shift to within
// the `dist` directory.
const DIST = `${ ROOT }/dist`;
const DIST_CJS = `${ DIST }/cjs`;
const DIST_PUBLIC = `${ DIST }/public`;
const DIST_JS = `${ DIST_PUBLIC }/js`;
const DIST_VENDOR = `${ DIST_JS }/vendor`;
// NOTE - Anything pointing to PUBLIC is assuming the production context where
// everything is executing from within the `dist` directory.
const PUBLIC = `${ ROOT }/public`;
const PUBLIC_JS = `${ PUBLIC }/js`;
const PUBLIC_MANIFEST = `${ PUBLIC_JS }/manifest.json`;
const PUBLIC_VENDOR = `${ PUBLIC }/js/vendor`;
const IGNORE = `${ ROOT }/.ignore`;
const TMP = `${ IGNORE }/tmp`;

module.exports = {
  API__ASSIGN_ID: `${ API_PREFIX }/assign-id`,
  API__CONFIG: `${ API_PREFIX }/config`,
  API__CONFIG_SAVE: `${ API_PREFIX }/config/save`,
  API__DELETE_FILE: `${ API_PREFIX }/delete-file`,
  API__FILES_LIST: `${ API_PREFIX }/files-list`,
  API__FOLDER_LIST: `${ API_PREFIX }/folder-list`,
  API__IDS: `${ API_PREFIX }/ids`,
  API__JWT: `${ API_PREFIX }/jwt`,
  API__LOGS: `${ API_PREFIX }/logs`,
  API__PREVIEW_RENAME: `${ API_PREFIX }/preview`,
  API__RENAME: `${ API_PREFIX }/rename`,
  API__RELEASES: `${ API_PREFIX }/releases`,
  APP_NAME: 'TV Renamer',
  DIST,
  DIST_CJS,
  DIST_JS,
  DIST_PUBLIC,
  DIST_SERVER: `${ DIST_CJS }/server`,
  DIST_VENDOR,
  DOCKER_API__RELEASES: 'https://hub.docker.com/v2/repositories/theonewhoknocks/tv-renamer/tags/',
  PUBLIC,
  PUBLIC_CACHE: `${ ROOT }/${ DATA_FOLDER_NAME }/${ CACHE_FOLDER_NAME }`,
  PUBLIC_CONFIG: `${ ROOT }/${ DATA_FOLDER_NAME }/${ CONFIG_NAME }`,
  PUBLIC_FILE_CACHE: `${ ROOT }/${ DATA_FOLDER_NAME }/${ FILE_CACHE_NAME }`,
  PUBLIC_JS,
  PUBLIC_MANIFEST,
  PUBLIC_RENAME_LOG: `${ ROOT }/${ DATA_FOLDER_NAME }/${ RENAME_LOG }`,
  PUBLIC_SERIES_ID_MAP: `${ ROOT }/${ DATA_FOLDER_NAME }/${ SERIES_ID_MAP }`,
  PUBLIC_SERIES_ID_CACHE_MAP: `${ ROOT }/${ DATA_FOLDER_NAME }/${ SERIES_ID_CACHE_MAP }`,
  PUBLIC_VENDOR,
  SRC_STATIC: `${ SRC }/static`,
  TMP,
  TMP_OUTPUT: `${ TMP }/output`,
  TMP_SRC: `${ TMP }/src`,
  TVDB_QUERY_URL: `${ TVDB_URL }/search?query=${ TVDB__TOKEN__SERIES_QUERY }`,
  TVDB_SERIES_URL: `${ TVDB_URL }/series/${ TVDB__TOKEN__SERIES_SLUG }`,
  TVDB_API__EPISODES_URL: `${ TVDB_API }/series/${ TVDB__TOKEN__SERIES_ID }/episodes?page=${ TVDB__TOKEN__PAGE_NUM }`,
  TVDB_API__LANGUAGES_URL: `${ TVDB_API }/languages`,
  TVDB_API__LOGIN_URL: `${ TVDB_API }/login`,
  TVDB_API__SERIES: `${ TVDB_API }/series/${ TVDB__TOKEN__SERIES_ID }`,
  TVDB_API__SERIES_SEARCH: `${ TVDB_API }/search/series?name=${ TVDB__TOKEN__SERIES_NAME }`,
  TVDB_API__VERSION_HEADER: 'application/vnd.thetvdb.v3.0.0',
  TVDB__TOKEN__PAGE_NUM,
  TVDB__TOKEN__SERIES_ID,
  TVDB__TOKEN__SERIES_NAME,
  TVDB__TOKEN__SERIES_SLUG,
  TVDB__TOKEN__SERIES_QUERY,
  WP__ENTRY: `${ SRC }/app.js`,
  WP__OUTPUT: DIST_JS,
  aliases: {
    COMPONENTS: `${ SRC }/components`,
    ROOT,
    SERVER: `${ SRC }/server`,
    SRC,
    UTILS: `${ SRC }/utils`,
  },
};