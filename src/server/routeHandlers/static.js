import { promises as fs } from 'fs';
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

const { readFile, stat } = fs;
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
let pendingRequest;

// On initial load of server, create the file-cache to ensure hashes are
// valid against possibly new files.
async function createFileCache() {
  // NOTE - no try/catch because there's no response to attach the usual error
  // handler to, so just let it throw if there's an error.
  await saveFile(PUBLIC_FILE_CACHE, {});
  log(`[CREATED] ${ PUBLIC_FILE_CACHE }`);
}
createFileCache();

export default async function _static(opts, cleanPath) {
  const file = join(PUBLIC, cleanPath);
  
  const onCacheLoad = async (cache) => {
    const { req, res } = opts;
    const reqEtag = req.headers['if-none-match'];
    
    // No need for file look-ups if the file's been cached, and the Browser
    // already has the file.
    if (cache[file] && cache[file] === reqEtag) {
      pendingRequest = '';
      res.statusCode = 304;
      res.end();
    }
    else {
      try { await stat(file); }
      catch (err) {
        pendingRequest = '';
        return handleError(opts, 404, `File "${ file }" not found! | ${ err.stack }`);
      }
      
      let data;
      try {
        data = await readFile(file);
        
        // use/generate eTag for caching
        const eTag = cache[file] || crypto.createHash('md5').update(data).digest('hex');
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = parse(file).ext;
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', mimeTypes[ext] || 'text/plain');
        res.setHeader('ETag', eTag);
        
        // ensure the cached file is recorded for faster future look-ups
        cache[file] = eTag; // eslint-disable-line require-atomic-updates
      }
      catch (err) {
        pendingRequest = '';
        return handleError(opts, 500, `Error reading file: ${ err }.`);
      }
      
      try {
        await saveFile(PUBLIC_FILE_CACHE, cache);
        pendingRequest = '';
        res.end(data);
      }
      catch (err) {
        pendingRequest = '';
        return handleError(opts, 500, `Error reading file: ${ err }.`);
      }
    }
  };
  
  // Due to there not being any sort of file locking in Node I've created a
  // request queue to ensure that the most current version of the cache is
  // loaded for every request.
  const checkQueue = async () => {
    if (!pendingRequest) {
      pendingRequest = file;
      
      const { data } = await loadFile(PUBLIC_FILE_CACHE);
      onCacheLoad(data);
    }
    else {
      setTimeout(() => {
        checkQueue();
      }, 10);
    }
  };
  
  checkQueue();
}
