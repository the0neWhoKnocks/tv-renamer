import { writeFile } from 'fs';
import handleError from 'SERVER/routeHandlers/error';

export default ({ cb, data, file, res }) => {
  writeFile(file, JSON.stringify(data, null, 2), 'utf8', (err) => {
    if(err && res) handleError({ res }, 500, err);
    else cb(data);
  });
};