import {
  PUBLIC_SERIES_ID_CACHE_MAP,
  TVDB_QUERY_URL,
  TVDB_SERIES_URL,
  TVDB__TOKEN__SERIES_SLUG,
  TVDB__TOKEN__SERIES_QUERY,
} from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import loadCacheItem from './utils/loadCacheItem';
import loadConfig from './utils/loadConfig';
import loadFile from './utils/loadFile';
import lookUpSeries from './utils/lookUpSeries';
import saveFile from './utils/saveFile';

const sanitizeShowName = (name) => {
  return name
    .replace(/:/g, '-')
    .replace(/\?/g, '');
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
      const { episode, index, name, season } = nameObj;
      const cache = _cacheData[index];
      
      if(
        name && season && episode
        && cache && cache.seasons && cache.seasons[season]
      ){
        const epNum = (`${ episode }`.length < 2)
          ? `0${ episode }`
          : episode;
        const newName = `${ cache.name } - ${ season }x${ epNum } - ${ cache.seasons[season].episodes[episode] }`;
          
        renamed.push({
          id: cache.id,
          index,
          name: sanitizeShowName(newName),
        });
      }
      // could be a possible series mis-match
      else if(cache && season && episode){
        renamed.push({
          error: 'Possible series mis-match',
          id: cache.id,
          index,
          name: cache.name,
          seriesURL: TVDB_SERIES_URL.replace(TVDB__TOKEN__SERIES_SLUG, cache.slug),
          searchURL: TVDB_QUERY_URL.replace(TVDB__TOKEN__SERIES_QUERY, encodeURIComponent(name)),
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
          seriesURL: TVDB_SERIES_URL.replace(TVDB__TOKEN__SERIES_SLUG, cache.slug),
          searchURL: TVDB_QUERY_URL.replace(TVDB__TOKEN__SERIES_QUERY, encodeURIComponent(name)),
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
    for(let i=0; i<names.length; i++){
      const nameData = names[i] || {};
      const index = nameData.index;
      const name = nameData.name;
      const tvdbId = nameData.id;
      
      if(name && !uniqueNames.includes(name)) {
        uniqueNames.push({ id: tvdbId, index, name });
        cachedItems.push(loadCacheItem({ cacheKey: idMap[tvdbId], name }));
      }
    }
    
    Promise.all(cachedItems)
      .then((_cachedItems) => {
        // If all series' are already cached, don't bother loading config, or
        // doing any series look-ups, jump right to renaming.
        const cache = {};
        let allCached = true;
        
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
              cacheData: _cachedItems.map((item) => item.file),
              idMap,
              names,
            })
          );
        }
        else{
          console.log('Not all items were cached, proceed to look-ups');
          
          loadConfig(({ jwt }) => {
            const pendingSeriesData = uniqueNames.map(
              ({ id, index, name }, ndx) => lookUpSeries({
                cache, cacheKey: _cachedItems[ndx].cacheKey, id, index, jwt, res, seriesName: name,
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