import sanitizeFilename from 'sanitize-filename';

export default (name) => {
  const { year } = ((name.match(/\((?<year>\d{4})\)$/) || {}).groups || {});
  let _name = sanitizeFilename(name)
    .toLowerCase()
    .replace(/\s/g, '_')
    .replace(/[,;"'|()]/g, '');
  
  if(year) _name = _name.replace(new RegExp(`${ year }$`), `(${ year })`);
  
  return _name;
};