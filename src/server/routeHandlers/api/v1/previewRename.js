import genCacheName from './utils/genCacheName';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
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
      const { episode, name, season } = nameObj;
      const cacheKey = genCacheName(name).name;
      const cache = _cacheData[cacheKey];
  
      if(
        season && episode
        && cache.seasons[season]
      ){
        const epNum = (`${ episode }`.length < 2)
          ? `0${ episode }`
          : episode;
          
        renamed.push(
          `${ cache.name } - ${ season }x${ epNum } - ${ cache.seasons[season].episodes[episode] }`
        );
      }
      else{
        renamed.push(null);
      }
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