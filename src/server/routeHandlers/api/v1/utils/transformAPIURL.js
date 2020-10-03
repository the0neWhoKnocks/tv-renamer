import { parse } from 'url';

const transformAPIURL = (url, tokens) => {
  if(!url) throw Error("Missing `url`, can't transform for API");
  
  let _url = url;
  
  tokens.forEach(([ token, replacement ]) => {
    _url = _url.replace(token, encodeURIComponent(replacement));
  });
  
  const params = parse(_url, true).query || {};
  
  return { params, reqURL: _url.split('?')[0] };
};

export default transformAPIURL;
