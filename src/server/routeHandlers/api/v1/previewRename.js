import {
  PUBLIC_SERIES_ID_CACHE_MAP,
  VERSION__CACHE_SCHEMA,
  TMDB__TOKEN__SERIES_ID,
  TMDB__URL__SERIES,
} from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import loadFile from 'SERVER/utils/loadFile';
import logger from 'SERVER/utils/logger';
import saveFile from 'SERVER/utils/saveFile';
import genCacheName from './utils/genCacheName';
import loadCacheItem from './utils/loadCacheItem';
import loadConfig from './utils/loadConfig';
import sanitizeName from './utils/sanitizeName';
import lookUpSeries from './utils/tmdb/lookUpSeries';

const log = logger('server:previewRename');

const parseEpNum = (episode) => {
  return (`${ episode }`.length < 2)
    ? `0${ episode }`
    : episode;
};

const buildEpNums = (episodes) => {
  return episodes.map((ndx) => `x${ parseEpNum(ndx) }`).join('');
};

const buildEpTitle = (seasons, season, episodes) => {
  const epNames = [];
  
  episodes.forEach((ndx) => {
    const epName = seasons[season].episodes[ndx].title;
    
    if(epName){
      if(episodes.length > 1){
        const parsedName = epName
          // Multi-part episodes can end with `(1), Part 1, etc`. Those items need
          // to be removed so a comparison can be made to see if the titles are
          // equal.
          .replace(/\s(?:\(\d+\)|Part \d+)$/i, '');
        
        // Only add the name if it doesn't already exist.
        if(epNames.indexOf(parsedName) < 0) epNames.push(parsedName);
      }
      else{
        epNames.push(epName);
      }
    }
  });
  
  return epNames.join(' & ');
};

