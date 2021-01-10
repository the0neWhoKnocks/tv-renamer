import { PUBLIC_CACHE } from 'ROOT/conf.app';
import loadFile from 'SERVER/utils/loadFile';
import logger from 'SERVER/utils/logger';

const log = logger('server:loadCacheItem');

export default function loadCacheItem(cacheKey) {
  log(`Load cache for "${ cacheKey }"`);
  return loadFile(`${ PUBLIC_CACHE }/${ cacheKey }.json`);
}
