import genCacheName from './genCacheName';
import loadFile from './loadFile';

export default (name) => new Promise((resolve, reject) => {
  loadFile({
    _default: null,
    cb: (file) => resolve({ file, name }),
    file: genCacheName(name).filePath,
  });
});