import { PUBLIC_SERIES_ID_MAP } from 'ROOT/conf.app';
import loadFile from 'SERVER/utils/loadFile';

export default function loadSeriesIds() {
  return loadFile(PUBLIC_SERIES_ID_MAP);
}
