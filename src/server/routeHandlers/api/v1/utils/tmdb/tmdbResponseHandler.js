import logger from 'SERVER/utils/logger';
import timeoutCodeCheck from '../timeoutCodeCheck';

const log = logger('server:tmdbResponseHandler');

export default (
  resolve,
  reject,
  { reqOpts, reqURL } = {},
) => (err, resp, data) => {
  if(err){
    const timedOut = timeoutCodeCheck(err) || timeoutCodeCheck(resp.statusCode);
    
    if(timedOut){
      log(`  [TIMEOUT] For "${ reqURL }" with opts:\n    ${ JSON.stringify(reqOpts, null, 2) }`);
    }
  }
  
  return (err || resp.statusCode > 399)
    ? reject({
      err: err || data.Error,
      resp,
    })
    : resolve(data);
};