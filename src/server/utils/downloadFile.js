import { createWriteStream } from 'fs';
import { teenyRequest as request } from 'teeny-request';
import logger from './logger';

const log = logger('server:utils:downloadFile');

export default function downloadFile(uri, destination) {
  return new Promise((resolve, reject) => {
    log(`Download "${ uri }"`);
    
    request({ uri, method: 'HEAD' }, (err, resp) => {
      if(err) reject(err);
      else if(resp.statusCode > 299) reject(new Error(`Couldn't download file "${ uri }" | ${ resp.statusCode } | ${ resp.statusMessage }`));
      else{
        request({ uri })
          .pipe(createWriteStream(destination))
          .on('close', resolve);
      }
    });
  });
}