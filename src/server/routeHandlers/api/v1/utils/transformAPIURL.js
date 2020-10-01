const transformAPIURL = (url, tokens) => {
  if(!url) throw Error("Missing `url`, can't transform for API");
  
  let _url = url;
  
  tokens.forEach(([ token, replacement ]) => {
    _url = _url.replace(token, encodeURIComponent(replacement));
  });
  
  return _url;
};

export default transformAPIURL;
