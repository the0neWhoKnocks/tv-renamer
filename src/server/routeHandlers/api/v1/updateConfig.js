import handleError from 'SERVER/routeHandlers/error';
import jsonResp from 'SERVER/utils/jsonResp';
import saveConfig from './utils/saveConfig';

export default async function updateConfig({ reqData: config, res }) {
  try {
    await saveConfig(config);
    jsonResp(res, config);
  }
  catch (err) {
    handleError({ res }, 500, `Problem updating the config | ${ err.stack }`);
  }
}
