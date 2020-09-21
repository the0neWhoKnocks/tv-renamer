import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import moveFile from './utils/moveFile';
import sanitizeName from './utils/sanitizeName';

export default ({ reqData, res }) => {
  const { files } = reqData;
  const pendingMoves = [];
  
  files.forEach(({ ext, filePath, newName, oldName }) => {
    pendingMoves.push(new Promise((resolve, reject) => {
      const cb = async (d, moveErr) => {
        if(moveErr) reject(moveErr);
        else resolve();
      };
      
      moveFile({
        cb,
        newPath: `${ filePath }/${ sanitizeName(newName) }${ ext }`,
        oldPath: `${ filePath }/${ sanitizeName(oldName) }${ ext }`,
      });
    }));
  });
  
  Promise.all(pendingMoves)
    .then((logs) => { jsonResp(res, logs); })
    .catch((err) => { handleError({ res }, 500, err); });
};