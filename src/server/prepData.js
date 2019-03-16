import {
  existsSync,
  writeFileSync,
} from 'fs';
import mkdirp from 'mkdirp';
import {
  PUBLIC_CACHE,
  PUBLIC_RENAME_LOG,
  PUBLIC_SERIES_ID_CACHE_MAP,
  PUBLIC_SERIES_ID_MAP,
} from 'ROOT/conf.app';

/**
 * On start-up, create files and folders so I don't have to verify something
 * is there before I try to write to it.
 */

export default () => {
  // create directories
  [
    { name: 'cache', path: PUBLIC_CACHE },
  ].forEach(({ name, path }) => {
    if(!existsSync(path)) {
      mkdirp.sync(path);
      console.log(`Created "${ name }" directory ➜ "${ path }"`);
    }
  });

  // create files
  [
    { name: 'log', path: PUBLIC_RENAME_LOG, _default: '[]' },
    { name: 'id cache map', path: PUBLIC_SERIES_ID_CACHE_MAP, _default: '{}' },
    { name: 'id map', path: PUBLIC_SERIES_ID_MAP, _default: '{}' },
  ].forEach(({ name, path, _default }) => {
    try {
      writeFileSync(path, _default, { encoding: 'utf8', flag: 'wx' });
      console.log(`Created "${ name }" file ➜ "${ path }"`);
    }catch(err){ /* errors mean the file already exists, which doesn't matter */ }
  });
};
