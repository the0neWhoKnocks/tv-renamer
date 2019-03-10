import loadFile from './loadFile';
import { PUBLIC_SERIES_ID_MAP } from 'ROOT/conf.app';

export default (cb) => {
  loadFile({ cb, file: PUBLIC_SERIES_ID_MAP });
};