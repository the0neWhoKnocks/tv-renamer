import logger from 'SERVER/utils/logger';
import saveFile from 'SERVER/utils/saveFile';
import genCacheName from './genCacheName';

const log = logger('server:cacheData');

export default ({ data }) => new Promise((resolve, reject) => {
  const cacheName = genCacheName(data.name);
  data.cacheKey = cacheName.name;
  
  saveFile({
    cb: () => {
      log(`Cached series: "${ data.name }"`);
      return resolve(data);
    },
    data,
    file: cacheName.filePath,
  });
});