import { lstatSync } from 'fs';
import { execSync } from 'child_process';
import { parse } from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { PUBLIC_RENAME_LOG } from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';
import logger from 'SERVER/utils/logger';
import saveFile from 'SERVER/utils/saveFile';
import { writeXML } from 'SERVER/utils/xml';
import filesFilter from './utils/filesFilter';
import loadCacheItem from './utils/loadCacheItem';
import loadConfig from './utils/loadConfig';
import loadRenameLog from './utils/loadRenameLog';
import moveFile from './utils/moveFile';
import sanitizeName from './utils/sanitizeName';

const log = logger('server:renameFiles');

const MAX_LOG_ENTRIES = 200;

const createLog = (data = {}) => ({ ...data, time: Date.now() });

const pad = (num, token='00') => token.substring(0, token.length-`${ num }`.length) + num;

export default ({ reqData, res }) => {
  const names = reqData.names;
  
  loadConfig(({ outputFolder, sourceFolder }) => {
    loadRenameLog(async (logs) => {
      const newLogs = [];
      const pendingMoves = [];
      const pendingNames = [];
      const mappedLogs = {};
      const nestedRoots = new Map();
      const createdFolders = [];
      const loadedCache = {};
      
      for(let i=0; i<names.length; i++){
        const { cacheKey, episodeNdx, index, moveToFolder, newName, oldPath, seasonNumber } = names[i];
        let _outputFolder = outputFolder;
        let folderErr;
        
        pendingNames.push(oldPath);
        
        // Create folder structure
        if(moveToFolder){
          const SERIES_FOLDER = `${ outputFolder }/${ sanitizeName(moveToFolder, true) }`;
          const NFO_PATH = `${ SERIES_FOLDER }/tvshow.nfo`;
          const { season } = ((newName.match(/- (?<season>\d{1,2})x\d{2} -/) || {}).groups || {});
          
          if(season){
            const folderName = (season > 0) ? `Season ${ pad(season) }` : 'Specials';
            _outputFolder = `${ SERIES_FOLDER }/${ folderName }`;
            
            // only try to create folders if they haven't already been created
            // during this run
            if(!createdFolders.includes(_outputFolder)){
              // if folder exists don't do anything
              try { lstatSync(_outputFolder); }
              catch(err) { // if folder doesn't exist, there'll be an error
                try {
                  mkdirp.sync(_outputFolder);
                  createdFolders.push(_outputFolder);
                  log(`Created "${ _outputFolder }"`);
                }
                catch(err){
                  const error = `Error creating "${ _outputFolder }" | ${ err }`;
                  log(`[ERROR] ${ error }`);
                  folderErr = error;
                }
                
                try { execSync(`chmod 0777 "${ _outputFolder }"`); }
                catch(err){
                  const error = `Error chmod'ing "${ _outputFolder }" | ${ err }`;
                  log(`[ERROR] ${ error }`);
                  folderErr = error;
                }
              }
            }
          }
          else{
            const err = `Could not determine folder name from "${ newName }"`;
            log(`[ERROR] ${ err }`);
            folderErr = err;
          }
          
          // Create nfo only if it doesn't already exist. Saves on cache loads
          // and XML creation.
          try { lstatSync(NFO_PATH); }
          catch(err) {
            let cache;
            // load, or use already loaded cache
            if(loadedCache[cacheKey]) cache = loadedCache[cacheKey];
            else{
              cache = (await loadCacheItem({ cacheKey })).file;
              loadedCache[cacheKey] = cache; // eslint-disable-line require-atomic-updates
            }
            
            const data = {
              tvshow: {
                title: cache.name,
                plot: cache.plot,
                mpaa: cache.mpaa,
                uniqueid: { '@type': 'tmdb', '@default': true },
                genre: cache.genres.map(g => g),
                premiered: cache.premiered,
                status: cache.status,
                studio: cache.studios.map(s => s),
                actor: cache.actors.map(a => a),
              },
            };
            writeXML(data, NFO_PATH);
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
              else{
                // TODO - de-dupe from above
                let cache;
                // load, or use already loaded cache
                if(loadedCache[cacheKey]) cache = loadedCache[cacheKey];
                else{
                  cache = (await loadCacheItem({ cacheKey })).file;
                  loadedCache[cacheKey] = cache; // eslint-disable-line require-atomic-updates
                }
                
                const { aired, plot, /* thumbnail,*/ title } = cache.seasons[seasonNumber].episodes[episodeNdx];
                writeXML({
                  episodedetails: {
                    title,
                    showtitle: cache.name,
                    plot,
                    uniqueid: { '@type': 'tmdb', '@default': true },
                    aired,
                    watched: false,
                    // TODO - read metadata
                    // fileinfo: {
                    //   streamdetails: {
                    //     video: {},
                    //     audio: [],
                    //   },
                    // },
                  },
                }, data.to.replace(/\.[\w]{3}$/, '.nfo'));
              }
              
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
      }
      
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