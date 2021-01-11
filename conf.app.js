const { resolve } = require('path');

const API__PREFIX = '/api/v1';
const ROOT = resolve(__dirname, './');
const ABS_DATA_PATH = (process.env.DATA_PATH.startsWith('.'))
  ? resolve(ROOT, process.env.DATA_PATH)
  : process.env.DATA_PATH;
const SRC = `${ ROOT }/src`;
const CACHE_FOLDER_NAME = 'tmdb__cache';
const CONFIG_NAME = 'config.json';
const FILE_CACHE_NAME = 'file-cache.json';
const RENAME_LOG = 'rename.log';
const SERIES_ID_MAP = 'tmdb__series-ids.json';
const SERIES_ID_CACHE_MAP = 'tmdb__ids-cache-map.json';
const TMDB__API__VERSION = '3';
const TMDB__URL__API = `https://api.themoviedb.org/${ TMDB__API__VERSION }`;
const TMDB__URL__DOMAIN = 'https://www.themoviedb.org';
const TMDB__URL__IMG_BASE = 'https://image.tmdb.org/t/p';
const TMDB__TOKEN__EPISODE_GROUP_ID = '{EPISODE_GROUP_ID}';
const TMDB__TOKEN__SEASON_NUMBER = '{SEASON_NUMBER}';
const TMDB__TOKEN__SERIES_ID = '{SERIES_ID}';
const TMDB__TOKEN__SERIES_PAGE = '{SERIES_PAGE}';
const TMDB__TOKEN__SERIES_QUERY = '{SERIES_QUERY}';
const TMDB__TOKEN__SERIES_YEAR = '{SERIES_YEAR}';
const FANART_API__IMAGES = 'http://webservice.fanart.tv/v3/tv';

