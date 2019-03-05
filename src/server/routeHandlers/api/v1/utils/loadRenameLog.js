import loadFile from './loadFile';
import { PUBLIC_RENAME_LOG } from 'ROOT/conf.app';

export default (cb) => {
  loadFile({ cb, file: PUBLIC_RENAME_LOG });
};