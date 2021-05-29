import debug from 'debug';

debug.inspectOpts.hideDate = true;

export const ROOT_NAMESPACE = 'tvr';
const rootLogger = debug(ROOT_NAMESPACE);
const logger = (namespace = '') => (namespace)
  ? rootLogger.extend(namespace)
  : rootLogger;

if (process.env.DISABLE_LOGS) debug.disable();
else debug.enable(`${ process.env.DEBUG_NAMESPACE || ROOT_NAMESPACE }:*`);

export default logger;
