export default ({ res }, code, msg) => {
  let transformedError = `${ msg }`;
  
  if(typeof msg === 'object' && msg.stack){
    transformedError = msg.stack;
    
    if(transformedError.includes('TIMEDOUT')){
      // TODO - print out the URL that timed out
      console.log(Object.keys(res));
    }
  }
  
  console.error('[ERROR]', transformedError);
  
  res.statusCode = code;
  res.end(transformedError);
};