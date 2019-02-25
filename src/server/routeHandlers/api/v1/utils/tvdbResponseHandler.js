export default (resolve, reject) => (err, resp, data) => {
  return (err || resp.statusCode > 399)
    ? reject({
      err: err || data.Error,
      resp,
    })
    : resolve(data);
};