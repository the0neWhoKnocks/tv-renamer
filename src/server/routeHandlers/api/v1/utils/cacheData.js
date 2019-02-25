import genCacheName from './genCacheName';
import saveFile from './saveFile';

export default ({ data, name, res }) => new Promise((resolve, reject) => {
  const cacheName = genCacheName(name);
  data.cacheKey = cacheName.name;
  data.name = name;
  
  saveFile({
    cb: () => {
      console.log(`Cached series: "${ name }"`);
      return resolve(data);
    },
    data,
    file: cacheName.filePath,
    res,
  });
});