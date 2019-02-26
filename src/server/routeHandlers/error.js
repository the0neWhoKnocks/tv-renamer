export default ({ res }, code, msg) => {
  let transformedError = `${ msg }`;
  
  if(typeof msg === 'object' && msg.stack)
    transformedError = `${ msg.stack }`;
  
  console.error('[ ERROR ]', transformedError);
  
  res.statusCode = code;
  res.end(transformedError);
};