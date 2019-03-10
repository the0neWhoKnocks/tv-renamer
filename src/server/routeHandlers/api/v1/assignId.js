import { PUBLIC_SERIES_ID_MAP } from 'ROOT/conf.app';
import jsonResp from 'SERVER/utils/jsonResp';
import loadSeriesIds from './utils/loadSeriesIds';
import saveFile from './utils/saveFile';

export default ({ reqData, res }) => {
  loadSeriesIds((ids) => {
    const { id, name } = reqData;
    
    // IF the id already exists, add to Array
    if(ids[id] && ids[id].indexOf(name) < 0) ids[id].push(name);
    // ELSE create new item
    else if(!ids[id]) ids[id] = [name];
    
    saveFile({
      cb: () => jsonResp(res, ids),
      data: ids,
      file: PUBLIC_SERIES_ID_MAP,
      res,
    });
  });
};