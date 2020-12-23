module.exports = function formatURL(url, { qs }) {
  const [ urlPath, params ] = url.split('?');
  let _params = { ...qs };
  
  if( params ){
    const extraParams = params.split('&').reduce((obj, p) => {
      const [key, value] = p.split('=');
      obj[key] = value;
      return obj;
    }, {});
    _params = { ..._params, ...extraParams };
  }
  
  return `${ urlPath }?${ Object.keys(_params).map(key => `${ key }=${ _params[key] }`).join('&') }`;
};
