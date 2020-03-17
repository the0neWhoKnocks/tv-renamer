import { PUBLIC_SERIES_ID_MAP } from 'ROOT/conf.app';
import jsonResp from 'SERVER/utils/jsonResp';
import saveFile from 'SERVER/utils/saveFile';
import loadSeriesIds from './utils/loadSeriesIds';

export default ({ reqData, res }) => {
  loadSeriesIds((ids) => {
    const { id, name } = reqData;
    
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
    
    saveFile({
      cb: () => jsonResp(res, parsedIds),
      data: parsedIds,
      file: PUBLIC_SERIES_ID_MAP,
      res,
    });
  });
};