import jsonResp from 'SERVER/utils/jsonResp';
import loadRenameLog from './utils/loadRenameLog';

export default async function getLogs({ res }) {
  const { data: logs } = await loadRenameLog();
  jsonResp(res, logs);
}
