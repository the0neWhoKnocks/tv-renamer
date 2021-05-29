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
      const remainingFiles = [];
      const folders = files.filter((file, ndx) => {
        const isFolder = stats[ndx];
        if ( !isFolder ) remainingFiles.push(files[ndx]);
        return isFolder;
      });
      
      return checkResolve({
        files: remainingFiles,
        folders,
      });
    })
    .catch((err) => checkReject(err));
});