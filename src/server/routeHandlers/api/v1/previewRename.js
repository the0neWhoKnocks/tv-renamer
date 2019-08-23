import {
  PUBLIC_SERIES_ID_CACHE_MAP,
  TVDB_SERIES_URL,
  TVDB__TOKEN__SERIES_SLUG,
} from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import loadFile from 'SERVER/utils/loadFile';
import saveFile from 'SERVER/utils/saveFile';
import loadCacheItem from './utils/loadCacheItem';
import loadConfig from './utils/loadConfig';
import lookUpSeries from './utils/lookUpSeries';
import sanitizeName from './utils/sanitizeName';

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
  
  // build out a look-up table that's easier to reference
  cacheData.forEach((cacheItem) => {
    if(cacheItem.error && cacheItem.matches){
      const item = cacheItem.matches[0];
      _cacheData[cacheItem.index] = item;
    }
    else if(cacheItem.index){
      _cacheData[cacheItem.index] = cacheItem.cache;
    }
  });
  
  // get all the episode names
  names.forEach((nameObj) => {
    if(nameObj){
      const { episode, episodes, index, name, season } = nameObj;
      const cache = _cacheData[index];
      let seriesURL;
      
      if(cache && cache.slug){
        seriesURL = TVDB_SERIES_URL.replace(TVDB__TOKEN__SERIES_SLUG, cache.slug);
      }
      
      if(
        name && (season || season === 0) && episode
        && cache && cache.seasons && cache.seasons[season]
        && cache.seasons[season].episodes[episode]
      ){
        const newName = `${ cache.name } - ${ season }${ buildEpNums(episodes) } - ${ buildEpTitle(cache.seasons, season, episodes) }`;
          
        renamed.push({
          id: cache.id,
          index,
          name: sanitizeName(newName),
          seriesName: cache.name,
        });
      }
      // could be a possible series mis-match or missing cache data
      else if(cache && season && episode){
        let errMsg = 'Possible series mis-match';
        
        if(cache.seasons){
          if(!cache.seasons[season]){
            errMsg = `Missing season "${ season }" data in cache`;
          }
          else if(!cache.seasons[season].episodes[episode]){
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
      console.log('[PREVIEW] Dunno what happened', nameObj);
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
    const cachedItems = [];
    let updatingCache = false;
    for(let i=0; i<names.length; i++){
      const nameData = names[i] || {};
      const index = nameData.index;
      const name = nameData.name;
      const tvdbId = nameData.id;
      const updateCache = nameData.updateCache;
      
      if(updateCache) updatingCache = true;
      
      if(name && !uniqueNames.includes(name)) {
        uniqueNames.push({ id: tvdbId, index, name });
        
        if(!updateCache){
          cachedItems.push(loadCacheItem({ cacheKey: idMap[tvdbId], index, name }));
        }
      }
    }
    
    Promise.all(cachedItems)
      .then((_cachedItems) => {
        // If all series' are already cached, don't bother loading config, or
        // doing any series look-ups, jump right to renaming.
        const cache = {};
        let allCached = !!_cachedItems.length;
        
        for(let i=0; i<_cachedItems.length; i++){
          const { cacheKey, file } = _cachedItems[i];
          if(!file) allCached = false;
          cache[cacheKey] = file;
        }
        
        if(allCached){
          console.log('Skipping config load and series look-ups, all items cached');
          jsonResp(
            res,
            getEpNamesFromCache({
              cacheData: _cachedItems.map(({ file, index }) => ({
                cache: file,
                index,
              })),
              idMap,
              names,
            })
          );
        }
        else{
          console.log((updatingCache)
            ? 'Cache update requested, proceed to look-ups'
            : 'Not all items were cached, proceed to look-ups'
          );
          
          loadConfig(({ jwt }) => {
            const pendingSeriesData = uniqueNames.map(
              ({ id, index, name }, ndx) => lookUpSeries({
                cache, 
                cacheKey: (_cachedItems[ndx]) ? _cachedItems[ndx].cacheKey : undefined, 
                id, index, jwt, res,
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