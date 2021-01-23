import { PUBLIC_SERIES_ID_MAP } from 'ROOT/conf.app';
import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import saveFile from 'SERVER/utils/saveFile';
import genCacheName from './utils/genCacheName';
import loadIDsCacheMap from './utils/loadIDsCacheMap';
import loadSeriesIds from './utils/loadSeriesIds';
import saveIDsCacheMap from './utils/saveIDsCacheMap';

export default async function assignId({ reqData, res }) {
  const { data: idsCache } = await loadIDsCacheMap();
  const { data: ids } = await loadSeriesIds();
  const { assignedName, id, name } = reqData;
  
  if(!assignedName){
    return handleError({ res }, 500, `No assigned name was provided, and one couldn't be determined from \ntmdbID: "${ id }"\nfile name: "${ name }"`);
  }
  
  const cacheKey = genCacheName(assignedName);
  
  // iterate existing ids and delete a duplicate if it exists
  const parsedIds = Object.keys(ids).reduce((_ids, id) => {
    const names = ids[id].filter(n => n !== name);
    // only add the id if the parsed value still has names
    if(names.length) _ids[id] = names;
    return _ids;
  }, {});
  
  // IF the id already exists, add to Array
  if(parsedIds[id] && parsedIds[id].indexOf(name) < 0) parsedIds[id].push(name);
  // ELSE create new item
  else if(!parsedIds[id]) parsedIds[id] = [name];
  
  try {
    idsCache[id] = cacheKey;
    await saveIDsCacheMap(idsCache);
  }
  catch(err) {
    return handleError({ res }, 500, `Error saving the IDs Cache | '${ err.stack }'`);
  }
  
  try {
    await saveFile(PUBLIC_SERIES_ID_MAP, parsedIds);
    jsonResp(res, parsedIds);
  }
  catch(err) {
    handleError({ res }, 500, `Error saving the mapped Series ID | '${ err.stack }'`);
  }
}
