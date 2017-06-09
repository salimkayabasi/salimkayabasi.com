import logWith from 'log-with';
import Representation from 'representation';
import Github from 'representation-source-github';
import request from 'request-promise-native';

const logger = logWith(module);

const token = process.env.GITHUB_TOKEN;

const onExit = (err) => {
  logger.error(err);
  process.exit(1);
};

process.on('uncaughtException', onExit);
process.on('unhandledRejection', onExit);
process.on('exit', (code) => {
  logger.error(`About to exit with code: ${code}`);
});

const github = new Github(
  {
    user: 'salimkayabasi',
    token,
  },
  request,
);

const run = async () => {
  const representation = new Representation({
    folder: 'build',
    publish: {
      user: {
        name: 'Salim KAYABASI',
        email: 'salim.kayabasi@gmail.com',
      },
      repo: `https://${token}@github.com/salimkayabasi/salimkayabasi.com.git`,
    },
  });
  await representation
    .addSource(github)
    .generate();
};

run();