// https://developers.themoviedb.org/3/tv-episode-groups/get-tv-episode-group-details
const TMDB__EPISODE_GROUP_TYPE__AIR_DATE = 'Original air date';
const TMDB__EPISODE_GROUP_TYPE__ABSOLUTE = 'Absolute';
const TMDB__EPISODE_GROUP_TYPE__DVD = 'DVD';
const TMDB__EPISODE_GROUP_TYPE__DIGITAL = 'Digital';
const TMDB__EPISODE_GROUP_TYPE__STORY_ARC = 'Story arc';
const TMDB__EPISODE_GROUP_TYPE__PRODUCTION = 'Production';
const TMDB__EPISODE_GROUP_TYPE__TV = 'TV';
const TMDB__EPISODE_GROUPS = new Map();
TMDB__EPISODE_GROUPS.set(1, TMDB__EPISODE_GROUP_TYPE__AIR_DATE);
TMDB__EPISODE_GROUPS.set(2, TMDB__EPISODE_GROUP_TYPE__ABSOLUTE);
TMDB__EPISODE_GROUPS.set(3, TMDB__EPISODE_GROUP_TYPE__DVD);
TMDB__EPISODE_GROUPS.set(4, TMDB__EPISODE_GROUP_TYPE__DIGITAL);
TMDB__EPISODE_GROUPS.set(5, TMDB__EPISODE_GROUP_TYPE__STORY_ARC);
TMDB__EPISODE_GROUPS.set(6, TMDB__EPISODE_GROUP_TYPE__PRODUCTION);
TMDB__EPISODE_GROUPS.set(7, TMDB__EPISODE_GROUP_TYPE__TV);

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
  API__SERIES_MATCHES: `${ API__PREFIX }/series-matches`,  
  APP_NAME: 'TV Renamer',
  DIST,
  DIST_CJS,
  DIST_JS,
  DIST_PUBLIC,
  DIST_SERVER: `${ DIST_CJS }/server`,
  DIST_VENDOR,
  DOCKER_API__RELEASES: 'https://hub.docker.com/v2/repositories/theonewhoknocks/tv-renamer/tags/',
  FANART_API__IMAGES,
  PUBLIC,
  PUBLIC_CACHE: `${ ABS_DATA_PATH }/${ CACHE_FOLDER_NAME }`,
  PUBLIC_CONFIG: `${ ABS_DATA_PATH }/${ CONFIG_NAME }`,
  PUBLIC_FILE_CACHE: `${ ABS_DATA_PATH }/${ FILE_CACHE_NAME }`,
  PUBLIC_JS,
  PUBLIC_MANIFEST,
  PUBLIC_RENAME_LOG: `${ ABS_DATA_PATH }/${ RENAME_LOG }`,
  PUBLIC_SERIES_ID_MAP: `${ ABS_DATA_PATH }/${ SERIES_ID_MAP }`,
  PUBLIC_SERIES_ID_CACHE_MAP: `${ ABS_DATA_PATH }/${ SERIES_ID_CACHE_MAP }`,
  PUBLIC_VENDOR,
  SRC_STATIC: `${ SRC }/static`,
  STORAGE_KEY: 'tvrenamer',
  TMDB__API__SEASON_EPISODES: `${ TMDB__URL__API }/tv/${ TMDB__TOKEN__SERIES_ID }/season/${ TMDB__TOKEN__SEASON_NUMBER }`,
  TMDB__API__SEASON_EPISODE_GROUP: `${ TMDB__URL__API }/tv/episode_group/${ TMDB__TOKEN__EPISODE_GROUP_ID }`,
  TMDB__API__SERIES_DETAILS: `${ TMDB__URL__API }/tv/${ TMDB__TOKEN__SERIES_ID }?append_to_response=episode_groups,content_ratings,aggregate_credits,external_ids`,
  TMDB__API__SERIES_SEARCH: `${ TMDB__URL__API }/search/tv?page=${ TMDB__TOKEN__SERIES_PAGE }&query=${ TMDB__TOKEN__SERIES_QUERY }&include_adult=false&first_air_date_year=${ TMDB__TOKEN__SERIES_YEAR }`,
  TMDB__EPISODE_GROUP_TYPE__AIR_DATE,
  TMDB__EPISODE_GROUP_TYPE__ABSOLUTE,
  TMDB__EPISODE_GROUP_TYPE__DVD,
  TMDB__EPISODE_GROUP_TYPE__DIGITAL,
  TMDB__EPISODE_GROUP_TYPE__STORY_ARC,
  TMDB__EPISODE_GROUP_TYPE__PRODUCTION,
  TMDB__EPISODE_GROUP_TYPE__TV,
  TMDB__EPISODE_GROUPS,
  TMDB__TOKEN__EPISODE_GROUP_ID,
  TMDB__TOKEN__SEASON_NUMBER,
  TMDB__TOKEN__SERIES_ID,
  TMDB__TOKEN__SERIES_PAGE,
  TMDB__TOKEN__SERIES_QUERY,
  TMDB__TOKEN__SERIES_YEAR,
  TMDB__URL__QUERY: `${ TMDB__URL__DOMAIN }/search/tv?query=${ TMDB__TOKEN__SERIES_QUERY }`,
  TMDB__URL__SERIES: `${ TMDB__URL__DOMAIN }/tv/${ TMDB__TOKEN__SERIES_ID }`,
  // NOTE - domain and image sizes are found here https://developers.themoviedb.org/3/configuration/get-api-configuration
  TMDB__URL__BACKGROUND: `${ TMDB__URL__IMG_BASE }/w1280`,
  TMDB__URL__EPISODE_STILLS: `${ TMDB__URL__IMG_BASE }/w400`, // custom size not listed in API, but still works
  TMDB__URL__POSTER: `${ TMDB__URL__IMG_BASE }/w780`,
  TMDB__URL__THUMBNAILS: `${ TMDB__URL__IMG_BASE }/w154`,
  VERSION__CACHE_SCHEMA: 4,
  WP__ENTRY: `${ SRC }/app.js`,
  WP__OUTPUT: DIST_JS,
  WS__MSG_TYPE__RENAME_STATUS: 'rename status',
  aliases: {
    COMPONENTS: `${ SRC }/components`,
    ROOT,
    SERVER: `${ SRC }/server`,
    SRC,
    UTILS: `${ SRC }/utils`,
  },
};