import loadFile from 'SERVER/utils/loadFile';
import genCacheName from './genCacheName';

export default ({ cacheKey, index, name }) => new Promise((resolve, reject) => {
  const cacheName = genCacheName(cacheKey || name);
  
  loadFile({
    _default: null,
    cb: (file) => resolve({
      cacheKey: cacheName.name,
      file,
      index,
      name,
    }),
    file: cacheName.filePath,
  });
});