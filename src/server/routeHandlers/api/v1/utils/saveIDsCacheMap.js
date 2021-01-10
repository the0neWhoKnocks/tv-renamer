import { PUBLIC_SERIES_ID_CACHE_MAP } from 'ROOT/conf.app';
import saveFile from 'SERVER/utils/saveFile';
import logger from 'SERVER/utils/logger';

const log = logger('server:saveIDsCacheMap');

export default function saveIDsCacheMap(idMap) {
  log('Saving ID Cache Map');
  return saveFile(PUBLIC_SERIES_ID_CACHE_MAP, idMap);
}
