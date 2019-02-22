import {
  access,
  constants,
} from 'fs';
import { parse } from 'path';

export default (folders) => new Promise((accessResolve, accessReject) => {
  const _folders = Array(folders.length).fill().map((item, ndx) => ({
    name: parse(folders[ndx]).base,
    path: folders[ndx],
  }));
  const readablePromises = folders.map(
    (folderPath, ndx) => new Promise((readResolve, readReject) => {
      access(folderPath, constants.R_OK, (err) => {
        // if(err) return readReject(err);
        _folders[ndx].readable = !err;
        return readResolve();
      });
    })
  );
  const writablePromises = folders.map(
    (folderPath, ndx) => new Promise((writeResolve, writeReject) => {
      access(folderPath, constants.W_OK, (err) => {
        // if(err) return writeReject(err);
        _folders[ndx].writable = !err;
        return writeResolve();
      });
    })
  );
  
  Promise.all([
    ...readablePromises,
    ...writablePromises,
  ])
    .then((stats) => accessResolve(_folders))
    .catch((err) => accessReject(err));
});