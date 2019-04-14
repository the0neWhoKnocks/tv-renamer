import { PUBLIC_SERIES_ID_MAP } from 'ROOT/conf.app';
import loadFile from 'SERVER/utils/loadFile';

export default (cb) => {
  loadFile({ cb, file: PUBLIC_SERIES_ID_MAP });
};