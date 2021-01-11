import { lstatSync } from 'fs';
import { execSync } from 'child_process';
import { parse } from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import {
  PUBLIC_RENAME_LOG,
  WS__MSG_TYPE__RENAME_STATUS,
} from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import cmd from 'SERVER/utils/cmd';
import downloadFile from 'SERVER/utils/downloadFile';
import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';
import logger from 'SERVER/utils/logger';
import saveFile from 'SERVER/utils/saveFile';
import { writeXML } from 'SERVER/utils/xml';
import pad from 'UTILS/pad';
import filesFilter from './utils/filesFilter';
import loadCacheItem from './utils/loadCacheItem';
import loadConfig from './utils/loadConfig';
import loadRenameLog from './utils/loadRenameLog';
import moveFile from './utils/moveFile';
import sanitizeName from './utils/sanitizeName';

const MAX_LOG_ENTRIES = 200;

const log = logger('server:renameFiles');

const createLog = (data = {}) => ({ ...data, time: Date.now() });

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

const roundDecimal = (num, dec) => {
  const _num = +num;
  const numSign = _num >= 0 ? 1 : -1;
  return parseFloat((Math.round((_num * Math.pow(10, dec)) + (numSign * 0.0001)) / Math.pow(10, dec)).toFixed(dec));
};

function downloadSeriesImages({
  clientSocket,
  outputFolder,
  pendingImgItems,
  socketMsg,
  warningsArr,
}) {
  const pendingKeys = Object.keys(pendingImgItems);
  let pendingImgs;
  
  if(pendingKeys.length) {
    clientSocket.send(JSON.stringify({
      data: { log: socketMsg },
      type: WS__MSG_TYPE__RENAME_STATUS,
    }));
    
    pendingImgs = pendingKeys.reduce((arr, key) => {
      const { from, name, url } = pendingImgItems[key];
      
      if(url){
        const imgPromise = downloadFile(url, `${ outputFolder }/${ name }`);
        
        imgPromise.catch((err) => {
          warningsArr.push(`Error downloading "${ name }" from "${ url }" | ${ err.message }`);
        });
        
        arr.push(imgPromise);
      }
      else{
        warningsArr.push(`Missing "${ name }" from ${ from }`);
      }
      
      return arr;
    }, []);
  }
  
  return pendingImgs ? Promise.all(pendingImgs) : Promise.resolve();
}

