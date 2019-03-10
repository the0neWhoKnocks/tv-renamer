import genCacheName from './genCacheName';
import loadFile from './loadFile';

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