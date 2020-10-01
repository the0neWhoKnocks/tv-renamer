import logger from 'SERVER/utils/logger';

const log = logger('server:error');

export default ({ res }, code, msg) => {
  let transformedError = `${ msg }`;
  
  if(typeof msg === 'object' && msg.stack){
    transformedError = msg.stack;
    
    if(transformedError.includes('TIMEDOUT')){
      // TODO - print out the URL that timed out
      log(Object.keys(res));
    }
  }
  
  log('[ERROR]', transformedError);
  
  res.statusCode = code;
  res.end(transformedError);
};