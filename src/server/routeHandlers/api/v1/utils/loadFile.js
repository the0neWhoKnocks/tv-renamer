import { readFile } from 'fs';

export default ({ _default = {}, cb, file }) => {
  readFile(file, 'utf8', (err, file) => {
    const data = (err) ? _default : JSON.parse(file);
    cb(data);
  });
};