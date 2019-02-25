import { TVDB_API__VERSION_HEADER } from 'ROOT/conf.app';

export default ({ jwt } = {}) => {
  const headers = {
    Accept: TVDB_API__VERSION_HEADER,
    'Accept-Language': 'en',
    'Content-Type': 'application/json',
  };
  
  if(jwt) headers.Authorization = `Bearer ${ jwt }`;
  
  return {
    headers,
    json: true,
  };  
};