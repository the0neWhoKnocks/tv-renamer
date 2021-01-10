import { PUBLIC_CACHE } from 'ROOT/conf.app';
import saveFile from 'SERVER/utils/saveFile';
import logger from 'SERVER/utils/logger';

const log = logger('server:saveCacheItem');

export default function saveCacheItem(cacheKey, cache) {
  log(`Save cache for "${ cacheKey }"`);
  return saveFile(`${ PUBLIC_CACHE }/${ cacheKey }.json`, cache);
}
