import sanitizeFilename from 'sanitize-filename';
import { PUBLIC_CACHE } from 'ROOT/conf.app';

export default (name) => {
  const _name = sanitizeFilename(name)
    .toLowerCase()
    .replace(/\s/g, '_')
    .replace(/'/g, '');
  
  return {
    filePath: `${ PUBLIC_CACHE }/${ _name }.json`,
    name: _name,
  };
};