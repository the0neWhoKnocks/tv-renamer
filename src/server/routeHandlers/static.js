import { exists, readFile } from 'fs';
import crypto from 'crypto';
import { join, parse } from 'path';
import {
  PUBLIC,
  PUBLIC_FILE_CACHE,
} from 'ROOT/conf.app';
import loadFile from 'SERVER/utils/loadFile';
import logger from 'SERVER/utils/logger';
import saveFile from 'SERVER/utils/saveFile';
import handleError from './error';

const log = logger('server:static');

const mimeTypes = {
  '.css': 'text/css',
  '.eot': 'appliaction/vnd.ms-fontobject',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'aplication/font-sfnt',
};

// On initial load of server, create the file-cache to ensure hashes are
// valid against possibly new files.
saveFile({
  cb: () => {
    log(`[CREATED] ${ PUBLIC_FILE_CACHE }`);
  },
  data: {},
  file: PUBLIC_FILE_CACHE,
});
let pendingRequest;

export default (opts, cleanPath) => {
  const file = join(PUBLIC, cleanPath);
  
  const onCacheLoad = (cache) => {
    const { req, res } = opts;
    const reqEtag = req.headers['if-none-match'];
    
    // No need for file look-ups if the file's been cached, and the Browser
    // already has the file.
    if(cache[file] && cache[file] === reqEtag){
      pendingRequest = '';
      res.statusCode = 304;
      res.end();
    }
    else{
      exists(file, (exist) => {
        if(!exist) {
          pendingRequest = '';
          handleError(opts, 404, `File ${ file } not found!`);
        }
        else{
          // read file from file system
          readFile(file, (err, data) => {
            if(err){
              pendingRequest = '';
              handleError(opts, 500, `Error reading file: ${ err }.`);
            }
            else{
              // use/generate eTag for caching
              const eTag = cache[file] || crypto.createHash('md5').update(data).digest('hex');
              // based on the URL path, extract the file extention. e.g. .js, .doc, ...
              const ext = parse(file).ext;
              // if the file is found, set Content-type and send data
              res.setHeader('Content-type', mimeTypes[ext] || 'text/plain');
              res.setHeader('ETag', eTag);
              
              // ensure the cached file is recorded for faster future look-ups
              cache[file] = eTag;
              saveFile({
                cb: () => {
                  pendingRequest = '';
                  res.end(data);
                },
                data: cache,
                file: PUBLIC_FILE_CACHE,
                sync: true,
              });
            }
          });
        }
      });
    }
  };
  
  // Due to there not being any sort of file locking in Node I've created a
  // request queue to ensure that the most current version of the cache is
  // loaded for every request.
  const checkQueue = () => {
    if(!pendingRequest){
      pendingRequest = file;
      
      loadFile({
        cb: onCacheLoad,
        file: PUBLIC_FILE_CACHE,
      });
    }
    else{
      setTimeout(() => {
        checkQueue();
      }, 10);
    }
  };
  
  checkQueue();
};