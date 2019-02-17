import { exists, readFile } from 'fs';
import { join, parse } from 'path';
import { SYSTEM_PUBLIC } from 'ROOT/conf.repo';
import handleError from './error';

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

export default (res, cleanPath) => {
  const file = join(SYSTEM_PUBLIC, cleanPath);
  
  exists(file, (exist) => {
    if(!exist) {
      handleError(res, 404, `File ${ file } not found!`);
      return;
    }

    // read file from file system
    readFile(file, (err, data) => {
      if(err){
        handleError(res, 500, `Error reading file: ${ err }.`);
      }
      else{
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = parse(file).ext;
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', mimeTypes[ext] || 'text/plain' );
        res.end(data);
      }
    });
  });
};