import logWith from 'log-with';
import Representation from 'representation';
import reader from 'representation-tool-file-reader';

const logger = logWith(module);
const env = process.env;

try {
  logger.info('Starting app');
  const config = reader('config.yml', env);
  const representation = new Representation(config);
  logger.info('Building');
  representation.build()
    .then(() => {
      logger.info('Done');
    });
} catch (e) {
  logger.error(e);
}
