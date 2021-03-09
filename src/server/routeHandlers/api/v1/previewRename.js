import { promises as fs } from 'fs';
import {
  PUBLIC_CACHE,
  VERSION__CACHE_SCHEMA,
  TMDB__TOKEN__SERIES_ID,
  TMDB__URL__SERIES,
} from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import logger from 'SERVER/utils/logger';
import buildEpTitle from './utils/buildEpTitle';
import genCacheName from './utils/genCacheName';
import loadCacheItem from './utils/loadCacheItem';
import loadIDsCacheMap from './utils/loadIDsCacheMap';
import loadConfig from './utils/loadConfig';
import sanitizeName from './utils/sanitizeName';
import saveCacheItem from './utils/saveCacheItem';
import saveIDsCacheMap from './utils/saveIDsCacheMap';
import lookUpSeries from './utils/tmdb/lookUpSeries';

const { stat } = fs;
const log = logger('server:previewRename');

const parseEpNum = (episode) => {
  return (`${ episode }`.length < 2)
    ? `0${ episode }`
    : episode;
};

const buildEpNums = (episodes) => {
  return episodes.map((ndx) => `x${ parseEpNum(ndx) }`).join('');
};

const getEpNamesFromCache = ({ cacheData, idMap, invalidItems, validItems }) => {
  const renamed = [];
  
  function iterateItems(items) {
    items.forEach((item) => {
      const { episode, episodes, index, name, nameWithYear, season, useDVDOrder } = item;
      let cache;
      let cacheKey;
      
      if(nameWithYear){
        const _cacheKey = genCacheName(nameWithYear);
        cache = cacheData[_cacheKey];
        cacheKey = _cacheKey;
      }
      
      if(cache){
        const cachedSeasons = useDVDOrder ? cache.dvdSeasons : cache.seasons;
        
        let seriesURL;
        if(cache.id){
          seriesURL = TMDB__URL__SERIES.replace(TMDB__TOKEN__SERIES_ID, cache.id);
        }
    
        if(
          name
          && (season || season === 0)
          && episode
          && cachedSeasons
          && cachedSeasons[season]
          && cachedSeasons[season].episodes[episode]
        ){
          const newName = `${ cache.name } - ${ season }${ buildEpNums(episodes) } - ${ buildEpTitle(cachedSeasons, season, episodes) }`;
          const epThumb = cachedSeasons[season].episodes[episode].thumbnail;
          
          renamed.push({
            cacheKey,
            episodeNdxs: episodes.join('|'),
            epThumb,
            id: cache.id,
            index,
            name: sanitizeName(newName),
            seriesName: cache.name,
            seasonNumber: season,
            seasonOrder: useDVDOrder ? 'dvd' : 'broadcast',
            seriesURL,
          });
        }
        // could be a possible series mis-match or missing cache data
        else if(
          (season || season === 0)
          && episode
        ){
          let errMsg = 'Possible series mis-match';
    
          if(cachedSeasons){
            if(!cachedSeasons[season]){
              errMsg = `Missing season "${ season }" data in cache`;
            }
            else if(!cachedSeasons[season].episodes[episode]){
              errMsg = `Missing episode "${ episode }" data in cache`;
            }
          }
    
          renamed.push({
            error: errMsg,
            id: cache.id,
            index,
            name: cache.name,
            seriesURL,
          });
        }
        // could be a possible series mis-match
        else{
          let msg = '';
    
          if(!season) msg += 'season';
          if(!episode) msg += (msg.length) ? ' & episode' : 'episode';
    
          renamed.push({
            error: `Missing ${ msg }`,
            id: cache.id,
            index,
            name: cache.name,
            seriesURL,
          });
        } 
      }
      // missing data from Client
      else{
        renamed.push({
          error: 'Not enough data for a search',
          index,
          name: name || undefined,
        });
      }
    });
  }
  
  iterateItems(invalidItems);
  iterateItems(validItems);
  
  return renamed;
};

