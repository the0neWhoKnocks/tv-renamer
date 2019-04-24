import { lstatSync } from 'fs';
import { execSync } from 'child_process';
import { parse } from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { PUBLIC_RENAME_LOG } from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';
import saveFile from 'SERVER/utils/saveFile';
import filesFilter from './utils/filesFilter';
import loadConfig from './utils/loadConfig';
import loadRenameLog from './utils/loadRenameLog';
import moveFile from './utils/moveFile';
import sanitizeName from './utils/sanitizeName';

const MAX_LOG_ENTRIES = 200;

export default ({ reqData, res }) => {
  const names = reqData.names;
  
  loadConfig(({ outputFolder, sourceFolder }) => {
    loadRenameLog((logs) => {
      const newLogs = [];
      const pendingMoves = [];
      const mappedLogs = {};
      
      names.forEach(({ index, moveToFolder, newName, oldPath }) => {
        let _outputFolder = outputFolder;
        let folderErr;
        
        // Move to a series folder (if specified)
        if(moveToFolder){
          _outputFolder = `${ outputFolder }/${ sanitizeName(moveToFolder) }`;
          
          // if folder exists don't do anything
          try { lstatSync(_outputFolder); }
          catch(err) { // if folder doesn't exist, there'll be an error
            try {
              mkdirp.sync(_outputFolder);
              
              try { execSync(`chmod 0777 "${ _outputFolder }"`); }
              catch(err){ folderErr = `Error chmod'ing "${ _outputFolder }" | ${ err }`; }
            }
            catch(err){
              // there should never be an error here
              folderErr = `Error stat'ing "${ oldPath }" | ${ err }`;
            }
          }
        }
        
        pendingMoves.push(new Promise((resolve, reject) => {
          if(folderErr){
            reject(folderErr);
          }
          else{
            const data = {
              from: oldPath,
              to: `${ _outputFolder }/${ newName }`,
            };
            const cb = (d, err) => {
              const log = { ...d, time: Date.now() };
              const rootDir = parse(oldPath).dir;
              
              const allDone = () => {
                if(err) log.error = err.message;
                newLogs.push(log);
                mappedLogs[index] = log;
                
                resolve();
              };
              
              if(rootDir !== sourceFolder){
                // only delete if there aren't other files that can be renamed
                getFiles(rootDir, filesFilter)
                  .then((files) => {
                    if(!files.length){
                      rimraf(rootDir, { glob: false }, () => {
                        log.deleted = `Deleted folder: "${ rootDir }"`;
                        allDone();
                      });
                    }
                    else{
                      allDone();
                    }
                  });
              }
              else{ allDone(); }
            };
            
            moveFile({
              cb, data,
              newPath: data.to,
              oldPath: data.from,
            });
          }
        }));
      });
      
      Promise.all(pendingMoves)
        .then(() => {
          return new Promise((resolve, reject) => {
            // trim the logs down before saving the new ones.
            let combinedLogs = [...logs, ...newLogs];
            combinedLogs = combinedLogs.slice(combinedLogs.length - MAX_LOG_ENTRIES, combinedLogs.length);
            
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