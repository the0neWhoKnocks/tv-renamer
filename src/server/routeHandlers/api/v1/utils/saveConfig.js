import { PUBLIC_CONFIG } from 'ROOT/conf.app';
import saveFile from 'SERVER/utils/saveFile';

export default function saveConfig(data) {
  return saveFile(PUBLIC_CONFIG, data);
}
