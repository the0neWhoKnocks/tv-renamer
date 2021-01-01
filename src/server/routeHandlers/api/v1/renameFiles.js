import { lstatSync } from 'fs';
import { execSync } from 'child_process';
import { parse } from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { PUBLIC_RENAME_LOG } from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import downloadFile from 'SERVER/utils/downloadFile';
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

const MAX_LOG_ENTRIES = 200;

const log = logger('server:renameFiles');

const createLog = (data = {}) => ({ ...data, time: Date.now() });

const pad = (num, token='00') => token.substring(0, token.length-`${ num }`.length) + num;

const sanitizeText = (text = '') => {
  // The below should handle replacing 
  // - UTF-8 characters: https://codepoints.net/general_punctuation - go to each charaters page to view their UTF-8 representation
  // - Windows-1252 ANSI characters: https://www.w3schools.com/charsets/ref_html_ansi.asp
  return text
    .replace(/(?:‘|’)/g, "'") // (smart) single quotes
    .replace(/(?:“|”)/g, '"') // (smart) double quotes
    .replace(/–/g, '-') // en dash
    .replace(/—/g, '--') // em dash
    .replace(/…/g, '...'); // horizontal ellipsis
};

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
      
      async function getCache(cacheKey) {
        let cache;
        
        // load, or use already loaded cache
        if(loadedCache[cacheKey]) cache = loadedCache[cacheKey];
        else{
          cache = (await loadCacheItem({ cacheKey })).file;
          loadedCache[cacheKey] = cache; // eslint-disable-line require-atomic-updates
        }
        
        return cache;
      }
      
      for(let i=0; i<names.length; i++){
        const { cacheKey, episodeNdx, index, moveToFolder, newName, oldPath, seasonNumber } = names[i];
        let _outputFolder = outputFolder;
        let folderErr;
        let tvshowNfoErr;
        
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
                
                const { images } = await getCache(cacheKey);
                if(images && images.fanarttv){
                  const { fanarttv } = images;
                  const prefix = (season > 0) ? `season${ pad(season) }` : 'season-specials';
                  
                  try {
                    const pendingImgs = [
                      { prop: 'seasonPoster', name: `${ prefix }-poster.jpg` },
                      { prop: 'seasonThumb', name: `${ prefix }-thumb.jpg` },
                    ].reduce((arr, { prop, name }) => {
                      if(fanarttv[prop]) arr.push(downloadFile(fanarttv[prop][season][0], `${ SERIES_FOLDER }/${ name }`));
                      return arr;
                    }, []);
                    
                    await Promise.all(pendingImgs);
                  }
                  catch(err) {
                    log(`[ERROR] Downloading season image: "${ err.stack }"`);
                  }
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
            const cache = await getCache(cacheKey);
            const data = {
              tvshow: {
                title: sanitizeText(cache.name),
                plot: sanitizeText(cache.plot),
                mpaa: cache.mpaa,
                uniqueid: { '@type': 'tmdb', '@default': true },
                genre: cache.genres.map(g => g),
                premiered: cache.premiered,
                status: cache.status,
                studio: cache.studios.map(s => s),
                actor: cache.actors.map(a => a),
              },
            };
            try { await writeXML(data, NFO_PATH); }
            catch(err) { tvshowNfoErr = err; }
            
            if(cache.images){
              const { fanarttv, tmdb } = cache.images;
              
              try {
                let pendingImgs;
                
                // download all the things
                if(fanarttv){
                  pendingImgs = [
                    { prop: 'clearArt', name: 'clearart.png' },
                    { prop: 'clearLogo', name: 'clearlogo.png' },
                    { prop: 'seriesBackground', name: 'fanart.jpg' },
                    { prop: 'seriesBanner', name: 'banner.jpg' },
                    { prop: 'seriesPoster', name: 'poster.jpg' },
                    { prop: 'seriesThumb', name: 'thumb.jpg' },
                  ].reduce((arr, { prop, name }) => {
                    if(fanarttv[prop]) arr.push(downloadFile(fanarttv[prop][0], `${ SERIES_FOLDER }/${ name }`));
                    return arr;
                  }, []);
                }
                // fallback to a limited set of images
                else if(tmdb){
                  pendingImgs = [
                    { prop: 'background', name: 'fanart.jpg' },
                    { prop: 'poster', name: 'poster.jpg' },
                  ].reduce((arr, { prop, name }) => {
                    if(tmdb[prop]) arr.push(downloadFile(tmdb[prop], `${ SERIES_FOLDER }/${ name }`));
                    return arr;
                  }, []);
                }
                
                if(pendingImgs) await Promise.all(pendingImgs);
              }
              catch(err) {
                log(`[ERROR] Downloading series image: "${ err.stack }"`);
              }
            }
          }
        }
        
        pendingMoves.push(new Promise((resolve, reject) => {
          if(folderErr) reject(folderErr);
          else{
            const data = {
              from: oldPath,
              to: `${ _outputFolder }/${ newName }`,
            };
            const cb = async (d, moveErr) => {
              const rootDir = parse(oldPath).dir;
              const log = createLog(d);
              const warnings = [];
              
              if(!moveErr) pendingNames.splice(pendingNames.indexOf(d.from), 1);
              
              if(rootDir !== sourceFolder){
                // in case files are nested within multiple folders, find the top-most folder in source
                const nestedRoot = `${ sourceFolder }/${ rootDir.replace(sourceFolder, '').split('/')[1] }`;
                if(!nestedRoots.has(nestedRoot)) nestedRoots.set(nestedRoot, { path: nestedRoot });
              }
              
              if(moveErr) log.error = moveErr.message;
              else{
                const cache = await getCache(cacheKey);
                const { aired, plot, thumbnail, title } = cache.seasons[seasonNumber].episodes[episodeNdx];
                const EP_FILENAME_NO_EXT = data.to.replace(/\.[\w]{3}$/, '');
                
                if(tvshowNfoErr){
                  warnings.push(`Error creating tvshow.nfo: "${ tvshowNfoErr.message }"`);
                }
                
                try {
                  await writeXML({
                    episodedetails: {
                      title: sanitizeText(title),
                      showtitle: sanitizeText(cache.name),
                      plot: sanitizeText(plot),
                      uniqueid: { '@type': 'tmdb', '@default': true },
                      aired,
                      watched: false,
                      // TODO - read metadata
                      // runtime: '', // just minutes
                      // fileinfo: {
                      //   streamdetails: {
                      //     video: {},
                      //     audio: [],
                      //   },
                      // },
                    },
                  }, `${ EP_FILENAME_NO_EXT }.nfo`);
                  
                  try { await downloadFile(thumbnail, `${ EP_FILENAME_NO_EXT }-thumb.jpg`); }
                  catch(err) {
                    warnings.push(`Error downloading episode still for "${ newName }": "${ err.message }"\n  URL: "${ thumbnail }"`);
                  }
                }
                catch(err) {
                  warnings.push(`Error creating episode nfo: "${ err.message }"`);
                }
              }
              
              if(warnings.length) log.warnings = warnings;
              
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