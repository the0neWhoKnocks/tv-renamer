const { resolve } = require('path');

const API_PREFIX = '/api/v1';
const GIT_API = 'https://api.github.com';
const TVDB_API = 'https://api.thetvdb.com';
const TVDB_URL = 'https://www.thetvdb.com';
const TVDB__TOKEN__PAGE_NUM = '{PAGE_NUM}';
const TVDB__TOKEN__SERIES_ID = '{SERIES_ID}';
const TVDB__TOKEN__SERIES_NAME = '{SERIES_NAME}';
const TVDB__TOKEN__SERIES_SLUG = '{SERIES_SLUG}';
const TVDB__TOKEN__SERIES_QUERY = '{SERIES_QUERY}';
const ROOT = resolve(__dirname, './');
const SRC = `${ ROOT }/src`;
const CACHE_FOLDER_NAME = '.cache';
const RENAME_LOG = 'rename.log';
const SERIES_ID_MAP = 'series-ids.json';
const SERIES_ID_CACHE_MAP = '.idsCacheMap';
// NOTE - Anything pointing to DIST is top-level, should only be used in
// development. When the App is packaged up, the context will shift to within
// the `dist` directory.
const DIST = `${ ROOT }/dist`;
const DIST_CACHE = `${ DIST }/${ CACHE_FOLDER_NAME }`;
const DIST_CJS = `${ DIST }/cjs`;
const DIST_PUBLIC = `${ DIST }/public`;
const DIST_JS = `${ DIST_PUBLIC }/js`;
const DIST_RENAME_LOG = `${ DIST }/${ RENAME_LOG }`;
const DIST_VENDOR = `${ DIST_JS }/vendor`;
// NOTE - Anything pointing to PUBLIC is assuming the production context where
// everything is executing from within the `dist` directory.
const PUBLIC = `${ ROOT }/public`;
const PUBLIC_CACHE = `${ ROOT }/${ CACHE_FOLDER_NAME }`;
const PUBLIC_CONFIG = `${ ROOT }/.config`;
const PUBLIC_JS = `${ PUBLIC }/js`;
const PUBLIC_MANIFEST = `${ PUBLIC_JS }/manifest.json`;
const PUBLIC_RENAME_LOG = `${ ROOT }/${ RENAME_LOG }`;
const PUBLIC_VENDOR = `${ PUBLIC }/js/vendor`;
const IGNORE = `${ ROOT }/.ignore`;
const TMP = `${ IGNORE }/tmp`;

module.exports = {
  API__ASSIGN_ID: `${ API_PREFIX }/assign-id`,
  API__CONFIG: `${ API_PREFIX }/config`,
  API__CONFIG_SAVE: `${ API_PREFIX }/config/save`,
  API__FILES_LIST: `${ API_PREFIX }/files-list`,
  API__FOLDER_LIST: `${ API_PREFIX }/folder-list`,
  API__IDS: `${ API_PREFIX }/ids`,
  API__JWT: `${ API_PREFIX }/jwt`,
  API__LOGS: `${ API_PREFIX }/logs`,
  API__PREVIEW_RENAME: `${ API_PREFIX }/preview`,
  API__RENAME: `${ API_PREFIX }/rename`,
  APP_NAME: 'TV Renamer',
  DIST,
  DIST_CACHE,
  DIST_CJS,
  DIST_JS,
  DIST_PUBLIC,
  DIST_SERVER: `${ DIST_CJS }/server`,
  DIST_RENAME_LOG,
  DIST_SERIES_ID_MAP: `${ DIST }/${ SERIES_ID_MAP }`,
  DIST_SERIES_ID_CACHE_MAP: `${ DIST }/${ SERIES_ID_CACHE_MAP }`,
  DIST_VENDOR,
  GIT_API__RELEASES: `${ GIT_API }/repos/${ global.REPO_OWNER }/${ global.REPO_NAME }/releases`,
  PUBLIC,
  PUBLIC_CACHE,
  PUBLIC_CONFIG,
  PUBLIC_JS,
  PUBLIC_MANIFEST,
  PUBLIC_RENAME_LOG,
  PUBLIC_SERIES_ID_MAP: `${ ROOT }/${ SERIES_ID_MAP }`,
  PUBLIC_SERIES_ID_CACHE_MAP: `${ ROOT }/${ SERIES_ID_CACHE_MAP }`,
  PUBLIC_VENDOR,
  SRC_STATIC: `${ SRC }/static`,
  TMP,
  TMP_OUTPUT: `${ TMP }/output`,
  TMP_SRC: `${ TMP }/src`,
  TVDB_QUERY_URL: `${ TVDB_URL }/search?q=${ TVDB__TOKEN__SERIES_QUERY }&l=en`,
  TVDB_SERIES_URL: `${ TVDB_URL }/series/${ TVDB__TOKEN__SERIES_SLUG }`,
  TVDB_API__EPISODES_URL: `${ TVDB_API }/series/${ TVDB__TOKEN__SERIES_ID }/episodes?page=${ TVDB__TOKEN__PAGE_NUM }`,
  TVDB_API__LANGUAGES_URL: `${ TVDB_API }/languages`,
  TVDB_API__LOGIN_URL: `${ TVDB_API }/login`,
  TVDB_API__SERIES: `${ TVDB_API }/series/${ TVDB__TOKEN__SERIES_ID }`,
  TVDB_API__SERIES_SEARCH: `${ TVDB_API }/search/series?name=${ TVDB__TOKEN__SERIES_NAME }`,
  TVDB_API__VERSION_HEADER: 'application/vnd.thetvdb.v2.2.0',
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