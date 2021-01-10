import { PUBLIC_CONFIG } from 'ROOT/conf.app';
import loadFile from 'SERVER/utils/loadFile';

export default function loadConfig() {
  return loadFile(PUBLIC_CONFIG);
}
