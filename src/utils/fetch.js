export default (...args) => {
  return window.fetch(...args)
    .then((resp) => {
      const contentType = resp.headers.get('content-type');
      const parsed = (contentType && contentType.includes('application/json'))
        ? resp.json()
        : resp.text();
        
      return new Promise((resolve, reject) => {
        parsed.then((data) => {
          if(resp.status < 400) resolve(data);
          else reject(data);
        });
      });
    });
};