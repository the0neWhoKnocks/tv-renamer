export default ({ res }, code, msg) => {
  const transformedError = `${ msg }`;
  
  console.error(transformedError);
  
  res.statusCode = code;
  res.end(transformedError);
};