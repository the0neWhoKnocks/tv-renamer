import { PUBLIC_RENAME_LOG } from 'ROOT/conf.app';
import loadFile from 'SERVER/utils/loadFile';

export default function loadRenameLog() {
  return loadFile(PUBLIC_RENAME_LOG);
}
