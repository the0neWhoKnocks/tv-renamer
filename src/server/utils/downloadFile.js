import { createWriteStream } from 'fs';
import { teenyRequest as request } from 'teeny-request';
import logger from './logger';

const log = logger('server:utils:downloadFile');

// Retry vals
// retry: {
//   reasons: [
//     { message: 'Not Found' },
//     { code: 404 },
//     { code: 500, message: 'Internal Server Error' },
//   ],
//   times: 3, // how many times to retry
//   wait: 2, // number of seconds between retry
// },

export default function downloadFile(uri, destination, opts = {}) {
  const { retry } = opts;
  const retryTimes = (retry && retry.times) ? retry.times : 1;
  const retrySeconds = (retry && retry.wait) ? retry.wait : 1;
  const timeBetweenRetries = retrySeconds * 1000;
  let retryCount = 1;
  
  return new Promise((resolve, reject) => {
    function downloadData() {
      log(`Download "${ uri }"`);
      
      request({ uri, method: 'HEAD' }, (err, resp) => {
        if (err) reject(err);
        else if (resp.statusCode > 299) {
          let shouldRetry = !!retry;
          let retryConditionMsg;
          
          if (retry && retry.reasons) {
            for (let i=0; i<retry.reasons.length; i++) {
              const { code, message } = retry.reasons[i];
              
              // IF both code and message are set, make sure they both match
              if (
                (code && message && (
                  resp.statusCode !== code
                  && resp.statusMessage !== message
                ))
                // OR, just verify that code matches
                || (
                  (code && !message) 
                  && resp.statusCode !== code
                )
                // OR, just verify that message matches
                || (message && resp.statusMessage !== message)
              ) {
                shouldRetry = false;
                retryConditionMsg = 'Retry condition not met';
                break;
              }
            }
          }
          
          if (shouldRetry && retryCount <= retryTimes) {
            const s = (retrySeconds > 1) ? 'seconds' : 'second';
            log(`Download failed, waiting ${ retrySeconds } ${ s } before next try`);
            retryCount++;
            setTimeout(downloadData, timeBetweenRetries);
          }
          else {
            let errMsg = `Couldn't download file "${ uri }" | ${ resp.statusCode } | ${ resp.statusMessage }`;
            
            // A specific retry condition could be passed in, but not met, so
            // a retry won't occur.
            if (retry && retryCount > 1) errMsg += ` | Retried ${ retryTimes } times`;
            else if (retryConditionMsg) errMsg += ` | ${ retryConditionMsg }`;
            
            reject(new Error(errMsg));
          }
        }
        else {
          try {
            request({ uri })
              .pipe(createWriteStream(destination))
              .on('close', resolve);
          }
          catch (err) { reject(err); }
        }
      });
    }
    
    downloadData();
  });
}