async function scrapeAndCacheSeries({
  caches,
  fanarttvAPIKey,
  idMap,
  nameWithYear,
  seriesID,
  tmdbAPIKey,
}) {
  const { year } = ((nameWithYear.match(/\((?<year>\d{4})\)$/) || {}).groups || {});
  const parsedName = nameWithYear.replace(/\(\d{4}\)$/, '').trim();
  let seriesData;
  let cache;
  let error;
  
  try {
    const payload = await lookUpSeries({
      fanarttvAPIKey,
      id: seriesID,
      seriesName: parsedName,
      seriesYear: year,
      tmdbAPIKey,
    });
    
    if(!payload.error) seriesData = payload;
  }
  catch(err) {
    const msg = `[ERROR] Downloading series data | ${ err.stack }`;
    log(msg);
    error = msg;
  }
  
  if(seriesData){
    // https://kodi.wiki/view/NFO_files/TV_shows#nfo_Tags
    const cacheKey = genCacheName(seriesData.name);
    cache = {
      schema: VERSION__CACHE_SCHEMA,
      scrapeDate: Date.now(),
      genres: seriesData.genres,
      id: seriesData.id, // maps to `uniqueid`
      mpaa: seriesData.mpaa,
      name: seriesData.name, // maps to `title`
      plot: seriesData.plot,
      premiered: seriesData.premiered, // Release date of TV Show. Comes from Aired Date of the first episode.
      status: seriesData.status, // `Continuing` or `Ended` show
      studios: seriesData.studios,
      // NOTE - There are some nodes that have a ton of data, and are placed at the end for readability
      actors: seriesData.actors,
      dvdSeasons: seriesData.dvdSeasons,
      images: seriesData.images,
      seasons: seriesData.seasons,
    };
    
    try {
      await saveCacheItem(cacheKey, cache);
      
      idMap[cache.id] = cacheKey; // eslint-disable-line require-atomic-updates
      caches[cacheKey] = cache;
    }
    catch(err) {
      const msg = `[ERROR] Saving cache for "${ cache.name }" | ${ err.stack }`;
      log(msg);
      error = msg;
    }
  }
  
  return { cache, error };
}

