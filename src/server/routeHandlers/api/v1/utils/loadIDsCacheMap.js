import { PUBLIC_SERIES_ID_CACHE_MAP } from 'ROOT/conf.app';
import loadFile from 'SERVER/utils/loadFile';
import logger from 'SERVER/utils/logger';

const log = logger('server:loadIDsCacheMap');

export default function loadIDsCacheMap() {
  log('Load ID Cache Map');
  return loadFile(PUBLIC_SERIES_ID_CACHE_MAP);
}
