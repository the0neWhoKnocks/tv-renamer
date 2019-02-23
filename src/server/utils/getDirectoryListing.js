import getAccess from './getAccess';
import getFolders from './getFolders';
import readDir from './readDir';

export default (source) => new Promise((resolve, reject) => {
  readDir(source)
    .then((files) => getFolders(files))
    .then(({ folders }) => getAccess(folders))
    .then((folders) => resolve(folders))
    .catch((err) => reject(err));
});