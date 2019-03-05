import { rename } from 'fs';
import handleError from 'SERVER/routeHandlers/error';

export default ({ cb, data, newPath, oldPath, res }) => {
  rename(oldPath, newPath, (err) => {
    if(err && res) handleError({ res }, 500, err);
    else{
      const args = [data];
      if(err) args.push(err);
      cb(...args);
    }
  });
};