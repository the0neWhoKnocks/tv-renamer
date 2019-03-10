import genCacheName from './genCacheName';
import saveFile from './saveFile';

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