import { PUBLIC_RENAME_LOG } from 'ROOT/conf.app';
import loadFile from 'SERVER/utils/loadFile';

export default (cb) => {
  loadFile({ cb, file: PUBLIC_RENAME_LOG });
};