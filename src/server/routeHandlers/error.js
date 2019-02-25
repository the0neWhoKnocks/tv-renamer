export default ({ res }, code, msg) => {
  const transformedError = `${ msg }`;
  
  console.error('[ ERROR ]', transformedError);
  
  res.statusCode = code;
  res.end(transformedError);
};