export default async function renameFiles({ req, reqData, res }) {
  const names = reqData.names;
  const { clientSocket } = req.socket.server;
  const { data: { outputFolder, sourceFolder } } = await loadConfig();
  const { data: logs } = await loadRenameLog();
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
      const { data } = await loadCacheItem(cacheKey);
      cache = data;
      loadedCache[cacheKey] = cache; // eslint-disable-line require-atomic-updates
    }
    
    return cache;
  }
  
  for(let i=0; i<names.length; i++){
    const { cacheKey, episodeNdx, index, moveToFolder, newName, oldPath, seasonNumber, seasonOrder } = names[i];
    const imgWarnings = [];
    let _outputFolder = outputFolder;
    let folderErr;
    let tvshowNfoErr;
    
    pendingNames.push(oldPath);
    
    // Create folder structure
    if(moveToFolder){
      const SERIES_FOLDER = `${ outputFolder }/${ sanitizeName(moveToFolder, true) }`;
      const NFO_PATH = `${ SERIES_FOLDER }/tvshow.nfo`;
      
      if(seasonNumber){
        const folderName = (seasonNumber > 0) ? `Season ${ pad(seasonNumber) }` : 'Specials';
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
            
            const { images, name } = await getCache(cacheKey);
            if(images){
              const { fanarttv, tmdb } = images;
              const prefix = (seasonNumber > 0) ? `season${ pad(seasonNumber) }` : 'season-specials';
              
              try {
                const pendingImgItems = {};
                
                if(fanarttv){
                  [
                    { prop: 'seasonPoster', name: `${ prefix }-poster.jpg` },
                    { prop: 'seasonThumb', name: `${ prefix }-thumb.jpg` },
                  ].forEach((obj) => {
                    const { name, prop } = obj;
                    obj.from = 'fanart.tv';
                    
                    if(
                      fanarttv[prop]
                      && fanarttv[prop][seasonNumber]
                      && fanarttv[prop][seasonNumber][0]
                    ) {
                      obj.url = fanarttv[prop][seasonNumber][0];
                    }
                    
                    pendingImgItems[name] = obj;
                  });
                }
                
                if(tmdb){
                  [
                    { prop: 'seasonPosters', name: `${ prefix }-poster.jpg` },
                  ].forEach((obj) => {
                    const { name, prop } = obj;
                    obj.from = 'theMDB';
                    
                    if(tmdb[prop] && tmdb[prop][seasonNumber]) {
                      obj.url = tmdb[prop][seasonNumber];
                    }
                    
                    if(
                      // no item set via fanart.tv
                      !pendingImgItems[name]
                      // OR an item was set, but there's nothing to download
                      || (
                        pendingImgItems[name]
                        && !pendingImgItems[name].url
                      )
                    ) {
                      pendingImgItems[name] = obj;
                    }
                  });
                }
                
                await downloadSeriesImages({
                  clientSocket,
                  outputFolder: SERIES_FOLDER,
                  pendingImgItems,
                  socketMsg: `Downloading images for "${ prefix }" of "${ name }"`,
                  warningsArr: imgWarnings,
                });
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
            const pendingImgItems = {};
            
            // try to get images from fanart.tv first
            if(fanarttv){
              [
                { prop: 'clearArt', name: 'clearart.png' },
                { prop: 'clearLogo', name: 'clearlogo.png' },
                { prop: 'seriesBackground', name: 'fanart.jpg' },
                { prop: 'seriesBanner', name: 'banner.jpg' },
                { prop: 'seriesPoster', name: 'poster.jpg' },
                { prop: 'seriesThumb', name: 'thumb.jpg' },
              ].forEach((obj) => {
                const { name, prop } = obj;
                
                obj.from = 'fanart.tv';
                if(fanarttv[prop] && fanarttv[prop][0]) obj.url = fanarttv[prop][0];
                
                pendingImgItems[name] = obj;
              });
            }
            
            // fill in any missing images from fanart.tv with available images from theMDB
            if(tmdb){
              [
                { prop: 'background', name: 'fanart.jpg' },
                { prop: 'poster', name: 'poster.jpg' },
              ].forEach((obj) => {
                const { name, prop } = obj;
                
                obj.from = 'theMDB';
                if(tmdb[prop]) obj.url = tmdb[prop];
                
                if(
                  // no item set via fanart.tv
                  !pendingImgItems[name]
                  // OR an item was set, but there's nothing to download
                  || (
                    pendingImgItems[name]
                    && !pendingImgItems[name].url
                  )
                ) {
                  pendingImgItems[name] = obj;
                }
              });
            }
            
            await downloadSeriesImages({
              clientSocket,
              outputFolder: SERIES_FOLDER,
              pendingImgItems,
              socketMsg: `Downloading series images for "${ cache.name }"`,
              warningsArr: imgWarnings,
            });
          }
          catch(err) {
            log(`[ERROR] Downloading series images: "${ err.stack }"`);
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
        const warnings = [...imgWarnings];
        let hasImgWarnings = !!imgWarnings.length;
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
            const cache = await getCache(cacheKey);
            const seasons = seasonOrder === 'dvd' ? cache.dvdSeasons : cache.seasons;
            const { aired, plot, thumbnail, title } = seasons[seasonNumber].episodes[episodeNdx];
            const EP_FILENAME_NO_EXT = data.to.replace(/\.[\w]{3}$/, '');
            const streamDetails = {};
            let runtime = '';
            
            if(tvshowNfoErr){
              warnings.push(`Error creating tvshow.nfo: "${ tvshowNfoErr.message }"`);
            }
            
            try {
              clientSocket.send(JSON.stringify({
                data: { log: `Reading streams metadata for "${ newName }"` },
                type: WS__MSG_TYPE__RENAME_STATUS,
              }));
              
              const { streams: rawStreams } = JSON.parse(await cmd(`ffprobe -v quiet -print_format json -show_streams "${ data.to }"`));
              if(rawStreams.length) {
                // map audio and video streams to grouped Arrays
                const { audio, video } = rawStreams.reduce((obj, { codec_type, ...stream }) => {
                  if(!obj[codec_type]) obj[codec_type] = [];
                  obj[codec_type].push(stream);
                  return obj;
                }, {});
                
                if(video){
                  video.forEach(({
                    coded_height,
                    codec_name,
                    coded_width,
                    display_aspect_ratio,
                    disposition: { attached_pic },
                    duration,
                    pix_fmt,
                    tags,
                  }) => {
                    // Only add actual video streams, not cover/poster attachments
                    if(
                      (
                        display_aspect_ratio
                        || (coded_width && coded_height)
                      )
                      && !attached_pic
                    ) {
                      const width = coded_width;
                      const height = coded_height;
                      
                      streamDetails.video = {
                        codec: codec_name.toUpperCase(),
                        aspect: roundDecimal(width / height, 2),
                        width,
                        height,
                      };
                      
                      // only add it if it's equal to or over a minute
                      let _runtime = 0;
                      if(duration) _runtime = +duration/60;
                      else if(tags){
                        const durTag = Object.keys(tags).find(t => t.toLowerCase().startsWith('duration'));
                        
                        if(durTag){
                          let [hours, minutes] = tags[durTag].split('.')[0].split(':');
                          hours = +hours;
                          minutes = +minutes;
                          _runtime = (hours * 60) + minutes;
                        }
                      }
                      
                      if(_runtime && _runtime >= 1) runtime = `${ _runtime } min`;
                    }
                  });
                }
                
                if(audio){
                  streamDetails.audio = [];
                  
                  audio.forEach(({ channels, codec_name }) => {
                    streamDetails.audio.push({
                      codec: codec_name.toUpperCase(),
                      channels,
                    });
                  });
                }
              }
            }
            catch(err) {
              warnings.push(`Error reading metadata: "${ err.message }"`);
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
                  runtime,
                  fileinfo: {
                    streamdetails: streamDetails,
                  },
                },
              }, `${ EP_FILENAME_NO_EXT }.nfo`);
              
              if(thumbnail){
                try {
                  clientSocket.send(JSON.stringify({
                    data: { log: `Downloading thumbnail for "${ newName }"` },
                    type: WS__MSG_TYPE__RENAME_STATUS,
                  }));
                  
                  await downloadFile(thumbnail, `${ EP_FILENAME_NO_EXT }-thumb.jpg`);
                }
                catch(err) {
                  warnings.push(`Error downloading episode still for "${ newName }": "${ err.message }"\n  URL: "${ thumbnail }"`);
                  hasImgWarnings = true;
                }
              }
              else{
                warnings.push('Missing "[episode]-thumb.jpg" from theMDB');
                hasImgWarnings = true;
              }
            }
            catch(err) {
              warnings.push(`Error creating episode nfo: "${ err.message }"`);
            }
          }
          
          if(warnings.length){
            if(hasImgWarnings){
              const { name } = await getCache(cacheKey);
              const nameWithNoYear = name.replace(/ \(\d{4}\)$/, '');
              const queryName = encodeURIComponent(name);
              const queryNameNoYear = encodeURIComponent(nameWithNoYear);
              
              warnings.push(`https://thetvdb.com/search?menu%5Btype%5D=TV&query=${ queryName }`);
              warnings.push(`https://www.themoviedb.org/search/tv?query=${ queryNameNoYear }`);
              warnings.push(`https://fanart.tv/?s=${ queryName }&sect=1`);
            }
            
            log.warnings = warnings;
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
  
  try { await Promise.all(pendingMoves); }
  catch(err) {
    return handleError({ res }, 500, `Error processing file(s) | ${ err.stack }`);
  }
  
  const deletedFolders = [];
  
  for(const [, val] of nestedRoots){
    const { path } = val;
    const files = await getFiles(path, filesFilter);
    
    // only delete the parent folder IF there are no remaining files (which may
    // happen if a User chose to only rename one file in folder)
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
  
  // trim the logs down before saving the new ones.
  let combinedLogs = [...logs, ...newLogs];
  combinedLogs = combinedLogs.slice(combinedLogs.length - MAX_LOG_ENTRIES, combinedLogs.length);
  
  try {
    await saveFile(PUBLIC_RENAME_LOG, combinedLogs);
    jsonResp(res, mappedLogs);
  }
  catch(err) {
    handleError({ res }, 500, err);
  }
}
