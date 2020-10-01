const { resolve } = require('path');

const API__PREFIX = '/api/v1';
const ROOT = resolve(__dirname, './');
const SRC = `${ ROOT }/src`;
const DATA_FOLDER_NAME = '.data';
const CACHE_FOLDER_NAME = 'tmdb__cache';
const CONFIG_NAME = 'config.json';
const FILE_CACHE_NAME = 'file-cache.json';
const RENAME_LOG = 'rename.log';
const SERIES_ID_MAP = 'tmdb__series-ids.json';
const SERIES_ID_CACHE_MAP = 'tmdb__ids-cache-map.json';
const TMDB__API__VERSION = '3';
const TMDB__URL__API = `https://api.themoviedb.org/${ TMDB__API__VERSION }`;
const TMDB__URL__DOMAIN = 'https://www.themoviedb.org';
const TMDB__TOKEN__EPISODE_GROUP_ID = '{EPISODE_GROUP_ID}';
const TMDB__TOKEN__SEASON_NUMBER = '{SEASON_NUMBER}';
const TMDB__TOKEN__SERIES_ID = '{SERIES_ID}';
const TMDB__TOKEN__SERIES_QUERY = '{SERIES_QUERY}';
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

module.exports = {
  API__ASSIGN_ID: `${ API__PREFIX }/assign-id`,
  API__CONFIG: `${ API__PREFIX }/config`,
  API__CONFIG_SAVE: `${ API__PREFIX }/config/save`,
  API__DELETE_FILE: `${ API__PREFIX }/delete-file`,
  API__FILES_LIST: `${ API__PREFIX }/files-list`,
  API__FOLDER_LIST: `${ API__PREFIX }/folder-list`,
  API__IDS: `${ API__PREFIX }/ids`,
  API__LOGS: `${ API__PREFIX }/logs`,
  API__PREVIEW_RENAME: `${ API__PREFIX }/preview`,
  API__RELEASES: `${ API__PREFIX }/releases`,
  API__RENAME: `${ API__PREFIX }/rename`,
  API__REPLACE: `${ API__PREFIX }/replace`,  
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
  TMDB__API__SEASON_EPISODES: `${ TMDB__URL__API }/tv/${ TMDB__TOKEN__SERIES_ID }/season/${ TMDB__TOKEN__SEASON_NUMBER }`,
  TMDB__API__SEASON_EPISODE_GROUP: `${ TMDB__URL__API }/tv/episode_group/${ TMDB__TOKEN__EPISODE_GROUP_ID }`,
  TMDB__API__SERIES_DETAILS: `${ TMDB__URL__API }/tv/${ TMDB__TOKEN__SERIES_ID }?append_to_response=episode_groups`,
  TMDB__API__SERIES_SEARCH: `${ TMDB__URL__API }/search/tv?page=1&query=${ TMDB__TOKEN__SERIES_QUERY }&include_adult=false`,
  TMDB__TOKEN__EPISODE_GROUP_ID,
  TMDB__TOKEN__SEASON_NUMBER,
  TMDB__TOKEN__SERIES_ID,
  TMDB__TOKEN__SERIES_QUERY,
  TMDB__URL__QUERY: `${ TMDB__URL__DOMAIN }/search?query=${ TMDB__TOKEN__SERIES_QUERY }`,
  TMDB__URL__SERIES: `${ TMDB__URL__DOMAIN }/tv/${ TMDB__TOKEN__SERIES_ID }`,
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