import { parse } from 'path';
import walk from './walk';

export default (source, filterFunc) => new Promise((resolve, reject) => {
  walk(source)
    .then((files) => {
      let filtered = (filterFunc) ? files.filter(filterFunc) : files;
      let parsed = filtered.map((path) => {
        const obj = parse(path);
        return {
          dir: obj.dir,
          ext: obj.ext,
          name: obj.name,
        };
      });
      
      return resolve(parsed);
    })
    .catch((err) => reject(err));
});