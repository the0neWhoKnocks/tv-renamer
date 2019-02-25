import { resolve, sep } from 'path';
import handleError from 'SERVER/routeHandlers/error';
import getDirectoryListing from 'SERVER/utils/getDirectoryListing';
import jsonResp from 'SERVER/utils/jsonResp';

export default ({ reqData, res }) => {
  // if a path isn't specified, start at root of server
  const currentDirectory = (reqData.path)
    ? reqData.path
    // TODO - maybe have a reverse lookup of a folder name instead
    : resolve(__dirname, '../../../../');
  
  getDirectoryListing(currentDirectory)
    .then((folders) => {
      jsonResp(res, {
        current: currentDirectory,
        folders,
        separator: sep,
      });
    })
    .catch((err) => {
      handleError({ res }, 500, err);
    });
};