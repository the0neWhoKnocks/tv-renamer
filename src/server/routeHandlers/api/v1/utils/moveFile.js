import { existsSync, rename } from 'fs';
import handleError from 'SERVER/routeHandlers/error';

export default ({ cb, data, initiatedBy, newPath, oldPath, res }) => {
  const args = [data];
  
  if (
    initiatedBy === 'Replace'
    && existsSync(newPath)
  ) {
    args.push(new Error(`Did not rename:\n  "${ oldPath }"\n  because a file already exists:\n  "${ newPath }"\n`));
    cb(...args);
  }
  else {
    rename(oldPath, newPath, (err) => {
      if (err && res) handleError({ res }, 500, err);
      else {
        if (err) args.push(err);
        cb(...args);
      }
    });
  }
};