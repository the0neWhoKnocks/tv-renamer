import {
  PUBLIC_SERIES_ID_CACHE_MAP,
  TMDB__TOKEN__SERIES_ID,
  TMDB__URL__SERIES,
} from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import loadFile from 'SERVER/utils/loadFile';
import logger from 'SERVER/utils/logger';
import saveFile from 'SERVER/utils/saveFile';
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
  return episodes.map((ep) => `x${ parseEpNum(ep) }`).join('');
};

const buildEpTitle = (seasons, season, episodes) => {
  const epNames = [];
  
  episodes.forEach((ep) => {
    const epName = seasons[season].episodes[ep];
    
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
    if(cacheItem.error && cacheItem.matches){
      const item = cacheItem.matches[0];
      _cacheData[cacheItem.index] = item;
    }
    else if(cacheItem.error && cacheItem.index){
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
          id: cache.id,
          index,
          name: sanitizeName(newName),
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
      const { id: seriesID, name, updateCache } = names[i] || {};
      
      if(updateCache) updatingCache = true;
      
      if(name && !uniqueNames.includes(name)) {
        uniqueNames.push(name);
        
        if(!updateCache){
          pendingCacheLookups.push(loadCacheItem({ cacheKey: idMap[seriesID], name }));
        }
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
        
        for(let i=0; i<names.length; i++){
          const { id: seriesID, index, name, updateCache } = names[i] || {};
          requestedNames.push({ id: seriesID, index, name });
          if(!updateCache) _cachedItems.push({ ...cacheMap[name], index });
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
          const { cacheKey, file } = cachedItems[i];
          if(!file) allCached = false;
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
          
          loadConfig(({ apiKey }) => {
            if(!apiKey){
              handleError({ res }, 500, 'No `apiKey` found. Unable to make requests to TMDB');
            }
            else{
              const recentlyCached = [];
              const pendingSeriesData = requestedNames.map(
                ({ id, index, name }, ndx) => lookUpSeries({
                  apiKey,
                  cache, 
                  cacheKey: (cachedItems[ndx]) ? cachedItems[ndx].cacheKey : undefined, 
                  id,
                  index,
                  recentlyCached,
                  res,
                  seriesName: name,
                })
              );
              
              Promise.all(pendingSeriesData)
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