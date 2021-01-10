import jsonResp from 'SERVER/utils/jsonResp';
import loadSeriesIds from './utils/loadSeriesIds';

export default async function getIDs({ res }) {
  const { data: ids } = await loadSeriesIds();
  jsonResp(res, ids);
}