const getEpNamesFromCache = ({ cacheData, idMap, names }) => {
  const renamed = [];
  const _cacheData = {};
  const _errors = {};
  
  // build out a look-up table that's easier to reference
  cacheData.forEach((cacheItem) => {
    if(cacheItem.error && cacheItem.index){
      _errors[cacheItem.index] = cacheItem.error;
    }
    else if(cacheItem.index){
      _cacheData[cacheItem.index] = cacheItem.cache;
    }
  });
  
  // get all the episode names
  names.forEach((nameObj) => {
    if(nameObj){
      const { episode, episodes, index, name, season, useDVDOrder } = nameObj;
      const cache = _cacheData[index];
      const error = _errors[index];
      let seriesURL;
      let cachedSeasons;
      
      if(cache && cache.id){
        seriesURL = TMDB__URL__SERIES.replace(TMDB__TOKEN__SERIES_ID, cache.id);
      }
      
      if(cache) cachedSeasons = useDVDOrder ? cache.dvdSeasons : cache.seasons;
      
      if(error){
        renamed.push({
          error,
          index,
          name: name || undefined,
        });
      }
      else if(
        name && (season || season === 0) && episode
        && cachedSeasons && cachedSeasons[season]
        && cachedSeasons[season].episodes[episode]
      ){
        const newName = `${ cache.name } - ${ season }${ buildEpNums(episodes) } - ${ buildEpTitle(cachedSeasons, season, episodes) }`;
          
        renamed.push({
          cacheKey: cache.cacheKey,
          episodeNdx: episode,
          id: cache.id,
          index,
          name: sanitizeName(newName),
          seasonNumber: season,
          seriesName: cache.name,
          seriesURL,
        });
      }
      // could be a possible series mis-match or missing cache data
      else if(cache && season && episode){
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
      else if(cache){
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
      // missing data from Client
      else{
        renamed.push({
          error: 'Not enough data for a search',
          index,
          name: name || undefined,
        });
      }
    }
    else{
      log('[PREVIEW] Dunno what happened', nameObj);
      renamed.push(null);
    }
  });
  
  return renamed;
};

export default ({ reqData, res }) => {
  const names = reqData.names;
  
  const startPreview = (idMap) => {
    // remove duplicates for the series request
    const uniqueNames = [];
    const pendingCacheLookups = [];
    let updatingCache = false;
    
    for(let i=0; i<names.length; i++){
      const { id: seriesID, nameWithYear, updateCache } = names[i] || {};
      
      if(updateCache) updatingCache = true;
      
      if(nameWithYear && !uniqueNames.includes(nameWithYear)) {
        uniqueNames.push(nameWithYear);
        pendingCacheLookups.push(loadCacheItem({ cacheKey: idMap[seriesID], name: nameWithYear }));
      }
    }
    
    Promise.all(pendingCacheLookups)
      .then((cachedItems) => {
        const cacheMap = cachedItems.reduce((obj, { name, ...cacheItem }) => {
          obj[name] = cacheItem;
          return obj;
        }, {});
        const _cachedItems = [];
        const requestedNames = [];
        const forcedUpdates = [];
        
        for(let i=0; i<names.length; i++){
          const { id: seriesID, index, name, nameWithYear, updateCache, year } = names[i] || {};
          const currCache = cacheMap[nameWithYear];
          let _updateCache = updateCache;
          
          if(
            !_updateCache
            && (currCache && currCache.file)
            && (!currCache.file.schema || currCache.file.schema < VERSION__CACHE_SCHEMA)
            && !forcedUpdates.includes(currCache.file.name)
          ) {
            log(`Old schema detected, forcing an update for: "${ currCache.file.name }"`);
            _updateCache = true;
            forcedUpdates.push(currCache.file.name);
          }
          
          requestedNames.push({ id: seriesID, index, name, nameWithYear, update: _updateCache, year });
          _cachedItems.push({ ...currCache, index, update: _updateCache });
        }
        
        return {
          cachedItems: _cachedItems,
          requestedNames,
        };
      })
      .then(({ cachedItems, requestedNames }) => {
        // If all series' are already cached, don't bother loading config, or
        // doing any series look-ups, jump right to renaming.
        const cache = {};
        let allCached = !!cachedItems.length;
        
        for(let i=0; i<cachedItems.length; i++){
          const { cacheKey, file, update } = cachedItems[i];
          if(!file || update) allCached = false;
          cache[cacheKey] = file;
        }
        
        if(allCached){
          log('Skipping config load and series look-ups, all items cached');
          jsonResp(
            res,
            getEpNamesFromCache({
              cacheData: cachedItems.map(({ file, index }) => ({
                cache: file,
                index,
              })),
              idMap,
              names,
            })
          );
        }
        else{
          log((updatingCache)
            ? 'Cache update requested, proceed to look-ups'
            : 'Not all items were cached, proceed to look-ups'
          );
          
          loadConfig(({ tmdbAPIKey: apiKey }) => {
            if(!apiKey){
              handleError({ res }, 500, 'No API key found. Unable to make requests to TMDB.\nGo to the Config menu and verify the required credentials are present.');
            }
            else{
              const recentlyCached = [];
              
              // If there's more than one requested name with the same series name,
              // make an initial request so the series gets cached, then finish
              // up the remaining items.
              const seriesRequestsInProgress = [];
              const seriesDataPromise = ({ id, index, name, update, year }, ndx) => lookUpSeries({
                apiKey,
                cache, 
                cacheKey: (cachedItems[ndx]) ? cachedItems[ndx].cacheKey : undefined, 
                id,
                index,
                recentlyCached,
                res,
                seriesName: name,
                seriesYear: year,
                update,
              });
              const pendingSeriesData = requestedNames
                .filter((lookup) => {
                  const { name } = lookup;
                  if(seriesRequestsInProgress.includes(name)) return false;
                  
                  seriesRequestsInProgress.push(name);
                  return true;
                })
                .map(seriesDataPromise);
              
              Promise.all(pendingSeriesData)
                .then((seriesData) => {
                  // Iterate the newly scraped items, and update the `cache` values
                  // so any further lookups don't hit up the external API.
                  seriesData.forEach((data) => {
                    if(data.cache) cache[data.cache.cacheKey] = data.cache;
                    else if(data.error) {
                      const { name: cacheKey } = genCacheName(data.name);
                      cache[cacheKey] = data;
                    }
                  });
                  
                  let pending;
                  
                  if(requestedNames.length === 1 && !updatingCache){
                    // If only one rename was requested, no need for extra churn.
                    pending = [Promise.resolve(seriesData[0])];
                  }
                  else{
                    pending = requestedNames.map((lookup, ndx) => {
                      const { name: cacheKey } = genCacheName(lookup.nameWithYear);
                      const seriesCache = cache[cacheKey];
                      
                      // The `cacheKey` may not always match up because a User
                      // had assigned an ID to another name. In which case the
                      // data's already scraped, so the below doesn't matter.
                      if(seriesCache && seriesCache.error){
                        // If there was an error scraping the series, just return
                        // the same error for the remaining lookups, otherwise
                        // they're all going to keep trying to scrape the data and
                        // most likely get the same error.
                        return Promise.resolve({
                          ...seriesCache,
                          index: lookup.index,
                        });
                      }
                      else{
                        // Map the newly scraped data to the partially set up
                        // items so any further lookups are read from memory.
                        if(seriesCache) cachedItems[ndx].file = cache[cacheKey];
                        
                        if(updatingCache) {
                          const item = cachedItems[ndx];
                          const [, year] = item.file.name.match(/\((\d{4})\)$/) || [];
                          
                          lookup.nameWithYear = item.cacheKey.replace(/_/g, ' ');
                          if(year) lookup.year = year;
                        }
                        
                        // The initial series lookup should've already handled
                        // any updates, so ignore any other updates.
                        if(lookup.update) lookup.update = false;
                        
                        return seriesDataPromise(lookup, ndx);
                      }
                    });  
                  }
                  
                  return Promise.all(pending);
                })
                .then((cacheData) => {
                  const _idMap = { ...idMap };
                  
                  cacheData.forEach((cacheItem) => {
                    if(cacheItem.cache) _idMap[cacheItem.cache.id] = cacheItem.cache.cacheKey;
                  });
                  
                  saveFile({
                    data: _idMap,
                    file: PUBLIC_SERIES_ID_CACHE_MAP,
                    res,
                    cb: () => {
                      jsonResp(
                        res,
                        getEpNamesFromCache({ cacheData, idMap, names })
                      );
                    },
                  });
                })
                .catch((err) => {
                  handleError({ res }, 500, err);
                });
            }
          });
        }
      });
  };
  
  loadFile({
    file: PUBLIC_SERIES_ID_CACHE_MAP,
    cb: (idMap) => {
      startPreview(idMap);
    },
  });
};