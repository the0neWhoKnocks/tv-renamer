import { PUBLIC_RENAME_LOG } from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import loadConfig from './utils/loadConfig';
import loadRenameLog from './utils/loadRenameLog';
import moveFile from './utils/moveFile';
import saveFile from './utils/saveFile';

const MAX_LOG_ENTRIES = 200;

export default ({ reqData, res }) => {
  const names = reqData.names;
  
  loadConfig(({ outputFolder }) => {
    loadRenameLog((logs) => {
      const newLogs = [];
      const pendingMoves = [];
      const mappedLogs = {};
      
      names.forEach(({ index, newName, oldPath }) => {
        pendingMoves.push(new Promise((resolve, reject) => {
          const data = {
            from: oldPath,
            to: `${ outputFolder }/${ newName }`,
          };
          const cb = (d, err) => {
            const log = { ...d, time: Date.now() };
            if(err) log.error = err.message;
            newLogs.push(log);
            mappedLogs[index] = log;
            
            resolve();
          };
          
          moveFile({
            cb, data,
            newPath: data.to,
            oldPath: data.from,
          });
        }));
      });
      
      Promise.all(pendingMoves)
        .then(() => {
          return new Promise((resolve, reject) => {
            // trim the logs down before saving the new ones.
            const combinedLogs = [...logs, ...newLogs]
              .slice(newLogs.length - MAX_LOG_ENTRIES, newLogs.length);
            
            saveFile({
              cb: (l, err) => (err) ? reject(err) : resolve(mappedLogs),
              data: combinedLogs,
              file: PUBLIC_RENAME_LOG,
            });
          });
        })
        .then((logs) => {
          jsonResp(res, logs);
        })
        .catch((err) => {
          handleError({ res }, 500, err);
        });
    });
  });
};