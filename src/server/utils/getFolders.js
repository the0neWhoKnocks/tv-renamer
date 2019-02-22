import { lstat } from 'fs';

export default (files) => new Promise((checkResolve, checkReject) => {
  const lstatPromises = files.map(
    (filePath) => new Promise((lstatResolve, lstatReject) => {
      lstat(filePath, (err, stats) => {
        return lstatResolve(!err && stats.isDirectory());
      });
    })
  );
  
  Promise.all(lstatPromises)
    .then((stats) => {
      return checkResolve(files.filter((file, ndx) => stats[ndx]));
    })
    .catch((err) => checkReject(err));
});