import handleError from 'SERVER/routeHandlers/error';
import getFiles from 'SERVER/utils/getFiles';
import jsonResp from 'SERVER/utils/jsonResp';
import sortArrayByProp from 'SERVER/utils/sortArrayByProp';
import filesFilter from './utils/filesFilter';
import loadConfig from './utils/loadConfig';

export default async function getFilesList({ res }) {
  const { data: { sourceFolder } } = await loadConfig();
  
  try {
    const files = await getFiles(sourceFolder, filesFilter);
    // sort by `name` since folder lookups show up first sometimes
    // const sortedFiles = [];
    files.sort(sortArrayByProp('name'));
    
    jsonResp(res, files);
  }
  catch (err) {
    handleError({ res }, 500, `Couldn't get files list | "${ err.stack }"`);
  }
}
