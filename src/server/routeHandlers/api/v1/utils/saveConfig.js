import { PUBLIC_CONFIG } from 'ROOT/conf.app';
import saveFile from 'SERVER/utils/saveFile';

export default (data, res, cb) => {
  saveFile({ cb, data, file: PUBLIC_CONFIG, res });
};