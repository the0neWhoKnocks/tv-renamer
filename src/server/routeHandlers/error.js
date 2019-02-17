export default (res, code, msg) => {
  res.statusCode = code;
  res.end(msg);
};