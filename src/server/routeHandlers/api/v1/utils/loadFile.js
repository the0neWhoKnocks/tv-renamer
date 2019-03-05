import { readFile } from 'fs';

export default ({ _default = {}, cb, file }) => {
  readFile(file, 'utf8', (err, file) => {
    // TODO - add this as a Debug level log
    // if(err) console.error(err);
    
    const data = (err) ? _default : JSON.parse(file);
    cb(data);
  });
};