async function startPreview({
  fanarttvAPIKey,
  idMap,
  names,
  res,
  tmdbAPIKey,
}) {
  // If there's no season or episode data, filter it out so there's no chance
  // of any bad data being proccessed.
  const invalidItems = [];
  const validItems = names.reduce((arr, n) => {
    const { episode, season } = n;
    // season can be zero (for specials)
    if(season !== undefined && episode) arr.push(n);
    else invalidItems.push(n);
    return arr;
  }, []);
  
  // Build out a list of unique series items to possibly get data for.
  const uniqueSeriesNames = [];
  const seriesItems = validItems.reduce((arr, item) => {
    const { id, nameWithYear } = item;
    let _nameWithYear = nameWithYear;
    
    // Since numerous things can go wrong with assigned IDs and series with
    // specific years assigned, re-map `nameWithYear` at the very beginning if
    // an `id` is present, to ensure no mixups happen later.
    if(id && idMap[id]){
      _nameWithYear = idMap[id].replace(/_/g, ' ');
      item.nameWithYear = _nameWithYear;
    }
    
    if(nameWithYear && !uniqueSeriesNames.includes(_nameWithYear)) {
      uniqueSeriesNames.push(_nameWithYear);
      arr.push(item);
    }
    
    return arr;
  }, []);
  
  // - Look up series data if it doesn't already exist in the ID cache map.
  // - OR an ID has been cached, but no cache file exists (usually only happens
  //   in test cases, but could happen if a User is moving stuff around).
  // - OR a User has requested a cache update.
  const idsCountBeforeSeriesLookup = Object.keys(idMap).length;
  const caches = {};
  const cacheKeysToIDs = Object.keys(idMap).reduce((obj, id) => {
    obj[idMap[id]] = id;
    return obj;
  }, {});
  let scrapeError;
  for(let i=0; i<seriesItems.length; i++){
    const { id, nameWithYear, updateCache } = seriesItems[i];
    const cacheKey = genCacheName(nameWithYear);
    // `seriesID` will only be defined if the User had to assign an id manually
    const seriesID = id || cacheKeysToIDs[cacheKey];
    let cacheFileExists = false;
    
    try { cacheFileExists = await stat(`${ PUBLIC_CACHE }/${ cacheKey }.json`); }
    catch(err) { /**/ }
    
    if(
      (seriesID && updateCache)
      || (seriesID && !cacheFileExists)
      || !seriesID
    ){
      const { error } = await scrapeAndCacheSeries({
        caches,
        fanarttvAPIKey,
        idMap,
        nameWithYear,
        res,
        seriesID,
        tmdbAPIKey,
      });
      
      if(error){
        scrapeError = error;
        break;
      }
    }
  }
  
  if(scrapeError) return handleError({ res }, 500, scrapeError);
  
  const currentIDsCount = Object.keys(idMap).length;
  let idCacheMapError;
  if(currentIDsCount > idsCountBeforeSeriesLookup){
    try {
      log('New IDs detected');
      await saveIDsCacheMap(idMap);
    }
    catch(err) { idCacheMapError = err.stack; }
  }
  
  let staleDataUpdateError;
  // If a cache map update tried to happen but failed, there's no reason to
  // continue with the Preview
  if(idCacheMapError) handleError({ res }, 500, idCacheMapError);
  else{
    const pendingCacheLookups = [];
    
    for(let i=0; i<uniqueSeriesNames.length; i++){
      const name = uniqueSeriesNames[i];
      const cacheKey = genCacheName(name);
      
      if(caches[cacheKey]) log(`Cache for "${ cacheKey }" already loaded`);
      else pendingCacheLookups.push(loadCacheItem(cacheKey));
    }
    
    let loadedCacheFiles;
    try { loadedCacheFiles = await Promise.all(pendingCacheLookups); }
    catch(err) { handleError({ res }, 500, err); }
    
    if(loadedCacheFiles){
      // Compile a list of currently airing series' and any data that requries
      // an update for a successful scrape.
      const pendingSeriesData = validItems.reduce((obj, { episodes, nameWithYear, season, useDVDOrder }) => {
        const cacheKey = genCacheName(nameWithYear);
        if(!obj[cacheKey]) obj[cacheKey] = { seasons: {}, useDVDOrder };
        if(!obj[cacheKey].seasons[season]) obj[cacheKey].seasons[season] = { episodes: [] };
        obj[cacheKey].seasons[season].episodes.push(...episodes);
        return obj;
      }, {});
      const currDate = new Date();
      
      for(let i=0; i<loadedCacheFiles.length; i++){
        let { data: _cache, error } = loadedCacheFiles[i];
        
        // This error occurs when all the required data is provided for a
        // series lookup, but no ID was provided, and the series wasn't found
        // during the series lookup, so it wasn't pre-populated in the cache.
        // But the cache was able to load based on the `cacheKey`.
        if(!error){
          const { id, name, schema, scrapeDate } = _cache;
          const cacheKey = genCacheName(name);
          const schemaUpdateRequired = !schema || schema < VERSION__CACHE_SCHEMA;
          let staleDataUpdateRequired = false;
          let updateMsg;
          
          if(schemaUpdateRequired){
            updateMsg = `Old schema detected (old: "${ schema }" | new: "${ VERSION__CACHE_SCHEMA }"), forcing an update for: "${ cacheKey }"`;
          }
          else{
            const { seasons, useDVDOrder } = pendingSeriesData[cacheKey];
            const sD = new Date(scrapeDate);
            const ended = _cache.status === 'Ended';
            const sameDay = (
              sD.getDate() === currDate.getDate() 
              && sD.getMonth() === currDate.getMonth()
              && sD.getFullYear() === currDate.getFullYear()
            );
            let reason;
            
            if(
              // If the series is over, it's most likely not getting any new updates
              // so what data is currently cached is probably all there's gonna be.
              !ended
              // If an update's already occurred today, no need to proceed since
              // new data is added after episodes have aired (most likely the next day).
              && !sameDay
            ){
              staleDataUpdateRequired = Object.keys(seasons).some(season => {
                const { episodes } = seasons[season];
                const { episodes: cachedEps } = (useDVDOrder ? _cache.dvdSeasons : _cache.seasons)[season] || {};
                
                // if there's no season data (probably a new season just started)
                if(!cachedEps){
                  reason = 'Missing season data';
                  return true;
                }
                
                // if there's missing episode data
                // - entire episode data (season break, just started airing again)
                // - thumbnail (since they usually get added after the episode's aired for current series')
                const missingEpData = episodes.some(ep => !cachedEps[ep] || !cachedEps[ep].thumbnail);
                if(missingEpData){
                  reason = 'Missing episode data';
                  return true;
                }
                
                return false;
              });
            }
            
            if(staleDataUpdateRequired){
              updateMsg = `Stale data detected: "${ reason }". Forcing an update for: "${ cacheKey }"`;
            }
          }
          
          if(schemaUpdateRequired || staleDataUpdateRequired){
            log(updateMsg);
            
            const { cache, error } = await scrapeAndCacheSeries({
              caches,
              fanarttvAPIKey,
              idMap,
              nameWithYear: name,
              res,
              seriesID: id,
              tmdbAPIKey,
            });
            
            if(error){
              staleDataUpdateError = error;
              break;
            }
            else _cache = cache; // eslint-disable-line require-atomic-updates
          }
          
          caches[cacheKey] = _cache;
        }
      }
    }
  }
  
  if(staleDataUpdateError) return handleError({ res }, 500, staleDataUpdateError);
  
  jsonResp(
    res,
    getEpNamesFromCache({ cacheData: caches, idMap, invalidItems, validItems })
  );
}

export default async function previewRename({ reqData, res }) {
  const names = reqData.names;
  const { data: config, error: configError } = await loadConfig();
  
  if(configError) handleError({ res }, 500, `Error loading config | ${ configError }`);
  else{
    const { fanarttvAPIKey, tmdbAPIKey } = config;
    
    if(!tmdbAPIKey){
      handleError({ res }, 500, 'API key missing for theMovieDB. \nGo to the Config menu and verify the required credentials are present.');
    }
    else if(!fanarttvAPIKey){
      handleError({ res }, 500, 'API key missing for fanart.tv. \nGo to the Config menu and verify the required credentials are present.');
    }
    else{
      const { data: idMap, error } = await loadIDsCacheMap();
      
      if(error) handleError({ res }, 500, `Error loading ID cache map | ${ error }`);
      else startPreview({ fanarttvAPIKey, idMap, names, res, tmdbAPIKey });
    }
  }
}
