import { PUBLIC_CONFIG } from 'ROOT/conf.app';
import loadFile from 'SERVER/utils/loadFile';

export default (cb) => {
  loadFile({ cb, file: PUBLIC_CONFIG });
};