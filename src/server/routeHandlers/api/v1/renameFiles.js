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

const createLog = (data = {}) => ({ ...data, time: Date.now() });

export default ({ reqData, res }) => {
  const names = reqData.names;
  
  loadConfig(({ outputFolder, sourceFolder }) => {
    loadRenameLog((logs) => {
      const newLogs = [];
      const pendingMoves = [];
      const pendingNames = [];
      const mappedLogs = {};
      const nestedRoots = new Map();
      
      names.forEach(({ index, moveToFolder, newName, oldPath }) => {
        let _outputFolder = outputFolder;
        let folderErr;
        
        pendingNames.push(oldPath);
        
        // Move to a series folder (if specified)
        if(moveToFolder){
          _outputFolder = `${ outputFolder }/${ sanitizeName(moveToFolder, true) }`;
          
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
            const cb = async (d, moveErr) => {
              const rootDir = parse(oldPath).dir;
              const log = createLog(d);
              
              if(!moveErr) pendingNames.splice(pendingNames.indexOf(d.from), 1);
              
              if(rootDir !== sourceFolder){
                // in case files are nested within multiple folders, find the top-most folder in source
                const nestedRoot = `${ sourceFolder }/${ rootDir.replace(sourceFolder, '').split('/')[1] }`;
                if(!nestedRoots.has(nestedRoot)) nestedRoots.set(nestedRoot, { path: nestedRoot });
              }
              
              if(moveErr) log.error = moveErr.message;
              
              newLogs.push(log);
              mappedLogs[index] = log;
              
              resolve();
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
        .then(async () => {
          const deletedFolders = [];
          
          for(const [, val] of nestedRoots){
            const { path } = val;
            const files = await getFiles(path, filesFilter);
            
            // only delete the parent folder IF there are no remaining
            // files (which may happen if a User chose to only rename
            // one file in folder)
            if(!files.length) {
              try {
                lstatSync(path);
                rimraf.sync(path, { glob: false });
                deletedFolders.push(path);
              }
              catch(err) { /* no folder, don't care about the error */ }
            }
          }
          
          if(deletedFolders.length){
            const lastLog = createLog({ deleted: deletedFolders.sort() });
            const lastNdx = Object.keys(mappedLogs).reduce((prevNum, currNum) => (+currNum > prevNum) ? +currNum : prevNum, 0) + 1;
            newLogs.push(lastLog);
            mappedLogs[lastNdx] = lastLog;
          }
          
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