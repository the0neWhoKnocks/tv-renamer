import { readdir } from 'fs';
import { join } from 'path';

export default (source) => new Promise((readResolve, readReject) => {
  readdir(source, (err, files) => {
    return (err)
      ? readReject(err)
      : readResolve(files.map((file) => join(source, file)));
  });
});