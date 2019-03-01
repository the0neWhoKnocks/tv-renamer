import {
  TVDB_QUERY_URL,
  TVDB_SERIES_URL,
  TVDB__TOKEN__SERIES_SLUG,
  TVDB__TOKEN__SERIES_QUERY,
} from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import convertNameToSlug from './utils/convertNameToSlug';
import genCacheName from './utils/genCacheName';
import loadCacheItem from './utils/loadCacheItem';
import loadConfig from './utils/loadConfig';
import lookUpSeries from './utils/lookUpSeries';

const getEpNamesFromCache = ({ cacheData, names }) => {
  const renamed = [];
  const _cacheData = {};
  
  // build out a look-up table that's easier to reference
  cacheData.forEach((cacheItem) => {
    _cacheData[cacheItem.cacheKey] = cacheItem;
  });
  
  // get all the episode names
  names.forEach((nameObj) => {
    if(nameObj){
      const { episode, index, name, season } = nameObj;
      
      if(name && season && episode){
        const cacheKey = genCacheName(name).name;
        let cache = _cacheData[cacheKey];
        
        if(!cache) cache = _cacheData[convertNameToSlug(name)];
        
        if(cache && cache.seasons[season]){
          const epNum = (`${ episode }`.length < 2)
            ? `0${ episode }`
            : episode;
            
          renamed.push({
            index,
            name: `${ cache.name } - ${ season }x${ epNum } - ${ cache.seasons[season].episodes[episode] }`,
          });
        }
        // could be a possible series mis-match
        else if(cache){
          renamed.push({
            error: 'Possible series mis-match',
            index,
            name: cache.name,
            seriesURL: TVDB_SERIES_URL.replace(TVDB__TOKEN__SERIES_SLUG, cache.slug),
            searchURL: TVDB_QUERY_URL.replace(TVDB__TOKEN__SERIES_QUERY, encodeURIComponent(name)),
          });
        }
        // tvdb couldn't find a matching item
        else{
          renamed.push({
            error: "TVDB couldn't find a match",
            index,
            name,
            searchURL: TVDB_QUERY_URL.replace(TVDB__TOKEN__SERIES_QUERY, encodeURIComponent(name)),
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
  
  // remove duplicates for the series request
  const uniqueNames = [];
  const cachedItems = [];
  for(let i=0; i<names.length; i++){
    const name = names[i] && names[i].name;
    if(name && !uniqueNames.includes(name)) {
      uniqueNames.push(name);
      cachedItems.push(loadCacheItem(name));
    }
  }
  
  Promise.all(cachedItems)
    .then((_cachedItems) => {
      // If all series' are already cached, don't bother loading config, or
      // doing any series look-ups, jump right to renaming.
      const cache = {};
      let allCached = true;
      
      for(let i=0; i<_cachedItems.length; i++){
        const { file, name } = _cachedItems[i];
        if(!file) allCached = false;
        cache[name] = file;
      }
      
      if(allCached){
        console.log('Skipping config load and series look-ups');
        // TODO - return cached data
        res.end();
      }
      else{
        console.log('Not all items were cached, proceed to look-ups');
        
        loadConfig(({ jwt }) => {
          const pendingSeriesData = uniqueNames.map(
            (name) => lookUpSeries({ cache, jwt, res, seriesName: name })
          );
          
          Promise.all(pendingSeriesData)
            .then((cacheData) => {
              jsonResp(
                res,
                getEpNamesFromCache({ cacheData, names })
              );
            })
            .catch((err) => {
              handleError({ res }, 500, err);
            });
        });
      }
    });
};