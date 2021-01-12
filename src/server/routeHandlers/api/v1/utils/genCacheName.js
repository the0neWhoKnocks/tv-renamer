import sanitizeFilename from 'sanitize-filename';

export default (name) => {
  // NOTE - this is just a failsafe, name should always be passed, but I've seen
  // it randomly be undefined after a Server restart. If I refresh and try
  // again, things behave as expected. Since I can't debug or reproduce, this
  // stop-gap will have to suffice for now.
  let _name = name || '_no_name_';
  
  if(_name){
    const { year } = ((_name.match(/\((?<year>\d{4})\)$/) || {}).groups || {});
    _name = sanitizeFilename(_name)
      .toLowerCase()
      .replace(/\s/g, '_')
      .replace(/[,;"'|()]/g, '');
    
    if(year) _name = _name.replace(new RegExp(`${ year }$`), `(${ year })`);
  }
  
  return _name;
};