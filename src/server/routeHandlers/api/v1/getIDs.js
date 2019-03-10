import jsonResp from 'SERVER/utils/jsonResp';
import loadSeriesIds from './utils/loadSeriesIds';

export default ({ res }) => {
  loadSeriesIds((logs) => {
    jsonResp(res, logs);
  });
};