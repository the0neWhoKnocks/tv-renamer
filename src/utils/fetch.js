export default (...args) => {
  if (args[1] && !args[1].method && args[1].params) {
    let url = args[0];
    
    if (args[0].startsWith('/')) {
      url = `${ window.location.origin }${ args[0] }`;
    }
    
    url = new URL(url);
    Object.keys(args[1].params).forEach((key) => {
      url.searchParams.append(key, window.encodeURIComponent(args[1].params[key]));
    });
    
    args[0] = url.href;
  }
  
  return window.fetch(...args)
    .then((resp) => {
      const contentType = resp.headers.get('content-type');
      const parsed = (contentType && contentType.includes('application/json'))
        ? resp.json()
        : resp.text();
        
      return new Promise((resolve, reject) => {
        parsed.then((data) => {
          if (resp.status < 400) resolve(data);
          else reject(data);
        });
      });
    });
};