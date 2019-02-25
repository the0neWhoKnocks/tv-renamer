import loadFile from './loadFile';
import { PUBLIC_CONFIG } from 'ROOT/conf.app';

export default (cb) => {
  loadFile({ cb, file: PUBLIC_CONFIG });
};