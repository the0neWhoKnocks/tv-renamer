import saveFile from 'SERVER/utils/saveFile';
import genCacheName from './genCacheName';

export default ({ data, name, res }) => new Promise((resolve, reject) => {
  const cacheName = genCacheName(data.name);
  data.cacheKey = cacheName.name;
  
  saveFile({
    cb: () => {
      console.log(`Cached series: "${ data.name }"`);
      return resolve(data);
    },
    data,
    file: cacheName.filePath,
    res,
  });
});