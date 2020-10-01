import logger from 'SERVER/utils/logger';
import timeoutCodeCheck from '../timeoutCodeCheck';

const log = logger('server:tmdbResponseHandler');

export default (
  resolve,
  reject,
  { reqOpts, reqURL } = {},
) => (err, resp, data) => {
  const hasError = err || resp.statusCode > 399 || data.success === false;
  
  if(hasError){
    const timedOut = timeoutCodeCheck(err);
    
    if(timedOut){
      log(`  [TIMEOUT] For "${ reqURL }" with opts:\n    ${ JSON.stringify(reqOpts, null, 2) }`);
    }
    
    return reject({ err: err || data.Error || data.status_message, resp });
  }
  
  return resolve(JSON.parse(data));
};